import Link from "next/link";
import { SetupState } from "@/components/crm/setup-state";
import { getDashboardData, getSuppliersPageData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate, formatRelativeDaysFromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const [data, supplierData] = await Promise.all([getDashboardData(), getSuppliersPageData()]);

  const metrics = [
    { label: "Suppliers", value: data.metrics.supplierCount },
    { label: "Active projects", value: data.metrics.activeProjectCount },
    { label: "Open tasks", value: data.metrics.openTaskCount },
    { label: "Overdue tasks", value: data.metrics.overdueTaskCount },
    { label: "Due this week", value: data.metrics.dueThisWeekCount },
  ];

  return (
    <main className="grid gap-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((item) => (
          <article key={item.label} className="panel p-4">
            <p className="section-kicker">{item.label}</p>
            <p className="metric-value mt-3">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="panel p-4">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <p className="section-kicker">Upcoming tasks</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">Needs attention now</h2>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-indigo-700">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {data.upcomingTasks.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No upcoming tasks in queue.</div>
            ) : (
              data.upcomingTasks.map((task) => (
                <div key={task.id} className="subpanel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{task.title}</div>
                      <div className="mt-1 text-sm leading-6 text-zinc-500">
                        {task.supplierName || "No supplier"} · {task.projectName || "No project"}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {formatRelativeDaysFromNow(task.dueDate)}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="pill font-mono">{formatDate(task.dueDate)}</span>
                    <span className="pill">{task.ownerName || "Unassigned"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel p-4">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <p className="section-kicker">Recent activity</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">Latest movement</h2>
            </div>
            <Link href="/activity" className="text-sm font-medium text-indigo-700">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {data.recentActivities.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No recent activity logged.</div>
            ) : (
              data.recentActivities.map((activity) => (
                <div key={activity.id} className="subpanel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{activity.subject}</div>
                      <div className="mt-1 text-sm leading-6 text-zinc-500">
                        {activity.supplierName} · {activity.projectName} · {activity.label}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{formatDate(activity.happenedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="panel p-4 xl:col-span-1">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <p className="section-kicker">Stale projects</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">Needs follow-up</h2>
            </div>
            <Link href="/projects" className="text-sm font-medium text-indigo-700">
              Open pipeline
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {data.staleProjects.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No stale projects right now.</div>
            ) : (
              data.staleProjects.map((project) => (
                <div key={project.id} className="subpanel p-4">
                  <div className="text-sm font-semibold text-zinc-950">{project.name}</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-500">
                    {project.supplierName} · {project.status}
                  </div>
                  <div className="mt-3 font-mono text-xs text-zinc-500">
                    Last touch {formatDate(project.lastActivityAt || project.updatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel p-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <p className="section-kicker">Supplier roster</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">Open a supplier workspace</h2>
            </div>
            <Link href="/suppliers" className="text-sm font-medium text-indigo-700">
              View all suppliers
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            {supplierData.suppliers.slice(0, 6).map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${supplier.id}`}
                className="subpanel p-4 transition hover:border-zinc-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-950">{supplier.name}</div>
                    <div className="mt-1 text-sm leading-6 text-zinc-500">
                      {supplier.summary || "No summary yet."}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">{formatDate(supplier.updatedAt)}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pill font-mono">{supplier.accountCount} accts</span>
                  <span className="pill font-mono">{supplier.projectCount} proj</span>
                  <span className="pill font-mono">{supplier.openTaskCount} open</span>
                </div>
                <div className="mt-3 text-sm text-zinc-500">Coverage: {supplier.ownerLabel}</div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
