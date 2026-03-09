import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  activities,
  buyers,
  calendarEvents,
  cashflowEntries,
  documents,
  emailMessages,
  importIssues,
  importRuns,
  jobRuns,
  microsoftConnections,
  pipelineStages,
  projectMilestones,
  projectStageHistory,
  projects,
  recurringTaskTemplates,
  retailerDepartments,
  retailers,
  supplierAccounts,
  supplierContacts,
  supplierTransactions,
  suppliers,
  tasks,
  users,
  walmartCalendarReference,
} from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Supplier = InferSelectModel<typeof suppliers>;
export type NewSupplier = InferInsertModel<typeof suppliers>;

export type SupplierContact = InferSelectModel<typeof supplierContacts>;
export type NewSupplierContact = InferInsertModel<typeof supplierContacts>;

export type Retailer = InferSelectModel<typeof retailers>;
export type NewRetailer = InferInsertModel<typeof retailers>;

export type SupplierAccount = InferSelectModel<typeof supplierAccounts>;
export type NewSupplierAccount = InferInsertModel<typeof supplierAccounts>;

export type RetailerDepartment = InferSelectModel<typeof retailerDepartments>;
export type NewRetailerDepartment = InferInsertModel<typeof retailerDepartments>;

export type Buyer = InferSelectModel<typeof buyers>;
export type NewBuyer = InferInsertModel<typeof buyers>;

export type PipelineStage = InferSelectModel<typeof pipelineStages>;
export type NewPipelineStage = InferInsertModel<typeof pipelineStages>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type ProjectStageHistory = InferSelectModel<typeof projectStageHistory>;
export type NewProjectStageHistory = InferInsertModel<typeof projectStageHistory>;

export type ProjectMilestone = InferSelectModel<typeof projectMilestones>;
export type NewProjectMilestone = InferInsertModel<typeof projectMilestones>;

export type RecurringTaskTemplate = InferSelectModel<typeof recurringTaskTemplates>;
export type NewRecurringTaskTemplate = InferInsertModel<typeof recurringTaskTemplates>;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

export type Activity = InferSelectModel<typeof activities>;
export type NewActivity = InferInsertModel<typeof activities>;

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;

export type MicrosoftConnection = InferSelectModel<typeof microsoftConnections>;
export type NewMicrosoftConnection = InferInsertModel<typeof microsoftConnections>;

export type EmailMessage = InferSelectModel<typeof emailMessages>;
export type NewEmailMessage = InferInsertModel<typeof emailMessages>;

export type CalendarEvent = InferSelectModel<typeof calendarEvents>;
export type NewCalendarEvent = InferInsertModel<typeof calendarEvents>;

export type WalmartCalendarReference = InferSelectModel<typeof walmartCalendarReference>;
export type NewWalmartCalendarReference = InferInsertModel<typeof walmartCalendarReference>;

export type ImportRun = InferSelectModel<typeof importRuns>;
export type NewImportRun = InferInsertModel<typeof importRuns>;

export type ImportIssue = InferSelectModel<typeof importIssues>;
export type NewImportIssue = InferInsertModel<typeof importIssues>;

export type JobRun = InferSelectModel<typeof jobRuns>;
export type NewJobRun = InferInsertModel<typeof jobRuns>;

export type SupplierTransaction = InferSelectModel<typeof supplierTransactions>;
export type NewSupplierTransaction = InferInsertModel<typeof supplierTransactions>;

export type CashflowEntry = InferSelectModel<typeof cashflowEntries>;
export type NewCashflowEntry = InferInsertModel<typeof cashflowEntries>;
