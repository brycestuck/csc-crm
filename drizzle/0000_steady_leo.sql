CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"task_id" uuid,
	"user_id" uuid,
	"activity_type" text NOT NULL,
	"subject" text NOT NULL,
	"body" text,
	"contact_name" text,
	"contact_type" text DEFAULT 'internal' NOT NULL,
	"email_message_id" text,
	"happened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"department_id" uuid,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"position" text,
	"season_coverage" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"graph_event_id" text NOT NULL,
	"title" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"project_id" uuid,
	"task_id" uuid,
	"sync_direction" text DEFAULT 'bidirectional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "calendar_events_graph_event_id_unique" UNIQUE("graph_event_id")
);
--> statement-breakpoint
CREATE TABLE "cashflow_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_date" date NOT NULL,
	"entry_type" text NOT NULL,
	"category" text,
	"amount" numeric(12, 2) NOT NULL,
	"account" text,
	"supplier_id" uuid,
	"description" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"source" text,
	"logged_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"storage_path" text,
	"file_type" text,
	"size_bytes" integer,
	"supplier_id" uuid,
	"project_id" uuid,
	"retailer_id" uuid,
	"department_id" uuid,
	"buyer_id" uuid,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"graph_message_id" text NOT NULL,
	"internet_message_id" text,
	"thread_id" text,
	"from_email" text,
	"subject" text NOT NULL,
	"snippet" text,
	"received_at" timestamp with time zone NOT NULL,
	"is_unmatched" boolean DEFAULT true NOT NULL,
	"matched_project_id" uuid,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_messages_graph_message_id_unique" UNIQUE("graph_message_id")
);
--> statement-breakpoint
CREATE TABLE "import_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_run_id" uuid NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"row_ref" text,
	"column_ref" text,
	"message" text NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_by_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "microsoft_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" text,
	"graph_user_id" text,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pipeline_stages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label" text NOT NULL,
	"due_date" date,
	"status" text DEFAULT 'not_started' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"changed_by_user_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"retailer_id" uuid NOT NULL,
	"department_id" uuid,
	"buyer_id" uuid,
	"owner_user_id" uuid,
	"pipeline_stage_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"walmart_week_target" text,
	"mod_effective_date" date,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recurring_task_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"supplier_id" uuid,
	"retailer_id" uuid,
	"department_id" uuid,
	"buyer_id" uuid,
	"owner_user_id" uuid,
	"cadence" text DEFAULT 'weekly' NOT NULL,
	"weekday" integer,
	"day_of_month" integer,
	"default_due_offset_days" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "retailer_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"retailer_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"season_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "retailers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"calendar_type" text DEFAULT 'standard' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "retailers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "supplier_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"title" text,
	"notes" text,
	"contact_role" text DEFAULT 'sales' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "supplier_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"reference_period" text,
	"amount" numeric(12, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"received_at" timestamp with time zone,
	"due_date" date,
	"source_format" text,
	"notes" text,
	"logged_by_user_id" uuid,
	"linked_activity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_user_id" uuid,
	"summary" text,
	"notes" text,
	"commission_structure_type" text,
	"reporting_cadence" text DEFAULT 'monthly' NOT NULL,
	"bdf_monthly_amount" numeric(12, 2),
	"bdf_sales_threshold" numeric(12, 2),
	"payment_terms" text,
	"requires_data_chase" boolean DEFAULT false NOT NULL,
	"finance_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"supplier_id" uuid,
	"retailer_id" uuid,
	"department_id" uuid,
	"buyer_id" uuid,
	"owner_user_id" uuid,
	"recurring_template_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"source_type" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"ms_oid" text,
	"role" text DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_ms_oid_unique" UNIQUE("ms_oid")
);
--> statement-breakpoint
CREATE TABLE "walmart_calendar_reference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walmart_year_week" text NOT NULL,
	"walmart_week" integer NOT NULL,
	"calendar_date" date NOT NULL,
	"mod_effective_date" date,
	"task_due_date" date,
	"day_name" text,
	"quarter" integer,
	"month_number" integer,
	"month_name" text,
	"check_in_date_begins" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_department_id_retailer_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."retailer_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashflow_entries" ADD CONSTRAINT "cashflow_entries_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashflow_entries" ADD CONSTRAINT "cashflow_entries_logged_by_user_id_users_id_fk" FOREIGN KEY ("logged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_department_id_retailer_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."retailer_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_matched_project_id_projects_id_fk" FOREIGN KEY ("matched_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microsoft_connections" ADD CONSTRAINT "microsoft_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_from_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_to_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stage_history" ADD CONSTRAINT "project_stage_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_department_id_retailer_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."retailer_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_pipeline_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("pipeline_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_department_id_retailer_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."retailer_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_task_templates" ADD CONSTRAINT "recurring_task_templates_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_departments" ADD CONSTRAINT "retailer_departments_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_transactions" ADD CONSTRAINT "supplier_transactions_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_transactions" ADD CONSTRAINT "supplier_transactions_logged_by_user_id_users_id_fk" FOREIGN KEY ("logged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_transactions" ADD CONSTRAINT "supplier_transactions_linked_activity_id_activities_id_fk" FOREIGN KEY ("linked_activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_department_id_retailer_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."retailer_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recurring_template_id_recurring_task_templates_id_fk" FOREIGN KEY ("recurring_template_id") REFERENCES "public"."recurring_task_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_project" ON "activities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_activities_type" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_activities_happened_at" ON "activities" USING btree ("happened_at");--> statement-breakpoint
CREATE INDEX "idx_activities_email_message" ON "activities" USING btree ("email_message_id");--> statement-breakpoint
CREATE INDEX "idx_buyers_retailer" ON "buyers" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_buyers_department" ON "buyers" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_buyers_email" ON "buyers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_user" ON "calendar_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_project" ON "calendar_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_task" ON "calendar_events" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_start_at" ON "calendar_events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "idx_cashflow_entries_date" ON "cashflow_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "idx_cashflow_entries_type" ON "cashflow_entries" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "idx_cashflow_entries_account" ON "cashflow_entries" USING btree ("account");--> statement-breakpoint
CREATE INDEX "idx_cashflow_entries_supplier" ON "cashflow_entries" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_documents_project" ON "documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_documents_supplier" ON "documents" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_documents_source" ON "documents" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_email_messages_user" ON "email_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_messages_unmatched" ON "email_messages" USING btree ("is_unmatched");--> statement-breakpoint
CREATE INDEX "idx_email_messages_matched_project" ON "email_messages" USING btree ("matched_project_id");--> statement-breakpoint
CREATE INDEX "idx_email_messages_received_at" ON "email_messages" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "idx_import_issues_run" ON "import_issues" USING btree ("import_run_id");--> statement-breakpoint
CREATE INDEX "idx_import_issues_severity" ON "import_issues" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_import_issues_resolved" ON "import_issues" USING btree ("resolved");--> statement-breakpoint
CREATE INDEX "idx_import_runs_status" ON "import_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_import_runs_source" ON "import_runs" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "idx_job_runs_name" ON "job_runs" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX "idx_job_runs_status" ON "job_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_microsoft_connections_user" ON "microsoft_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_microsoft_connections_status" ON "microsoft_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pipeline_stages_order" ON "pipeline_stages" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_project_milestones_project" ON "project_milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_milestones_status" ON "project_milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_project_stage_history_project" ON "project_stage_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_stage_history_changed_at" ON "project_stage_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_projects_supplier" ON "projects" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_projects_retailer" ON "projects" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_projects_department" ON "projects" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_projects_buyer" ON "projects" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_stage" ON "projects" USING btree ("pipeline_stage_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_recurring_task_templates_owner" ON "recurring_task_templates" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_recurring_task_templates_cadence" ON "recurring_task_templates" USING btree ("cadence");--> statement-breakpoint
CREATE INDEX "idx_retailer_departments_retailer" ON "retailer_departments" USING btree ("retailer_id");--> statement-breakpoint
CREATE INDEX "idx_retailer_departments_code" ON "retailer_departments" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_retailers_name" ON "retailers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_supplier" ON "supplier_contacts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_email" ON "supplier_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_role" ON "supplier_contacts" USING btree ("contact_role");--> statement-breakpoint
CREATE INDEX "idx_supplier_transactions_supplier" ON "supplier_transactions" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_transactions_type" ON "supplier_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_supplier_transactions_period" ON "supplier_transactions" USING btree ("reference_period");--> statement-breakpoint
CREATE INDEX "idx_supplier_transactions_status" ON "supplier_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_suppliers_name" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_suppliers_owner" ON "suppliers" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_owner" ON "tasks" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_due_date" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_walmart_calendar_reference_year_week" ON "walmart_calendar_reference" USING btree ("walmart_year_week");--> statement-breakpoint
CREATE INDEX "idx_walmart_calendar_reference_date" ON "walmart_calendar_reference" USING btree ("calendar_date");