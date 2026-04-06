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
  const existingHandles = new Set(existingProductsData.map((p: { handle: string }) => p.handle));

  const cat = (name: string) => categoryResult.find((c) => c.name === name)!.id;

  const allProducts = [
    // ── Lansete ────────────────────────────────────────────────────────────────
    {
      title: "Lanseta Crap Pro 3.6m",
      handle: "lanseta-crap-pro-36m",
      category_ids: [cat("Lansete")],
      description: "Lanseta profesionala pentru pescuit la crap, lungime 3.6m. Carbon de inalta calitate, flexibilitate si rezistenta maxima.",
      weight: 350,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "TC", values: ["2.5 lbs", "3 lbs", "3.5 lbs"] }],
      variants: [
        { title: "2.5 lbs", sku: "LANSETA-CRAP-PRO-36M-25TC", options: { TC: "2.5 lbs" }, prices: [{ amount: 54999, currency_code: "ron" }] },
        { title: "3 lbs",   sku: "LANSETA-CRAP-PRO-36M-3TC",  options: { TC: "3 lbs" },   prices: [{ amount: 59999, currency_code: "ron" }] },
        { title: "3.5 lbs", sku: "LANSETA-CRAP-PRO-36M-35TC", options: { TC: "3.5 lbs" }, prices: [{ amount: 64999, currency_code: "ron" }] },
      ],
    },
    {
      title: "Lanseta Crap Marker 3.9m",
      handle: "lanseta-crap-marker-39m",
      category_ids: [cat("Lansete")],
      description: "Lanseta marker 3.9m pentru cartografierea fundului lacului. Actiune rapida, sensibilitate excelenta pentru detectarea obstacolelor subacvatice.",
      weight: 320,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "LANSETA-MARKER-39M", options: { Model: "Standard" }, prices: [{ amount: 69900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Lanseta Spod 3.6m",
      handle: "lanseta-spod-360",
      category_ids: [cat("Lansete")],
      description: "Lanseta spod dedicata nadairii la distanta. Putere de aruncare ridicata, inel de varf intarit pentru fire groase.",
      weight: 380,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "LANSETA-SPOD-36M", options: { Model: "Standard" }, prices: [{ amount: 45900, currency_code: "ron" }] },
      ],
    },
    // ── Mulinete ───────────────────────────────────────────────────────────────
    {
      title: "Mulineta Crap Elite 6000",
      handle: "mulineta-crap-elite-6000",
      category_ids: [cat("Mulinete")],
      description: "Mulineta de inalta performanta pentru pescuit la crap. Sistem de franare puternic, constructie robusta pentru sesiuni lungi.",
      weight: 450,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Marime", values: ["5000", "6000"] }],
      variants: [
        { title: "5000", sku: "MULINETA-ELITE-5000", options: { Marime: "5000" }, prices: [{ amount: 34999, currency_code: "ron" }] },
        { title: "6000", sku: "MULINETA-ELITE-6000", options: { Marime: "6000" }, prices: [{ amount: 39999, currency_code: "ron" }] },
      ],
    },
    {
      title: "Mulineta Free Spool 8000",
      handle: "mulineta-freespool-8000",
      category_ids: [cat("Mulinete")],
      description: "Mulineta cu sistem free spool pentru pescuit la crap nocturn si de distanta. Rulmenti ceramici, ax principal din aluminiu.",
      weight: 520,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "MULINETA-FREESPOOL-8000", options: { Model: "Standard" }, prices: [{ amount: 54900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Mulineta Baitrunner 4000",
      handle: "mulineta-baitrunner-4000",
      category_ids: [cat("Mulinete")],
      description: "Mulineta baitrunner compacta, ideala pentru pescuit la crap si alte specii de fund. Mecanismul baitrunner permite eliberarea firului la muscatura.",
      weight: 390,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "MULINETA-BAITRUNNER-4000", options: { Model: "Standard" }, prices: [{ amount: 29900, currency_code: "ron" }] },
      ],
    },
    // ── Fire ───────────────────────────────────────────────────────────────────
    {
      title: "Fir Monofilament 0.35mm 300m",
      handle: "fir-monofilament-035mm",
      category_ids: [cat("Fire")],
      description: "Fir monofilament premium pentru pescuit la crap. Rezistenta la abraziune, transparenta ridicata, elongatie controlata.",
      weight: 180,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Diametru", values: ["0.30mm", "0.35mm", "0.40mm"] }],
      variants: [
        { title: "0.30mm", sku: "FIR-MONO-030-300M", options: { Diametru: "0.30mm" }, prices: [{ amount: 4499, currency_code: "ron" }] },
        { title: "0.35mm", sku: "FIR-MONO-035-300M", options: { Diametru: "0.35mm" }, prices: [{ amount: 4999, currency_code: "ron" }] },
        { title: "0.40mm", sku: "FIR-MONO-040-300M", options: { Diametru: "0.40mm" }, prices: [{ amount: 5499, currency_code: "ron" }] },
      ],
    },
    {
      title: "Fir Textil 8x 0.16mm 300m",
      handle: "fir-textil-8x-016mm",
      category_ids: [cat("Fire")],
      description: "Fir textil impletit din 8 fire pentru distanta maxima. Diametru redus, rezistenta ridicata, fara elongatie.",
      weight: 120,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Culoare", values: ["Verde", "Maro", "Negru"] }],
      variants: [
        { title: "Verde", sku: "FIR-TEXTIL-8X-016-VERDE", options: { Culoare: "Verde" }, prices: [{ amount: 12900, currency_code: "ron" }] },
        { title: "Maro",  sku: "FIR-TEXTIL-8X-016-MARO",  options: { Culoare: "Maro" },  prices: [{ amount: 12900, currency_code: "ron" }] },
        { title: "Negru", sku: "FIR-TEXTIL-8X-016-NEGRU", options: { Culoare: "Negru" }, prices: [{ amount: 12900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Fir Fluorocarbon Leader 0.40mm 25m",
      handle: "fir-fluorocarbon-040mm",
      category_ids: [cat("Fire")],
      description: "Fir fluorocarbon invizibil in apa pentru montaje leader. Rezistenta ridicata la abraziune, impermeabil, densitate mare.",
      weight: 80,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Diametru", values: ["0.35mm", "0.40mm", "0.50mm"] }],
      variants: [
        { title: "0.35mm", sku: "FIR-FLUORO-035-25M", options: { Diametru: "0.35mm" }, prices: [{ amount: 7900, currency_code: "ron" }] },
        { title: "0.40mm", sku: "FIR-FLUORO-040-25M", options: { Diametru: "0.40mm" }, prices: [{ amount: 8900, currency_code: "ron" }] },
        { title: "0.50mm", sku: "FIR-FLUORO-050-25M", options: { Diametru: "0.50mm" }, prices: [{ amount: 9900, currency_code: "ron" }] },
      ],
    },
    // ── Carlige ────────────────────────────────────────────────────────────────
    {
      title: "Carlige Crap Nr.4 — 25 bucati",
      handle: "carlige-crap-nr4-25buc",
      category_ids: [cat("Carlige")],
      description: "Carlige crap din otel carbon, tratament anti-coroziv. Varful ascutit chimic mentine acrosarea ferm pe toata durata luptei cu pestele.",
      weight: 40,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Marime", values: ["Nr.2", "Nr.4", "Nr.6"] }],
      variants: [
        { title: "Nr.2", sku: "CARLIGE-CRAP-NR2-25BUC", options: { Marime: "Nr.2" }, prices: [{ amount: 4499, currency_code: "ron" }] },
        { title: "Nr.4", sku: "CARLIGE-CRAP-NR4-25BUC", options: { Marime: "Nr.4" }, prices: [{ amount: 3999, currency_code: "ron" }] },
        { title: "Nr.6", sku: "CARLIGE-CRAP-NR6-25BUC", options: { Marime: "Nr.6" }, prices: [{ amount: 3499, currency_code: "ron" }] },
      ],
    },
    {
      title: "Carlige Wide Gape Nr.6 — 10 bucati",
      handle: "carlige-wide-gape-nr6",
      category_ids: [cat("Carlige")],
      description: "Carlige wide gape cu deschidere larga, potrivite pentru montaje cu boilies popup. Otel carbon de inalta calitate.",
      weight: 30,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Marime", values: ["Nr.4", "Nr.6", "Nr.8"] }],
      variants: [
        { title: "Nr.4", sku: "CARLIGE-WG-NR4-10BUC", options: { Marime: "Nr.4" }, prices: [{ amount: 3499, currency_code: "ron" }] },
        { title: "Nr.6", sku: "CARLIGE-WG-NR6-10BUC", options: { Marime: "Nr.6" }, prices: [{ amount: 2999, currency_code: "ron" }] },
        { title: "Nr.8", sku: "CARLIGE-WG-NR8-10BUC", options: { Marime: "Nr.8" }, prices: [{ amount: 2499, currency_code: "ron" }] },
      ],
    },
    {
      title: "Carlige Curve Shank Nr.2 — 8 bucati",
      handle: "carlige-curve-shank-nr2",
      category_ids: [cat("Carlige")],
      description: "Carlige curve shank pentru montaje stiff rig si hair rig. Acrosare superioara, potrivite pentru crap mare.",
      weight: 35,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "CARLIGE-CS-NR2-8BUC", options: { Model: "Standard" }, prices: [{ amount: 3400, currency_code: "ron" }] },
      ],
    },
    // ── Accesorii ──────────────────────────────────────────────────────────────
    {
      title: "Pod Lansete Crap — 3 Posturi",
      handle: "pod-lansete-3posturi",
      category_ids: [cat("Accesorii")],
      description: "Pod lansete din aluminiu anodizat, 3 posturi reglabile in inaltime si unghi. Picioare telescopice, compatibil cu sisteme standard.",
      weight: 2100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "POD-LANSETE-3P", options: { Model: "Standard" }, prices: [{ amount: 34900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Alarma Pescuit + Swinger — Set 4",
      handle: "alarma-swinger-set4",
      category_ids: [cat("Accesorii")],
      description: "Set 4 alarme electronice cu LED si 4 swingere asortate. Sensibilitate reglabila, volum reglabil, rezistente la apa.",
      weight: 800,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "ALARMA-SWINGER-SET4", options: { Model: "Standard" }, prices: [{ amount: 44900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Guta Siliconica Asortata — 10 culori",
      handle: "guta-siliconica-set",
      category_ids: [cat("Accesorii")],
      description: "Set 10 bobine guta siliconica pentru montaje crap. Culori asortate (verde, maro, negru, transparent etc.), diametru 0.5mm.",
      weight: 60,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "GUTA-SILICONICA-SET10", options: { Model: "Standard" }, prices: [{ amount: 5900, currency_code: "ron" }] },
      ],
    },
    // ── Boilies & Momeli ───────────────────────────────────────────────────────
    {
      title: "Boilies Fishmeal 20mm — 5kg",
      handle: "boilies-fishmeal-20mm-5kg",
      category_ids: [cat("Boilies & Momeli")],
      description: "Boilies cu continut ridicat de fainuri de peste, 20mm, 5kg. Foarte atractiv pentru crap mare. Solubilitate ridicata, arome persistente.",
      weight: 5200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Aroma", values: ["Fishmeal Natural", "Fishmeal + Squid"] }],
      variants: [
        { title: "Fishmeal Natural", sku: "BOILIES-FM-20MM-5KG-NAT",  options: { Aroma: "Fishmeal Natural"  }, prices: [{ amount: 14900, currency_code: "ron" }] },
        { title: "Fishmeal + Squid", sku: "BOILIES-FM-20MM-5KG-SQUID", options: { Aroma: "Fishmeal + Squid" }, prices: [{ amount: 15900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Boilies Squid & Octopus 18mm — 3kg",
      handle: "boilies-squid-octopus-3kg",
      category_ids: [cat("Boilies & Momeli")],
      description: "Boilies cu extract de calamar si caracatita, 18mm, 3kg. Aroma marina puternica, eficienta dovedita pentru crap si biban de dimensiuni mari.",
      weight: 3200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        { title: "Standard", sku: "BOILIES-SQUID-18MM-3KG", options: { Model: "Standard" }, prices: [{ amount: 8900, currency_code: "ron" }] },
      ],
    },
    {
      title: "Pop-up Boilies Mix 15mm — 100g",
      handle: "popup-boilies-mix",
      category_ids: [cat("Boilies & Momeli")],
      description: "Pop-up boilies flotante 15mm, mix de arome, 100g. Flotabilitate garantata, culori vii pentru vizibilitate maxima pe fund.",
      weight: 110,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel[0].id }],
      options: [{ title: "Aroma", values: ["Tutti-Frutti", "Vanilie", "Capsuna"] }],
      variants: [
        { title: "Tutti-Frutti", sku: "POPUP-MIX-15MM-TF",  options: { Aroma: "Tutti-Frutti" }, prices: [{ amount: 4900, currency_code: "ron" }] },
        { title: "Vanilie",      sku: "POPUP-MIX-15MM-VAN", options: { Aroma: "Vanilie" },      prices: [{ amount: 4900, currency_code: "ron" }] },
        { title: "Capsuna",      sku: "POPUP-MIX-15MM-CAP", options: { Aroma: "Capsuna" },      prices: [{ amount: 4900, currency_code: "ron" }] },
      ],
    },
  ];

  for (const product of allProducts) {
    if (existingHandles.has(product.handle)) {
      logger.info(`Skipping ${product.handle} (already exists)`);
      continue;
    }
    try {
      await createProductsWorkflow(container).run({ input: { products: [product] } });
      logger.info(`Created: ${product.handle}`);
    } catch (err: unknown) {
      // Medusa errors are plain objects with a .message field, not Error instances
      const msg: string = (err as any)?.message ?? (err as any)?.toString?.() ?? "unknown error";
      if (msg.includes("already exists") || msg.includes("duplicate") || msg.includes("unique")) {
        logger.info(`Skipping ${product.handle} (already exists)`);
      } else {
        logger.error(`Failed to create ${product.handle}: ${msg}`);
        throw err;
      }
    }
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
