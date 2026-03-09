import Link from "next/link";
import { FormDrawer } from "@/components/crm/form-drawer";
import { CreateSupplierForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getSuppliersPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getSuppliersPageData();
  const totals = data.suppliers.reduce(
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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
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

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill font-mono">{data.suppliers.length} suppliers</span>
          <span className="pill font-mono">{totals.accounts} accounts</span>
          <span className="pill font-mono">{totals.projects} projects</span>
          <span className="pill font-mono">{totals.openTasks} open tasks</span>
          <span className="pill font-mono">{totals.contacts} contacts</span>
        </div>
      </section>

      <section className="grid gap-3">
        {data.suppliers.map((supplier) => (
          <Link
            key={supplier.id}
            href={`/suppliers/${supplier.id}`}
            className="panel p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-semibold text-zinc-950">{supplier.name}</h2>
                  <span className="pill">{supplier.ownerLabel}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                  {supplier.summary || "No summary yet."}
                </p>
              </div>
              <div className="text-right">
                <div className="section-kicker">Updated</div>
                <div className="mt-1 font-mono text-sm text-zinc-700">{formatDate(supplier.updatedAt)}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="pill font-mono">{supplier.accountCount} accounts</span>
              <span className="pill font-mono">{supplier.projectCount} projects</span>
              <span className="pill font-mono">{supplier.openTaskCount} open tasks</span>
              <span className="pill font-mono">{supplier.contactCount} contacts</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
