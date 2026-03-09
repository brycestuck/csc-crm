CREATE TABLE "supplier_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"retailer_id" uuid NOT NULL,
	"eam_user_id" uuid,
	"spm_user_id" uuid,
	"source_customer_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "job_title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "team_partner" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_color" text DEFAULT '#8863b7' NOT NULL;--> statement-breakpoint
ALTER TABLE "supplier_accounts" ADD CONSTRAINT "supplier_accounts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_accounts" ADD CONSTRAINT "supplier_accounts_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_accounts" ADD CONSTRAINT "supplier_accounts_eam_user_id_users_id_fk" FOREIGN KEY ("eam_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_accounts" ADD CONSTRAINT "supplier_accounts_spm_user_id_users_id_fk" FOREIGN KEY ("spm_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_supplier_accounts_supplier" ON "supplier_accounts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_accounts_retailer" ON "supplier_accounts" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_accounts_eam" ON "supplier_accounts" USING btree ("eam_user_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_accounts_spm" ON "supplier_accounts" USING btree ("spm_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_supplier_accounts_supplier_retailer" ON "supplier_accounts" USING btree ("supplier_id","retailer_id");