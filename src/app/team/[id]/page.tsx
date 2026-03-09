import { notFound } from "next/navigation";
import { SetupState } from "@/components/crm/setup-state";
import { getTeamMemberDetailData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate, formatRelativeDaysFromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamMemberPage({ params }: { params: { id: string } }) {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getTeamMemberDetailData(params.id);
  if (!data) notFound();

  const initials = data.user.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="grid gap-6">
      <section className="hub-panel rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-[28px] text-2xl font-semibold text-white"
              style={{ backgroundColor: data.user.avatarColor }}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Team member
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">{data.user.displayName}</h1>
              <p className="mt-2 text-base text-[var(--muted)]">
                {data.user.jobTitle || "No title yet"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {data.user.department || "No department yet"} · {data.user.role}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{data.user.email}</p>
              {data.user.phone ? <p className="mt-1 text-sm text-[var(--muted)]">{data.user.phone}</p> : null}
              {data.user.teamPartner ? (
                <p className="mt-2 text-sm text-[var(--accent-deep)]">Sales partner: {data.user.teamPartner}</p>
              ) : null}
              {data.user.bio ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{data.user.bio}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.metrics.supplierCount} suppliers</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.metrics.accountCount} accounts</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.metrics.projectCount} projects</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.metrics.taskCount} open tasks</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Owned suppliers
          </p>
          <div className="mt-5 grid gap-3">
            {data.suppliers.length === 0 ? (
              <div className="hub-subpanel rounded-[24px] p-4 text-sm text-[var(--muted)]">
                No suppliers assigned yet.
              </div>
            ) : (
              data.suppliers.map((supplier) => (
                <div key={supplier.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="font-medium text-[var(--ink)]">{supplier.name}</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {supplier.summary || "No summary yet."}
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted)]">Updated {formatDate(supplier.updatedAt)}</div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Active projects
          </p>
          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <div className="hub-subpanel rounded-[24px] p-4 text-sm text-[var(--muted)]">
                No projects assigned yet.
              </div>
            ) : (
              data.projects.map((project) => (
                <div key={project.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--ink)]">{project.name}</div>
                      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {project.supplierName} · {project.retailerName}
                      </div>
                    </div>
                    <span
                      className="rounded-full px-3 py-2 text-sm"
                      style={{
                        backgroundColor: `${project.stageColor || "#ddd"}22`,
                        color: project.stageColor || "var(--ink)",
                      }}
                    >
                      {project.stageName || "No stage"}
                    </span>
                  </div>
                  {project.summary ? (
                    <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{project.summary}</div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Assigned accounts
          </p>
          <div className="mt-5 grid gap-3">
            {data.accounts.length === 0 ? (
              <div className="hub-subpanel rounded-[24px] p-4 text-sm text-[var(--muted)]">
                No customer accounts assigned yet.
              </div>
            ) : (
              data.accounts.map((account) => (
                <div key={account.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--ink)]">
                        {account.supplierName} · {account.retailerName}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {account.assignmentRole}
                        {account.sourceCustomerName !== account.retailerName
                          ? ` · Imported as ${account.sourceCustomerName}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                      <span className="rounded-full bg-white px-3 py-2">{account.projectCount} projects</span>
                      <span className="rounded-full bg-white px-3 py-2">{account.openTaskCount} open tasks</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Task load
          </p>
          <div className="mt-5 grid gap-3">
            {data.tasks.length === 0 ? (
              <div className="hub-subpanel rounded-[24px] p-4 text-sm text-[var(--muted)]">
                No tasks assigned yet.
              </div>
            ) : (
              data.tasks.map((task) => (
                <div key={task.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="font-medium text-[var(--ink)]">{task.title}</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {task.supplierName || "No supplier"} · {task.projectName || "No project"} ·{" "}
                    {formatRelativeDaysFromNow(task.dueDate)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                    <span className="rounded-full bg-white px-3 py-2">{task.priority}</span>
                    <span className="rounded-full bg-white px-3 py-2">{task.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="hub-panel rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Recent activity
          </p>
          <div className="mt-5 grid gap-3">
            {data.activities.length === 0 ? (
              <div className="hub-subpanel rounded-[24px] p-4 text-sm text-[var(--muted)]">
                No recent activity yet.
              </div>
            ) : (
              data.activities.map((activity) => (
                <div key={activity.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--ink)]">{activity.subject}</div>
                      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {activity.supplierName} · {activity.projectName} · {activity.label}
                      </div>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{formatDate(activity.happenedAt)}</span>
                  </div>
                  {activity.body ? (
                    <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{activity.body}</div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
