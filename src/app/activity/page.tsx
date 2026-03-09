import { CreateActivityForm } from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getActivitiesPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getActivitiesPageData();

  return (
    <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel p-4">
        <div className="border-b border-zinc-200 pb-3">
          <p className="section-kicker">Activity</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Interaction timeline</h1>
        </div>
        <div className="mt-4 grid gap-3">
          {data.activities.map((activity) => (
            <article key={activity.id} className="subpanel p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">{activity.subject}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {activity.supplierName} · {activity.projectName} · {activity.label}
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-500">{formatDate(activity.happenedAt)}</span>
              </div>
              {activity.body ? <p className="mt-3 text-sm leading-6 text-zinc-500">{activity.body}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <aside className="grid gap-4">
        <CreateActivityForm projects={data.projects} returnTo="/activity" />

        <section className="panel p-4">
          <p className="section-kicker">Type summary</p>
          <div className="mt-4 grid gap-2">
            {data.typeSummary.map((item) => (
              <div key={item.label} className="subpanel flex items-center justify-between px-3 py-3">
                <span className="text-sm font-medium text-zinc-900">{item.label}</span>
                <span className="font-mono text-sm text-zinc-500">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
