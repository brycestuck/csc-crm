create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  ms_oid text unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references users(id) on delete set null,
  summary text,
  notes text,
  commission_structure_type text check (commission_structure_type in ('percentage', 'tiered', 'draw', 'custom')),
  reporting_cadence text not null default 'monthly' check (reporting_cadence in ('monthly', 'quarterly')),
  bdf_monthly_amount numeric(12, 2),
  bdf_sales_threshold numeric(12, 2),
  payment_terms text,
  requires_data_chase boolean not null default false,
  finance_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  title text,
  notes text,
  contact_role text not null default 'sales' check (contact_role in ('sales', 'finance', 'executive', 'operations', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  calendar_type text not null default 'standard' check (calendar_type in ('walmart_fiscal', 'standard', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists retailer_departments (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  code text not null,
  name text not null,
  season_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (retailer_id, code)
);

create table if not exists buyers (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  department_id uuid references retailer_departments(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  position text,
  season_coverage text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null,
  is_active boolean not null default true,
  color text not null,
  created_at timestamptz not null default now()
);

insert into pipeline_stages (name, display_order, color)
values
  ('Prospecting', 1, '#8f8a72'),
  ('Introduction', 2, '#1b6b5f'),
  ('PDB / Assessment', 3, '#c98f2d'),
  ('Proposal Submitted', 4, '#d7683b'),
  ('Samples / Review', 5, '#8a5cf6'),
  ('Selection / Approval', 6, '#3f7cac'),
  ('Finalization', 7, '#ef8354'),
  ('Setup / Onboarding', 8, '#3f826d'),
  ('Production / Shipping', 9, '#7c4d2d'),
  ('In-Store / Live', 10, '#2f855a'),
  ('Post-Mod Review', 11, '#4a5568'),
  ('Closed / Archived', 12, '#9b2c2c')
on conflict (name) do update
set display_order = excluded.display_order,
    color = excluded.color;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  supplier_id uuid not null references suppliers(id) on delete cascade,
  retailer_id uuid not null references retailers(id) on delete cascade,
  department_id uuid references retailer_departments(id) on delete set null,
  buyer_id uuid references buyers(id) on delete set null,
  owner_user_id uuid references users(id) on delete set null,
  pipeline_stage_id uuid references pipeline_stages(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'on_hold', 'won', 'lost', 'cancelled')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  walmart_week_target text,
  mod_effective_date date,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists project_stage_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  from_stage_id uuid references pipeline_stages(id) on delete set null,
  to_stage_id uuid not null references pipeline_stages(id) on delete restrict,
  changed_by_user_id uuid references users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  due_date date,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done', 'blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists recurring_task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  supplier_id uuid references suppliers(id) on delete set null,
  retailer_id uuid references retailers(id) on delete set null,
  department_id uuid references retailer_departments(id) on delete set null,
  buyer_id uuid references buyers(id) on delete set null,
  owner_user_id uuid references users(id) on delete set null,
  cadence text not null default 'weekly' check (cadence in ('weekly', 'biweekly', 'monthly')),
  weekday integer check (weekday between 0 and 6),
  day_of_month integer check (day_of_month between 1 and 31),
  default_due_offset_days integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  retailer_id uuid references retailers(id) on delete set null,
  department_id uuid references retailer_departments(id) on delete set null,
  buyer_id uuid references buyers(id) on delete set null,
  owner_user_id uuid references users(id) on delete set null,
  recurring_template_id uuid references recurring_task_templates(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  completed_at timestamptz,
  source_type text not null default 'manual' check (source_type in ('manual', 'import', 'email_sync', 'recurring')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  activity_type text not null check (
    activity_type in (
      'email_sent',
      'email_received',
      'call',
      'meeting',
      'sample_shipped',
      'sample_received',
      'internal_note',
      'follow_up',
      'commission_report_received',
      'invoice_sent',
      'payment_received',
      'payment_sent',
      'data_requested',
      'data_received',
      'financial_note',
      'budget_update'
    )
  ),
  subject text not null,
  body text,
  contact_name text,
  contact_type text not null default 'internal' check (contact_type in ('buyer', 'supplier_contact', 'internal')),
  email_message_id text,
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('link', 'upload')),
  source text not null default 'manual' check (source in ('manual', 'upload', 'microsoft')),
  name text not null,
  url text,
  storage_path text,
  file_type text,
  size_bytes integer,
  supplier_id uuid references suppliers(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  retailer_id uuid references retailers(id) on delete set null,
  department_id uuid references retailer_departments(id) on delete set null,
  buyer_id uuid references buyers(id) on delete set null,
  uploaded_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists microsoft_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  tenant_id text,
  graph_user_id text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists email_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  graph_message_id text not null unique,
  internet_message_id text,
  thread_id text,
  from_email text,
  subject text not null,
  snippet text,
  received_at timestamptz not null,
  is_unmatched boolean not null default true,
  matched_project_id uuid references projects(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  graph_event_id text not null unique,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  project_id uuid references projects(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  sync_direction text not null default 'bidirectional' check (sync_direction in ('push', 'pull', 'bidirectional')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists walmart_calendar_reference (
  id uuid primary key default gen_random_uuid(),
  walmart_year_week text not null,
  walmart_week integer not null,
  calendar_date date not null,
  mod_effective_date date,
  task_due_date date,
  day_name text,
  quarter integer,
  month_number integer,
  month_name text,
  check_in_date_begins date,
  created_at timestamptz not null default now()
);

create table if not exists import_runs (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  file_name text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by_user_id uuid references users(id) on delete set null
);

create table if not exists import_issues (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references import_runs(id) on delete cascade,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'error')),
  row_ref text,
  column_ref text,
  message text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  summary text
);

create table if not exists supplier_transactions (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('commission_report', 'bdf_payment', 'invoice', 'payment_received', 'payment_sent', 'data_submission')),
  reference_period text,
  amount numeric(12, 2),
  status text not null default 'pending' check (status in ('pending', 'received', 'processed', 'disputed', 'resolved')),
  received_at timestamptz,
  due_date date,
  source_format text check (source_format in ('pdf', 'excel', 'csv', 'email', 'portal', 'other')),
  notes text,
  logged_by_user_id uuid references users(id) on delete set null,
  linked_activity_id uuid references activities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cashflow_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  entry_type text not null check (entry_type in ('deposit', 'withdrawal', 'transfer', 'forecast')),
  category text check (category in ('supplier_payment', 'payroll', 'operating_expense', 'loan_payment', 'tax_payment', 'bdf', 'commission', 'other')),
  amount numeric(12, 2) not null,
  account text check (account in ('operating', 'tax_money_market', 'working_capital_mm', 'eidl_savings', 'investment', 'loc')),
  supplier_id uuid references suppliers(id) on delete set null,
  description text,
  is_recurring boolean not null default false,
  source text check (source in ('manual', 'quickbooks_sync', 'bank_feed', 'forecast_model')),
  logged_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_suppliers_name on suppliers(name);
create index if not exists idx_suppliers_owner on suppliers(owner_user_id);
create index if not exists idx_supplier_contacts_supplier on supplier_contacts(supplier_id);
create index if not exists idx_supplier_contacts_email on supplier_contacts(email);
create index if not exists idx_supplier_contacts_role on supplier_contacts(contact_role);
create index if not exists idx_retailers_name on retailers(name);
create index if not exists idx_retailer_departments_retailer on retailer_departments(retailer_id);
create index if not exists idx_retailer_departments_code on retailer_departments(code);
create index if not exists idx_buyers_retailer on buyers(retailer_id);
create index if not exists idx_buyers_department on buyers(department_id);
create index if not exists idx_buyers_email on buyers(email);
create index if not exists idx_pipeline_stages_order on pipeline_stages(display_order);
create index if not exists idx_projects_supplier on projects(supplier_id);
create index if not exists idx_projects_retailer on projects(retailer_id);
create index if not exists idx_projects_department on projects(department_id);
create index if not exists idx_projects_buyer on projects(buyer_id);
create index if not exists idx_projects_owner on projects(owner_user_id);
create index if not exists idx_projects_stage on projects(pipeline_stage_id);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_project_stage_history_project on project_stage_history(project_id);
create index if not exists idx_project_stage_history_changed_at on project_stage_history(changed_at);
create index if not exists idx_project_milestones_project on project_milestones(project_id);
create index if not exists idx_project_milestones_status on project_milestones(status);
create index if not exists idx_recurring_task_templates_owner on recurring_task_templates(owner_user_id);
create index if not exists idx_recurring_task_templates_cadence on recurring_task_templates(cadence);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_owner on tasks(owner_user_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_activities_project on activities(project_id);
create index if not exists idx_activities_type on activities(activity_type);
create index if not exists idx_activities_happened_at on activities(happened_at);
create index if not exists idx_activities_email_message on activities(email_message_id);
create index if not exists idx_documents_project on documents(project_id);
create index if not exists idx_documents_supplier on documents(supplier_id);
create index if not exists idx_documents_source on documents(source);
create index if not exists idx_microsoft_connections_user on microsoft_connections(user_id);
create index if not exists idx_microsoft_connections_status on microsoft_connections(status);
create index if not exists idx_email_messages_user on email_messages(user_id);
create index if not exists idx_email_messages_unmatched on email_messages(is_unmatched);
create index if not exists idx_email_messages_matched_project on email_messages(matched_project_id);
create index if not exists idx_email_messages_received_at on email_messages(received_at);
create index if not exists idx_calendar_events_user on calendar_events(user_id);
create index if not exists idx_calendar_events_project on calendar_events(project_id);
create index if not exists idx_calendar_events_task on calendar_events(task_id);
create index if not exists idx_calendar_events_start_at on calendar_events(start_at);
create index if not exists idx_walmart_calendar_reference_year_week on walmart_calendar_reference(walmart_year_week);
create index if not exists idx_walmart_calendar_reference_date on walmart_calendar_reference(calendar_date);
create index if not exists idx_import_runs_status on import_runs(status);
create index if not exists idx_import_runs_source on import_runs(source_type);
create index if not exists idx_import_issues_run on import_issues(import_run_id);
create index if not exists idx_import_issues_severity on import_issues(severity);
create index if not exists idx_import_issues_resolved on import_issues(resolved);
create index if not exists idx_job_runs_name on job_runs(job_name);
create index if not exists idx_job_runs_status on job_runs(status);
create index if not exists idx_supplier_transactions_supplier on supplier_transactions(supplier_id);
create index if not exists idx_supplier_transactions_type on supplier_transactions(transaction_type);
create index if not exists idx_supplier_transactions_period on supplier_transactions(reference_period);
create index if not exists idx_supplier_transactions_status on supplier_transactions(status);
create index if not exists idx_cashflow_entries_date on cashflow_entries(entry_date);
create index if not exists idx_cashflow_entries_type on cashflow_entries(entry_type);
create index if not exists idx_cashflow_entries_account on cashflow_entries(account);
create index if not exists idx_cashflow_entries_supplier on cashflow_entries(supplier_id);

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();
drop trigger if exists suppliers_set_updated_at on suppliers;
create trigger suppliers_set_updated_at before update on suppliers for each row execute function set_updated_at();
drop trigger if exists supplier_contacts_set_updated_at on supplier_contacts;
create trigger supplier_contacts_set_updated_at before update on supplier_contacts for each row execute function set_updated_at();
drop trigger if exists retailers_set_updated_at on retailers;
create trigger retailers_set_updated_at before update on retailers for each row execute function set_updated_at();
drop trigger if exists retailer_departments_set_updated_at on retailer_departments;
create trigger retailer_departments_set_updated_at before update on retailer_departments for each row execute function set_updated_at();
drop trigger if exists buyers_set_updated_at on buyers;
create trigger buyers_set_updated_at before update on buyers for each row execute function set_updated_at();
drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
drop trigger if exists project_milestones_set_updated_at on project_milestones;
create trigger project_milestones_set_updated_at before update on project_milestones for each row execute function set_updated_at();
drop trigger if exists recurring_task_templates_set_updated_at on recurring_task_templates;
create trigger recurring_task_templates_set_updated_at before update on recurring_task_templates for each row execute function set_updated_at();
drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at before update on tasks for each row execute function set_updated_at();
drop trigger if exists documents_set_updated_at on documents;
create trigger documents_set_updated_at before update on documents for each row execute function set_updated_at();
drop trigger if exists microsoft_connections_set_updated_at on microsoft_connections;
create trigger microsoft_connections_set_updated_at before update on microsoft_connections for each row execute function set_updated_at();
drop trigger if exists email_messages_set_updated_at on email_messages;
create trigger email_messages_set_updated_at before update on email_messages for each row execute function set_updated_at();
drop trigger if exists calendar_events_set_updated_at on calendar_events;
create trigger calendar_events_set_updated_at before update on calendar_events for each row execute function set_updated_at();
drop trigger if exists import_issues_set_updated_at on import_issues;
create trigger import_issues_set_updated_at before update on import_issues for each row execute function set_updated_at();
drop trigger if exists supplier_transactions_set_updated_at on supplier_transactions;
create trigger supplier_transactions_set_updated_at before update on supplier_transactions for each row execute function set_updated_at();
drop trigger if exists cashflow_entries_set_updated_at on cashflow_entries;
create trigger cashflow_entries_set_updated_at before update on cashflow_entries for each row execute function set_updated_at();
