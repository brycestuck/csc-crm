import { CreateActivityForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getActivitiesPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="CRM database not ready" message={status.message} />;
  }

  const data = await getActivitiesPageData();

  return (
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[32px] border border-[var(--line)] bg-white/80 p-6 shadow-[0_24px_80px_rgba(53,41,28,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
          Activity
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Interaction timeline</h1>
        <div className="mt-6 grid gap-4">
          {data.activities.map((activity) => (
            <article key={activity.id} className="rounded-[24px] border border-[var(--line)] bg-[var(--paper)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ink)]">{activity.subject}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {activity.supplierName} · {activity.projectName} · {activity.label}
                  </p>
                </div>
                <span className="text-sm text-[var(--muted)]">{formatDate(activity.happenedAt)}</span>
              </div>
              {activity.body ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{activity.body}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <aside className="grid gap-6">
        <CreateActivityForm projects={data.projects} returnTo="/activity" />

        <section className="rounded-[32px] border border-[var(--line)] bg-white/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Type summary
          </p>
          <div className="mt-5 grid gap-3">
            {data.typeSummary.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-[20px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3"
              >
                <span className="text-sm font-medium text-[var(--ink)]">{item.label}</span>
                <span className="text-sm text-[var(--muted)]">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
