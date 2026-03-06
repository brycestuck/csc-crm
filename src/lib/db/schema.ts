import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  ActivityContactType,
  ActivityType,
  CalendarSyncDirection,
  CashflowAccount,
  CashflowCategory,
  CashflowEntryType,
  CashflowSource,
  CommissionStructureType,
  DocumentKind,
  DocumentSource,
  ImportIssueSeverity,
  ImportStatus,
  JobRunStatus,
  MicrosoftConnectionStatus,
  ProjectMilestoneStatus,
  ProjectPriority,
  ProjectStatus,
  RecurringCadence,
  ReportingCadence,
  RetailerCalendarType,
  SupplierContactRole,
  SupplierTransactionSourceFormat,
  SupplierTransactionStatus,
  SupplierTransactionType,
  TaskSourceType,
  TaskStatus,
  UserRole,
} from "@/lib/types/domain";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    msOid: text("ms_oid").unique(),
    role: text("role").$type<UserRole>().notNull().default("member"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    roleIdx: index("idx_users_role").on(table.role),
  })
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    summary: text("summary"),
    notes: text("notes"),
    commissionStructureType: text("commission_structure_type").$type<CommissionStructureType | null>(),
    reportingCadence: text("reporting_cadence").$type<ReportingCadence>().notNull().default("monthly"),
    bdfMonthlyAmount: numeric("bdf_monthly_amount", { precision: 12, scale: 2 }),
    bdfSalesThreshold: numeric("bdf_sales_threshold", { precision: 12, scale: 2 }),
    paymentTerms: text("payment_terms"),
    requiresDataChase: boolean("requires_data_chase").notNull().default(false),
    financeNotes: text("finance_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    nameIdx: index("idx_suppliers_name").on(table.name),
    ownerIdx: index("idx_suppliers_owner").on(table.ownerUserId),
  })
);

export const supplierContacts = pgTable(
  "supplier_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    title: text("title"),
    notes: text("notes"),
    contactRole: text("contact_role").$type<SupplierContactRole>().notNull().default("sales"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    supplierIdx: index("idx_supplier_contacts_supplier").on(table.supplierId),
    emailIdx: index("idx_supplier_contacts_email").on(table.email),
    roleIdx: index("idx_supplier_contacts_role").on(table.contactRole),
  })
);

export const retailers = pgTable(
  "retailers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    calendarType: text("calendar_type").$type<RetailerCalendarType>().notNull().default("standard"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    nameIdx: index("idx_retailers_name").on(table.name),
  })
);

export const retailerDepartments = pgTable(
  "retailer_departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    retailerId: uuid("retailer_id")
      .notNull()
      .references(() => retailers.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    seasonNotes: text("season_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    retailerIdx: index("idx_retailer_departments_retailer").on(table.retailerId),
    codeIdx: index("idx_retailer_departments_code").on(table.code),
  })
);

export const buyers = pgTable(
  "buyers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    retailerId: uuid("retailer_id")
      .notNull()
      .references(() => retailers.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => retailerDepartments.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    position: text("position"),
    seasonCoverage: text("season_coverage"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    retailerIdx: index("idx_buyers_retailer").on(table.retailerId),
    departmentIdx: index("idx_buyers_department").on(table.departmentId),
    emailIdx: index("idx_buyers_email").on(table.email),
  })
);

export const pipelineStages = pgTable(
  "pipeline_stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    displayOrder: integer("display_order").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index("idx_pipeline_stages_order").on(table.displayOrder),
  })
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    retailerId: uuid("retailer_id")
      .notNull()
      .references(() => retailers.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => retailerDepartments.id, {
      onDelete: "set null",
    }),
    buyerId: uuid("buyer_id").references(() => buyers.id, { onDelete: "set null" }),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    pipelineStageId: uuid("pipeline_stage_id").references(() => pipelineStages.id, {
      onDelete: "set null",
    }),
    status: text("status").$type<ProjectStatus>().notNull().default("active"),
    priority: text("priority").$type<ProjectPriority>().notNull().default("medium"),
    walmartWeekTarget: text("walmart_week_target"),
    modEffectiveDate: date("mod_effective_date"),
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    supplierIdx: index("idx_projects_supplier").on(table.supplierId),
    retailerIdx: index("idx_projects_retailer").on(table.retailerId),
    departmentIdx: index("idx_projects_department").on(table.departmentId),
    buyerIdx: index("idx_projects_buyer").on(table.buyerId),
    ownerIdx: index("idx_projects_owner").on(table.ownerUserId),
    stageIdx: index("idx_projects_stage").on(table.pipelineStageId),
    statusIdx: index("idx_projects_status").on(table.status),
  })
);

export const projectStageHistory = pgTable(
  "project_stage_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fromStageId: uuid("from_stage_id").references(() => pipelineStages.id, {
      onDelete: "set null",
    }),
    toStageId: uuid("to_stage_id")
      .notNull()
      .references(() => pipelineStages.id, { onDelete: "restrict" }),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("idx_project_stage_history_project").on(table.projectId),
    changedAtIdx: index("idx_project_stage_history_changed_at").on(table.changedAt),
  })
);

export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    dueDate: date("due_date"),
    status: text("status").$type<ProjectMilestoneStatus>().notNull().default("not_started"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    projectIdx: index("idx_project_milestones_project").on(table.projectId),
    statusIdx: index("idx_project_milestones_status").on(table.status),
  })
);

export const recurringTaskTemplates = pgTable(
  "recurring_task_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    retailerId: uuid("retailer_id").references(() => retailers.id, { onDelete: "set null" }),
    departmentId: uuid("department_id").references(() => retailerDepartments.id, {
      onDelete: "set null",
    }),
    buyerId: uuid("buyer_id").references(() => buyers.id, { onDelete: "set null" }),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    cadence: text("cadence").$type<RecurringCadence>().notNull().default("weekly"),
    weekday: integer("weekday"),
    dayOfMonth: integer("day_of_month"),
    defaultDueOffsetDays: integer("default_due_offset_days").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    ownerIdx: index("idx_recurring_task_templates_owner").on(table.ownerUserId),
    cadenceIdx: index("idx_recurring_task_templates_cadence").on(table.cadence),
  })
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    retailerId: uuid("retailer_id").references(() => retailers.id, { onDelete: "set null" }),
    departmentId: uuid("department_id").references(() => retailerDepartments.id, {
      onDelete: "set null",
    }),
    buyerId: uuid("buyer_id").references(() => buyers.id, { onDelete: "set null" }),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    recurringTemplateId: uuid("recurring_template_id").references(() => recurringTaskTemplates.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().notNull().default("todo"),
    priority: text("priority").$type<ProjectPriority>().notNull().default("medium"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sourceType: text("source_type").$type<TaskSourceType>().notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    projectIdx: index("idx_tasks_project").on(table.projectId),
    ownerIdx: index("idx_tasks_owner").on(table.ownerUserId),
    statusIdx: index("idx_tasks_status").on(table.status),
    dueDateIdx: index("idx_tasks_due_date").on(table.dueDate),
  })
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    activityType: text("activity_type").$type<ActivityType>().notNull(),
    subject: text("subject").notNull(),
    body: text("body"),
    contactName: text("contact_name"),
    contactType: text("contact_type").$type<ActivityContactType>().notNull().default("internal"),
    emailMessageId: text("email_message_id"),
    happenedAt: timestamp("happened_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    projectIdx: index("idx_activities_project").on(table.projectId),
    typeIdx: index("idx_activities_type").on(table.activityType),
    happenedAtIdx: index("idx_activities_happened_at").on(table.happenedAt),
    emailMessageIdx: index("idx_activities_email_message").on(table.emailMessageId),
  })
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: text("kind").$type<DocumentKind>().notNull(),
    source: text("source").$type<DocumentSource>().notNull().default("manual"),
    name: text("name").notNull(),
    url: text("url"),
    storagePath: text("storage_path"),
    fileType: text("file_type"),
    sizeBytes: integer("size_bytes"),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    retailerId: uuid("retailer_id").references(() => retailers.id, { onDelete: "set null" }),
    departmentId: uuid("department_id").references(() => retailerDepartments.id, {
      onDelete: "set null",
    }),
    buyerId: uuid("buyer_id").references(() => buyers.id, { onDelete: "set null" }),
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    projectIdx: index("idx_documents_project").on(table.projectId),
    supplierIdx: index("idx_documents_supplier").on(table.supplierId),
    sourceIdx: index("idx_documents_source").on(table.source),
  })
);

export const microsoftConnections = pgTable(
  "microsoft_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id"),
    graphUserId: text("graph_user_id"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    scopes: jsonb("scopes")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: text("status").$type<MicrosoftConnectionStatus>().notNull().default("active"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_microsoft_connections_user").on(table.userId),
    statusIdx: index("idx_microsoft_connections_status").on(table.status),
  })
);

export const emailMessages = pgTable(
  "email_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    graphMessageId: text("graph_message_id").notNull().unique(),
    internetMessageId: text("internet_message_id"),
    threadId: text("thread_id"),
    fromEmail: text("from_email"),
    subject: text("subject").notNull(),
    snippet: text("snippet"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    isUnmatched: boolean("is_unmatched").notNull().default(true),
    matchedProjectId: uuid("matched_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_email_messages_user").on(table.userId),
    unmatchedIdx: index("idx_email_messages_unmatched").on(table.isUnmatched),
    matchedProjectIdx: index("idx_email_messages_matched_project").on(table.matchedProjectId),
    receivedAtIdx: index("idx_email_messages_received_at").on(table.receivedAt),
  })
);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    graphEventId: text("graph_event_id").notNull().unique(),
    title: text("title").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    syncDirection: text("sync_direction")
      .$type<CalendarSyncDirection>()
      .notNull()
      .default("bidirectional"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("idx_calendar_events_user").on(table.userId),
    projectIdx: index("idx_calendar_events_project").on(table.projectId),
    taskIdx: index("idx_calendar_events_task").on(table.taskId),
    startAtIdx: index("idx_calendar_events_start_at").on(table.startAt),
  })
);

export const walmartCalendarReference = pgTable(
  "walmart_calendar_reference",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    walmartYearWeek: text("walmart_year_week").notNull(),
    walmartWeek: integer("walmart_week").notNull(),
    calendarDate: date("calendar_date").notNull(),
    modEffectiveDate: date("mod_effective_date"),
    taskDueDate: date("task_due_date"),
    dayName: text("day_name"),
    quarter: integer("quarter"),
    monthNumber: integer("month_number"),
    monthName: text("month_name"),
    checkInDateBegins: date("check_in_date_begins"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    yearWeekIdx: index("idx_walmart_calendar_reference_year_week").on(table.walmartYearWeek),
    dateIdx: index("idx_walmart_calendar_reference_date").on(table.calendarDate),
  })
);

export const importRuns = pgTable(
  "import_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceType: text("source_type").notNull(),
    fileName: text("file_name").notNull(),
    status: text("status").$type<ImportStatus>().notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    statusIdx: index("idx_import_runs_status").on(table.status),
    sourceIdx: index("idx_import_runs_source").on(table.sourceType),
  })
);

export const importIssues = pgTable(
  "import_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    importRunId: uuid("import_run_id")
      .notNull()
      .references(() => importRuns.id, { onDelete: "cascade" }),
    severity: text("severity").$type<ImportIssueSeverity>().notNull().default("warning"),
    rowRef: text("row_ref"),
    columnRef: text("column_ref"),
    message: text("message").notNull(),
    rawPayload: jsonb("raw_payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    runIdx: index("idx_import_issues_run").on(table.importRunId),
    severityIdx: index("idx_import_issues_severity").on(table.severity),
    resolvedIdx: index("idx_import_issues_resolved").on(table.resolved),
  })
);

export const jobRuns = pgTable(
  "job_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobName: text("job_name").notNull(),
    status: text("status").$type<JobRunStatus>().notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    summary: text("summary"),
  },
  (table) => ({
    jobNameIdx: index("idx_job_runs_name").on(table.jobName),
    statusIdx: index("idx_job_runs_status").on(table.status),
  })
);

export const supplierTransactions = pgTable(
  "supplier_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    transactionType: text("transaction_type").$type<SupplierTransactionType>().notNull(),
    referencePeriod: text("reference_period"),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    status: text("status").$type<SupplierTransactionStatus>().notNull().default("pending"),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    dueDate: date("due_date"),
    sourceFormat: text("source_format").$type<SupplierTransactionSourceFormat>(),
    notes: text("notes"),
    loggedByUserId: uuid("logged_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    linkedActivityId: uuid("linked_activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    supplierIdx: index("idx_supplier_transactions_supplier").on(table.supplierId),
    typeIdx: index("idx_supplier_transactions_type").on(table.transactionType),
    periodIdx: index("idx_supplier_transactions_period").on(table.referencePeriod),
    statusIdx: index("idx_supplier_transactions_status").on(table.status),
  })
);

export const cashflowEntries = pgTable(
  "cashflow_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entryDate: date("entry_date").notNull(),
    entryType: text("entry_type").$type<CashflowEntryType>().notNull(),
    category: text("category").$type<CashflowCategory>(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    account: text("account").$type<CashflowAccount>(),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    description: text("description"),
    isRecurring: boolean("is_recurring").notNull().default(false),
    source: text("source").$type<CashflowSource>(),
    loggedByUserId: uuid("logged_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    dateIdx: index("idx_cashflow_entries_date").on(table.entryDate),
    typeIdx: index("idx_cashflow_entries_type").on(table.entryType),
    accountIdx: index("idx_cashflow_entries_account").on(table.account),
    supplierIdx: index("idx_cashflow_entries_supplier").on(table.supplierId),
  })
);
