import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260322113618 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "wishlist_item" ("id" text not null, "wishlist_id" text not null, "product_id" text not null, "variant_id" text not null default \'\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wishlist_item_pkey" primary key ("id"));'
    )
    this.addSql(
      'create unique index if not exists "idx_wishlist_item_wishlist_id_product_id_variant_id" on "wishlist_item" ("wishlist_id", "product_id", "variant_id");'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "wishlist_item" cascade;')
  }
}
