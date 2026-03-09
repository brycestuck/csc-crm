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

  return (
    <main className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-5">
        <div className="hub-panel rounded-[36px] p-7 xl:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            The Hub
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">
            One clear command center for suppliers, projects, tasks, and team follow-up.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            The Hub gives Creative Sales Solutions one shared place to run day-to-day broker work.
            Supplier records, project progress, tasks, and activity all stay visible in one large,
            readable interface.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <Link
              href="/suppliers"
              className="rounded-full bg-[var(--accent-deep)] px-5 py-3 font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.22)]"
            >
              Open suppliers
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 font-medium text-[var(--ink)]"
            >
              Review projects
            </Link>
            <Link
              href="/tasks"
              className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 font-medium text-[var(--ink)]"
            >
              Work tasks
            </Link>
          </div>
        </div>

        <div className="grid gap-4 xl:col-span-2">
          {[
            { label: "Suppliers", value: data.metrics.supplierCount },
            { label: "Active projects", value: data.metrics.activeProjectCount },
            { label: "Open tasks", value: data.metrics.openTaskCount },
            { label: "Overdue tasks", value: data.metrics.overdueTaskCount },
            { label: "Due this week", value: data.metrics.dueThisWeekCount },
          ].map((item) => (
            <div key={item.label} className="hub-subpanel rounded-[28px] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                {item.label}
              </div>
              <div className="mt-3 text-3xl font-semibold text-[var(--ink)]">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="hub-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Upcoming tasks
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">What needs attention now</h2>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-[var(--accent-strong)]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {data.upcomingTasks.map((task) => (
              <div key={task.id} className="hub-subpanel rounded-[24px] p-4">
                <div className="font-medium text-[var(--ink)]">{task.title}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {task.supplierName || "No supplier"} · {task.projectName || "No project"} ·{" "}
                  {formatRelativeDaysFromNow(task.dueDate)}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  Owner: {task.ownerName || "Unassigned"}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="hub-panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Recent activity
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Latest communication and notes</h2>
            </div>
            <Link href="/activity" className="text-sm font-medium text-[var(--accent-strong)]">
              View all
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="hub-subpanel rounded-[24px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--ink)]">{activity.subject}</div>
                    <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {activity.supplierName} · {activity.projectName} · {activity.label}
                    </div>
                  </div>
                  <span className="text-sm text-[var(--muted)]">{formatDate(activity.happenedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="hub-panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Stale projects
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Projects needing a fresh touch</h2>
          </div>
          <Link href="/projects" className="text-sm font-medium text-[var(--accent-strong)]">
            Open pipeline
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.staleProjects.map((project) => (
            <div key={project.id} className="hub-subpanel rounded-[24px] p-4">
              <div className="font-medium text-[var(--ink)]">{project.name}</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {project.supplierName} · {project.status}
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">
                Last touch: {formatDate(project.lastActivityAt || project.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hub-panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Supplier roster
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Open a supplier workspace</h2>
          </div>
          <Link href="/suppliers" className="text-sm font-medium text-[var(--accent-strong)]">
            View all suppliers
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {supplierData.suppliers.slice(0, 6).map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="hub-subpanel rounded-[24px] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent-strong)]"
            >
              <div className="font-medium text-[var(--ink)]">{supplier.name}</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {supplier.summary || "No summary yet."}
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">Owner: {supplier.ownerName || "Unassigned"}</div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                <span className="rounded-full bg-white px-3 py-2">{supplier.projectCount} projects</span>
                <span className="rounded-full bg-white px-3 py-2">{supplier.openTaskCount} open tasks</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
