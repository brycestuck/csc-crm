import Link from "next/link";
import { CreateSupplierForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getSuppliersPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="CRM database not ready" message={status.message} />;
  }

  const suppliers = await getSuppliersPageData();
  const totals = suppliers.reduce(
    (acc, supplier) => ({
      projects: acc.projects + supplier.projectCount,
      openTasks: acc.openTasks + supplier.openTaskCount,
      contacts: acc.contacts + supplier.contactCount,
    }),
    { projects: 0, openTasks: 0, contacts: 0 }
  );

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_80px_rgba(53,41,28,0.08)]">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Suppliers
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Supplier workspace</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{suppliers.length} suppliers</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{totals.projects} projects</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{totals.openTasks} open tasks</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{totals.contacts} contacts</span>
          </div>
        </div>
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="rounded-[24px] border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(53,41,28,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--ink)]">{supplier.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    {supplier.summary || "No summary yet."}
                  </p>
                </div>
                <div className="text-right text-xs text-[var(--muted)]">
                  Updated
                  <div className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {formatDate(supplier.updatedAt)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full bg-white px-3 py-2">{supplier.projectCount} projects</span>
                <span className="rounded-full bg-white px-3 py-2">{supplier.openTaskCount} open tasks</span>
                <span className="rounded-full bg-white px-3 py-2">{supplier.contactCount} contacts</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <aside>
        <CreateSupplierForm />
      </aside>
    </main>
  );
}
