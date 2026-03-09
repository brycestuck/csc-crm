export const userRoles = ["admin", "member"] as const;
export type UserRole = (typeof userRoles)[number];

export const commissionStructureTypes = [
  "percentage",
  "tiered",
  "draw",
  "custom",
] as const;
export type CommissionStructureType = (typeof commissionStructureTypes)[number];

export const reportingCadences = ["monthly", "quarterly"] as const;
export type ReportingCadence = (typeof reportingCadences)[number];

export const supplierContactRoles = [
  "sales",
  "finance",
  "executive",
  "operations",
  "other",
] as const;
export type SupplierContactRole = (typeof supplierContactRoles)[number];

export const retailerCalendarTypes = ["walmart_fiscal", "standard", "custom"] as const;
export type RetailerCalendarType = (typeof retailerCalendarTypes)[number];

export const projectStatuses = [
  "active",
  "on_hold",
  "won",
  "lost",
  "cancelled",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const projectPriorities = ["high", "medium", "low"] as const;
export type ProjectPriority = (typeof projectPriorities)[number];

export const projectMilestoneStatuses = [
  "not_started",
  "in_progress",
  "done",
  "blocked",
] as const;
export type ProjectMilestoneStatus = (typeof projectMilestoneStatuses)[number];

export const taskStatuses = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const recurringCadences = ["weekly", "biweekly", "monthly"] as const;
export type RecurringCadence = (typeof recurringCadences)[number];

export const taskSourceTypes = ["manual", "import", "email_sync", "recurring"] as const;
export type TaskSourceType = (typeof taskSourceTypes)[number];

export const activityTypes = [
  "email_sent",
  "email_received",
  "call",
  "meeting",
  "sample_shipped",
  "sample_received",
  "internal_note",
  "follow_up",
  "commission_report_received",
  "invoice_sent",
  "payment_received",
  "payment_sent",
  "data_requested",
  "data_received",
  "financial_note",
  "budget_update",
] as const;
export type ActivityType = (typeof activityTypes)[number];

export const activityContactTypes = ["buyer", "supplier_contact", "internal"] as const;
export type ActivityContactType = (typeof activityContactTypes)[number];

export const documentKinds = ["link", "upload"] as const;
export type DocumentKind = (typeof documentKinds)[number];

export const documentSources = ["manual", "upload", "microsoft"] as const;
export type DocumentSource = (typeof documentSources)[number];

export const microsoftConnectionStatuses = ["active", "expired", "revoked"] as const;
export type MicrosoftConnectionStatus = (typeof microsoftConnectionStatuses)[number];

export const calendarSyncDirections = ["push", "pull", "bidirectional"] as const;
export type CalendarSyncDirection = (typeof calendarSyncDirections)[number];

export const importStatuses = ["pending", "running", "completed", "failed"] as const;
export type ImportStatus = (typeof importStatuses)[number];

export const importIssueSeverities = ["info", "warning", "error"] as const;
export type ImportIssueSeverity = (typeof importIssueSeverities)[number];

export const supplierTransactionTypes = [
  "commission_report",
  "bdf_payment",
  "invoice",
  "payment_received",
  "payment_sent",
  "data_submission",
] as const;
export type SupplierTransactionType = (typeof supplierTransactionTypes)[number];

export const supplierTransactionStatuses = [
  "pending",
  "received",
  "processed",
  "disputed",
  "resolved",
] as const;
export type SupplierTransactionStatus = (typeof supplierTransactionStatuses)[number];

export const supplierTransactionSourceFormats = [
  "pdf",
  "excel",
  "csv",
  "email",
  "portal",
  "other",
] as const;
export type SupplierTransactionSourceFormat = (typeof supplierTransactionSourceFormats)[number];

export const cashflowEntryTypes = ["deposit", "withdrawal", "transfer", "forecast"] as const;
export type CashflowEntryType = (typeof cashflowEntryTypes)[number];

export const cashflowCategories = [
  "supplier_payment",
  "payroll",
  "operating_expense",
  "loan_payment",
  "tax_payment",
  "bdf",
  "commission",
  "other",
] as const;
export type CashflowCategory = (typeof cashflowCategories)[number];

export const cashflowAccounts = [
  "operating",
  "tax_money_market",
  "working_capital_mm",
  "eidl_savings",
  "investment",
  "loc",
] as const;
export type CashflowAccount = (typeof cashflowAccounts)[number];

export const cashflowSources = [
  "manual",
  "quickbooks_sync",
  "bank_feed",
  "forecast_model",
] as const;
export type CashflowSource = (typeof cashflowSources)[number];

export const jobRunStatuses = ["pending", "running", "succeeded", "failed"] as const;
export type JobRunStatus = (typeof jobRunStatuses)[number];

export const pipelineStageSeeds = [
  { name: "Prospecting", displayOrder: 1, color: "#78716c" },
  { name: "Introduction", displayOrder: 2, color: "#0f766e" },
  { name: "PDB / Assessment", displayOrder: 3, color: "#d97706" },
  { name: "Proposal Submitted", displayOrder: 4, color: "#ea580c" },
  { name: "Samples / Review", displayOrder: 5, color: "#2563eb" },
  { name: "Selection / Approval", displayOrder: 6, color: "#1d4ed8" },
  { name: "Finalization", displayOrder: 7, color: "#0369a1" },
  { name: "Setup / Onboarding", displayOrder: 8, color: "#0f766e" },
  { name: "Production / Shipping", displayOrder: 9, color: "#334155" },
  { name: "In-Store / Live", displayOrder: 10, color: "#047857" },
  { name: "Post-Mod Review", displayOrder: 11, color: "#52525b" },
  { name: "Closed / Archived", displayOrder: 12, color: "#be123c" },
] as const;

export type ExecutionDashboardDTO = {
  overdueTasks: number;
  dueThisWeek: number;
  staleProjects: number;
  openProjects: number;
  recurringTasksDue: number;
};

export type InboxItemDTO = {
  id: string;
  kind: "email" | "task" | "project";
  title: string;
  subtitle: string | null;
  dueAt: string | null;
};

export type SupplierAccountView = {
  id: string;
  supplierId: string;
  supplierName: string;
  retailerId: string;
  retailerName: string;
  sourceCustomerName: string;
  eamUserId: string | null;
  eamDisplayName: string | null;
  spmUserId: string | null;
  spmDisplayName: string | null;
  projectCount: number;
  openTaskCount: number;
};
