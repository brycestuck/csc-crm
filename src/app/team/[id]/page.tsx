import { notFound } from "next/navigation";
import { SetupState } from "@/components/crm/setup-state";
import { UserAvatar } from "@/components/crm/user-avatar";
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

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={data.user.displayName}
              color={data.user.avatarColor}
              imagePath={data.user.avatarImagePath}
              className="h-20 w-20"
              textClassName="text-xl"
              sizes="80px"
            />
            <div>
              <p className="section-kicker">Team member</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{data.user.displayName}</h1>
              <p className="mt-2 text-sm text-zinc-500">{data.user.jobTitle || "No title yet"}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {data.user.department || "No department yet"} · {data.user.role}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{data.user.email}</p>
              {data.user.phone ? <p className="mt-1 text-sm text-zinc-500">{data.user.phone}</p> : null}
              {data.user.teamPartner ? <p className="mt-2 text-sm text-zinc-700">Sales partner: {data.user.teamPartner}</p> : null}
              {data.user.bio ? <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">{data.user.bio}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill font-mono">{data.metrics.supplierCount} suppliers</span>
            <span className="pill font-mono">{data.metrics.accountCount} accounts</span>
            <span className="pill font-mono">{data.metrics.projectCount} projects</span>
            <span className="pill font-mono">{data.metrics.taskCount} open tasks</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="panel p-4">
          <p className="section-kicker">Owned suppliers</p>
          <div className="mt-4 grid gap-3">
            {data.suppliers.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No suppliers assigned yet.</div>
            ) : (
              data.suppliers.map((supplier) => (
                <div key={supplier.id} className="subpanel p-4">
                  <div className="text-sm font-semibold text-zinc-950">{supplier.name}</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-500">{supplier.summary || "No summary yet."}</div>
                  <div className="mt-3 font-mono text-xs text-zinc-500">Updated {formatDate(supplier.updatedAt)}</div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel p-4">
          <p className="section-kicker">Active projects</p>
          <div className="mt-4 grid gap-3">
            {data.projects.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No projects assigned yet.</div>
            ) : (
              data.projects.map((project) => (
                <div key={project.id} className="subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{project.name}</div>
                      <div className="mt-1 text-sm leading-6 text-zinc-500">
                        {project.supplierName} · {project.retailerName}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${project.stageColor || "#d4d4d8"}22`, color: project.stageColor || "#18181b" }}
                    >
                      {project.stageName || "No stage"}
                    </span>
                  </div>
                  {project.summary ? <div className="mt-3 text-sm leading-6 text-zinc-500">{project.summary}</div> : null}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="panel p-4">
          <p className="section-kicker">Assigned accounts</p>
          <div className="mt-4 grid gap-3">
            {data.accounts.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No customer accounts assigned yet.</div>
            ) : (
              data.accounts.map((account) => (
                <div key={account.id} className="subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">
                        {account.supplierName} · {account.retailerName}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-zinc-500">
                        {account.assignmentRole}
                        {account.sourceCustomerName !== account.retailerName ? ` · Imported as ${account.sourceCustomerName}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="pill font-mono">{account.projectCount} projects</span>
                      <span className="pill font-mono">{account.openTaskCount} open tasks</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel p-4">
          <p className="section-kicker">Task load</p>
          <div className="mt-4 grid gap-3">
            {data.tasks.length === 0 ? (
              <div className="subpanel p-4 text-sm text-zinc-500">No tasks assigned yet.</div>
            ) : (
              data.tasks.map((task) => (
                <div key={task.id} className="subpanel p-4">
                  <div className="text-sm font-semibold text-zinc-950">{task.title}</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-500">
                    {task.supplierName || "No supplier"} · {task.projectName || "No project"} · {formatRelativeDaysFromNow(task.dueDate)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="pill font-mono">{task.priority}</span>
                    <span className="pill font-mono">{task.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="panel p-4">
        <p className="section-kicker">Recent activity</p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {data.activities.length === 0 ? (
            <div className="subpanel p-4 text-sm text-zinc-500">No recent activity yet.</div>
          ) : (
            data.activities.map((activity) => (
              <div key={activity.id} className="subpanel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-950">{activity.subject}</div>
                    <div className="mt-1 text-sm leading-6 text-zinc-500">
                      {activity.supplierName} · {activity.projectName} · {activity.label}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-zinc-500">{formatDate(activity.happenedAt)}</span>
                </div>
                {activity.body ? <div className="mt-3 text-sm leading-6 text-zinc-500">{activity.body}</div> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
