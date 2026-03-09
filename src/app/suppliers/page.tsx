import Link from "next/link";
import { deleteSupplierAction } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/crm/confirm-submit-button";
import { FormDrawer } from "@/components/crm/form-drawer";
import { CreateSupplierForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getSuppliersPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SuppliersPageProps = {
  searchParams?: {
    name?: string | string[];
  };
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildReturnTo(nameFilter: string) {
  const params = new URLSearchParams();

  if (nameFilter) {
    params.set("name", nameFilter);
  }

  const query = params.toString();
  return query ? `/suppliers?${query}` : "/suppliers";
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const [currentUser, status] = await Promise.all([getCurrentUser(), getWorkspaceStatus()]);

  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getSuppliersPageData();
  const isAdmin = currentUser?.role === "admin";
  const rawNameFilter = readSearchParam(searchParams?.name).trim();
  const nameFilter = rawNameFilter.toLowerCase();
  const returnTo = buildReturnTo(rawNameFilter);

  const filteredSuppliers = data.suppliers.filter((supplier) => {
    if (!nameFilter) {
      return true;
    }

    return (
      supplier.name.toLowerCase().includes(nameFilter) ||
      (supplier.summary ?? "").toLowerCase().includes(nameFilter)
    );
  });

  const totals = filteredSuppliers.reduce(
    (acc, supplier) => ({
      accounts: acc.accounts + supplier.accountCount,
      projects: acc.projects + supplier.projectCount,
      openTasks: acc.openTasks + supplier.openTaskCount,
      contacts: acc.contacts + supplier.contactCount,
    }),
    { accounts: 0, projects: 0, openTasks: 0, contacts: 0 }
  );

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="section-kicker">Suppliers</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Supplier workspace</h1>
          </div>

          <FormDrawer
            triggerLabel="Add Supplier"
            title="Add supplier"
            description="Create a new supplier workspace."
          >
            <CreateSupplierForm embedded />
          </FormDrawer>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="grid gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Supplier
              <input
                type="search"
                name="name"
                defaultValue={rawNameFilter}
                placeholder="Search suppliers"
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Apply
            </button>

            <Link
              href="/suppliers"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Clear
            </Link>
          </form>

          <div className="flex flex-wrap gap-2">
            <span className="pill font-mono">{filteredSuppliers.length} shown</span>
            <span className="pill font-mono">{totals.accounts} accounts</span>
            <span className="pill font-mono">{totals.projects} projects</span>
            <span className="pill font-mono">{totals.openTasks} open tasks</span>
            <span className="pill font-mono">{totals.contacts} contacts</span>
          </div>
        </div>
      </section>

      {filteredSuppliers.length > 0 ? (
        <section className="grid gap-2">
          {filteredSuppliers.map((supplier) => (
            <article key={supplier.id} className="panel p-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="truncate text-sm font-semibold text-zinc-950 transition hover:text-zinc-700"
                    >
                      {supplier.name}
                    </Link>
                    <span className="pill">{supplier.ownerLabel}</span>
                  </div>

                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {supplier.summary || "No summary yet."}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Accounts</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{supplier.accountCount}</dd>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Projects</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{supplier.projectCount}</dd>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Open tasks</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{supplier.openTaskCount}</dd>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
                    <dt className="uppercase tracking-[0.16em] text-zinc-500">Contacts</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-950">{supplier.contactCount}</dd>
                  </div>
                </dl>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <div className="text-left lg:text-right">
                    <div className="section-kicker">Updated</div>
                    <div className="mt-1 font-mono text-xs text-zinc-600">{formatDate(supplier.updatedAt)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      Open
                    </Link>

                    {isAdmin ? (
                      <form action={deleteSupplierAction}>
                        <input type="hidden" name="supplierId" value={supplier.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <ConfirmSubmitButton
                          label="Delete"
                          confirmMessage={`Delete ${supplier.name}? This will hide the supplier and its active projects, tasks, contacts, and account assignments.`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        />
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="panel p-5">
          <p className="section-kicker">No Matches</p>
          <p className="mt-2 text-sm text-zinc-600">No suppliers match the current search.</p>
        </section>
      )}
    </main>
  );
}
