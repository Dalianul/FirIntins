import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["ro"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Magazin Online",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Magazin Online",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "ron",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);
  const existingRegions = await regionModuleService.listRegions({ name: "Romania" });
  let region = existingRegions[0];

  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Romania",
            currency_code: "ron",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions({ country_code: countries });
  const existingCountryCodes = existingTaxRegions.map((tr: { country_code: string }) => tr.country_code);
  const missingCountries = countries.filter((c) => !existingCountryCodes.includes(c));
  if (missingCountries.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: missingCountries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const existingLocations = await stockLocationModuleService.listStockLocations({ name: "Depozit Romania" });
  let stockLocation = existingLocations[0];
  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Depozit Romania",
            address: {
              city: "Bucuresti",
              country_code: "RO",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  // Link stock location to fulfillment provider (idempotent — Medusa ignores duplicates)
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (_) { /* already linked */ }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({ name: "Livrare Romania" });
  let fulfillmentSet = existingFulfillmentSets[0];
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Livrare Romania",
      type: "shipping",
      service_zones: [
        {
          name: "Romania",
          geo_zones: [
            {
              country_code: "ro",
              type: "country",
            },
          ],
        },
      ],
    });
  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  } catch (_) { /* already linked */ }

  const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({ name: ["Livrare Standard", "Livrare Express"] });
  if (existingShippingOptions.length === 0) {
    await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Livrare Standard",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Livrare in 3-5 zile lucratoare.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "ron",
            amount: 1999,
          },
          {
            region_id: region.id,
            amount: 1999,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Livrare Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Livrare in 24 ore.",
          code: "express",
        },
        prices: [
          {
            currency_code: "ron",
            amount: 3999,
          },
          {
            region_id: region.id,
            amount: 3999,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  }
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Magazin Online",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info(`Publishable API key token: ${(publishableApiKey as any).token ?? "(token not exposed — check Medusa admin Settings → API Keys)"}`);
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product categories...");
  const allCategoryNames = ["Lansete", "Mulinete", "Fire", "Carlige", "Accesorii", "Boilies & Momeli"];
  const { data: existingCatsData } = await query.graph({ entity: "product_category", fields: ["id", "name"] });
  const existingCategoryNames = existingCatsData.map((c: { name: string }) => c.name);
  const missingCategoryNames = allCategoryNames.filter((n) => !existingCategoryNames.includes(n));
  let categoryResult: { id: string; name: string }[] = existingCatsData.filter((c: { name: string }) => allCategoryNames.includes(c.name));
  if (missingCategoryNames.length > 0) {
    const { result: newCategories } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategoryNames.map((name) => ({ name, is_active: true })),
      },
    });
    categoryResult = [...categoryResult, ...newCategories];
  }
  logger.info("Finished seeding product categories.");

  logger.info("Seeding product data...");
  const { data: existingProductsData } = await query.graph({ entity: "product", fields: ["handle"] });
  const existingHandles = existingProductsData.map((p: { handle: string }) => p.handle);
  if (!existingHandles.includes("lanseta-crap-pro-36m") && !existingHandles.includes("mulineta-crap-elite-6000")) {
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Lanseta Crap Pro 3.6m",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Lansete")!.id,
          ],
          description:
            "Lanseta profesionala pentru pescuit la crap, lungime 3.6m. Construita din carbon de inalta calitate pentru flexibilitate si rezistenta maxima.",
          handle: "lanseta-crap-pro-36m",
          weight: 350,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            {
              title: "TC",
              values: ["2.5 lbs", "3 lbs", "3.5 lbs"],
            },
          ],
          variants: [
            {
              title: "2.5 lbs",
              sku: "LANSETA-CRAP-PRO-36M-2.5TC",
              options: { TC: "2.5 lbs" },
              prices: [
                { amount: 54999, currency_code: "ron" },
              ],
            },
            {
              title: "3 lbs",
              sku: "LANSETA-CRAP-PRO-36M-3TC",
              options: { TC: "3 lbs" },
              prices: [
                { amount: 59999, currency_code: "ron" },
              ],
            },
            {
              title: "3.5 lbs",
              sku: "LANSETA-CRAP-PRO-36M-3.5TC",
              options: { TC: "3.5 lbs" },
              prices: [
                { amount: 64999, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Mulineta Crap Elite 6000",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Mulinete")!.id,
          ],
          description:
            "Mulineta de inalta performanta pentru pescuit la crap. Sistem de franare puternic, constructie robusta, potrivita pentru sesiuni lungi de pescuit.",
          handle: "mulineta-crap-elite-6000",
          weight: 450,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            {
              title: "Marime",
              values: ["5000", "6000"],
            },
          ],
          variants: [
            {
              title: "5000",
              sku: "MULINETA-CRAP-ELITE-5000",
              options: { Marime: "5000" },
              prices: [
                { amount: 34999, currency_code: "ron" },
              ],
            },
            {
              title: "6000",
              sku: "MULINETA-CRAP-ELITE-6000",
              options: { Marime: "6000" },
              prices: [
                { amount: 39999, currency_code: "ron" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const existingLevels = await inventoryModuleService.listInventoryLevels({ location_id: stockLocation.id });
  const existingItemIds = new Set(existingLevels.map((l: { inventory_item_id: string }) => l.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (!existingItemIds.has(inventoryItem.id)) {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: inventoryItem.id,
      });
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  }
  logger.info("Finished seeding inventory levels.");
}
