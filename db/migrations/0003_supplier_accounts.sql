create table if not exists supplier_accounts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  retailer_id uuid not null references retailers(id) on delete cascade,
  eam_user_id uuid references users(id) on delete set null,
  spm_user_id uuid references users(id) on delete set null,
  source_customer_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_supplier_accounts_supplier on supplier_accounts(supplier_id);
create index if not exists idx_supplier_accounts_retailer on supplier_accounts(retailer_id);
create index if not exists idx_supplier_accounts_eam on supplier_accounts(eam_user_id);
create index if not exists idx_supplier_accounts_spm on supplier_accounts(spm_user_id);
create unique index if not exists uq_supplier_accounts_supplier_retailer
  on supplier_accounts(supplier_id, retailer_id);
