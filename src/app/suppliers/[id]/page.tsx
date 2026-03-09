import { notFound } from "next/navigation";
import {
  CreateActivityForm,
  CreateProjectForm,
  CreateSupplierContactForm,
  CreateTaskForm,
  ProjectStageForm,
  TaskStatusForm,
} from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { getSupplierDetailData, getWorkspaceStatus } from "@/lib/db/crm";
import { formatDate, formatRelativeDaysFromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const data = await getSupplierDetailData(params.id);
  if (!data) notFound();

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="section-kicker">Supplier</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{data.supplier.name}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-500">
              {data.supplier.summary || "No supplier summary yet."}
            </p>
            {data.supplier.notes ? <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-500">{data.supplier.notes}</p> : null}
            <div className="mt-3 text-sm text-zinc-500">Coverage: {data.supplier.ownerLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill font-mono">{data.supplier.accountCount} accounts</span>
            <span className="pill font-mono">{data.projects.length} projects</span>
            <span className="pill font-mono">{data.tasks.length} tasks</span>
            <span className="pill font-mono">{data.activities.length} activities</span>
            <span className="pill font-mono">{data.contacts.length} contacts</span>
          </div>
        </div>

      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <article className="panel p-4">
            <p className="section-kicker">Accounts</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">Customer coverage</h2>
            <div className="mt-4 grid gap-3">
              {data.accounts.length === 0 ? (
                <div className="subpanel border-dashed p-4 text-sm text-zinc-500">No customer accounts imported yet.</div>
              ) : (
                data.accounts.map((account) => (
                  <div key={account.id} className="subpanel p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950">{account.retailerName}</h3>
                        {account.sourceCustomerName !== account.retailerName ? (
                          <p className="mt-1 text-sm text-zinc-500">Imported as {account.sourceCustomerName}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="pill font-mono">{account.projectCount} projects</span>
                        <span className="pill font-mono">{account.openTaskCount} open tasks</span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
                        EAM: {account.eamDisplayName || "Unassigned"}
                      </div>
                      <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
                        SPM: {account.spmDisplayName || "Unassigned"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="panel p-4">
            <p className="section-kicker">Contacts</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">Supplier relationships</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.contacts.length === 0 ? (
                <div className="subpanel border-dashed p-4 text-sm text-zinc-500">No supplier contacts yet.</div>
              ) : (
                data.contacts.map((contact) => (
                  <div key={contact.id} className="subpanel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-950">{contact.fullName}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{contact.title || "No title"}</p>
                      </div>
                      <span className="pill">{contact.contactRole}</span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-zinc-500">
                      {contact.email ? <div>{contact.email}</div> : null}
                      {contact.phone ? <div>{contact.phone}</div> : null}
                      {contact.notes ? <div className="leading-6">{contact.notes}</div> : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="panel p-4">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <p className="section-kicker">Projects</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950">Active workstreams</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {data.projects.map((project) => (
                <div key={project.id} className="subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-950">{project.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {project.retailerName}
                        {project.buyerName ? ` · ${project.buyerName}` : ""}
                        {project.summary ? ` · ${project.summary}` : ""}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${project.stageColor || "#d4d4d8"}22`, color: project.stageColor || "#18181b" }}
                    >
                      {project.stageName || "No stage"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="pill">{project.ownerName || "Unassigned"}</span>
                    <span className="pill font-mono">{project.priority}</span>
                    <span className="pill font-mono">{project.status}</span>
                    {project.modEffectiveDate ? <span className="pill font-mono">{formatDate(project.modEffectiveDate)}</span> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ProjectStageForm
                      projectId={project.id}
                      returnTo={`/suppliers/${params.id}`}
                      stages={data.stages}
                      currentStageId={project.stageId}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-4">
            <p className="section-kicker">Tasks</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">Execution queue</h2>
            <div className="mt-4 grid gap-3">
              {data.tasks.map((task) => (
                <div key={task.id} className="subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{task.title}</div>
                      <div className="mt-1 text-sm text-zinc-500">
                        {task.projectName || "No project"} · {formatRelativeDaysFromNow(task.dueDate)}
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">Owner: {task.ownerName || "Unassigned"}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill font-mono">{task.status}</span>
                      <TaskStatusForm taskId={task.id} returnTo={`/suppliers/${params.id}`} currentStatus={task.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-4">
            <p className="section-kicker">Activity</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">Latest timeline</h2>
            <div className="mt-4 grid gap-3">
              {data.activities.map((activity) => (
                <div key={activity.id} className="subpanel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-950">{activity.subject}</div>
                      <div className="mt-1 text-sm text-zinc-500">
                        {activity.projectName} · {activity.label}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{formatDate(activity.happenedAt)}</span>
                  </div>
                  {activity.body ? <p className="mt-3 text-sm leading-6 text-zinc-500">{activity.body}</p> : null}
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="grid gap-4">
          <CreateProjectForm
            supplierId={params.id}
            retailers={data.retailers}
            stages={data.stages}
            returnTo={`/suppliers/${params.id}`}
          />
          <CreateTaskForm supplierId={params.id} returnTo={`/suppliers/${params.id}`} projects={data.projectOptions} />
          <CreateSupplierContactForm supplierId={params.id} />
          {data.projectOptions.length > 0 ? (
            <CreateActivityForm projects={data.projectOptions} returnTo={`/suppliers/${params.id}`} />
          ) : (
            <div className="panel p-4 text-sm leading-6 text-zinc-500">Add a project first to start logging activities.</div>
          )}
        </aside>
      </section>
    </main>
  );
}
