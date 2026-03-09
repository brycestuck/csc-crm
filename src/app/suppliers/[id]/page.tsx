import { notFound } from "next/navigation";
import {
  AssignProjectOwnerForm,
  AssignSupplierOwnerForm,
  AssignTaskOwnerForm,
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
    <main className="grid gap-6">
      <section className="hub-panel rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Supplier
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">{data.supplier.name}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {data.supplier.summary || "No supplier summary yet."}
            </p>
            {data.supplier.notes ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{data.supplier.notes}</p>
            ) : null}
            <div className="mt-4 text-sm text-[var(--muted)]">
              Coverage: {data.supplier.ownerLabel}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.supplier.accountCount} accounts</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.projects.length} projects</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.tasks.length} tasks</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.activities.length} activities</span>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2">{data.contacts.length} contacts</span>
          </div>
        </div>
        <div className="mt-5">
          <p className="mb-2 text-sm text-[var(--muted)]">Fallback supplier owner</p>
          <AssignSupplierOwnerForm
            entityId={params.id}
            ownerUserId={data.supplier.ownerUserId}
            returnTo={`/suppliers/${params.id}`}
            users={data.users}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <article className="hub-panel rounded-[32px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Accounts
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Customer coverage</h2>
            <div className="mt-5 grid gap-3">
              {data.accounts.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5 text-sm text-[var(--muted)]">
                  No customer accounts imported yet.
                </div>
              ) : (
                data.accounts.map((account) => (
                  <div key={account.id} className="hub-subpanel rounded-[24px] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--ink)]">{account.retailerName}</h3>
                        {account.sourceCustomerName !== account.retailerName ? (
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            Imported as {account.sourceCustomerName}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                        <span className="rounded-full bg-white px-3 py-2">{account.projectCount} projects</span>
                        <span className="rounded-full bg-white px-3 py-2">{account.openTaskCount} open tasks</span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[20px] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                        EAM: {account.eamDisplayName || "Unassigned"}
                      </div>
                      <div className="rounded-[20px] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                        SPM: {account.spmDisplayName || "Unassigned"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="hub-panel rounded-[32px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Contacts
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Supplier relationships</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {data.contacts.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5 text-sm text-[var(--muted)]">
                  No supplier contacts yet.
                </div>
              ) : (
                data.contacts.map((contact) => (
                <div key={contact.id} className="hub-subpanel rounded-[24px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--ink)]">{contact.fullName}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">{contact.title || "No title"}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-2 text-sm text-[var(--muted)]">
                        {contact.contactRole}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                      {contact.email ? <div>{contact.email}</div> : null}
                      {contact.phone ? <div>{contact.phone}</div> : null}
                      {contact.notes ? <div className="leading-6">{contact.notes}</div> : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="hub-panel rounded-[32px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                  Projects
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Active workstreams</h2>
              </div>
            </div>
            <div className="grid gap-4">
              {data.projects.map((project) => (
                <div key={project.id} className="hub-subpanel rounded-[24px] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{project.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {project.retailerName}
                        {project.buyerName ? ` · ${project.buyerName}` : ""}
                        {project.summary ? ` · ${project.summary}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full px-3 py-2 text-sm" style={{ backgroundColor: `${project.stageColor || "#ddd"}22`, color: project.stageColor || "var(--ink)" }}>
                      {project.stageName || "No stage"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                    <span className="rounded-full bg-white px-3 py-2">
                      Owner: {project.ownerName || "Unassigned"}
                    </span>
                    <span className="rounded-full bg-white px-3 py-2">Priority: {project.priority}</span>
                    <span className="rounded-full bg-white px-3 py-2">Status: {project.status}</span>
                    {project.modEffectiveDate ? (
                      <span className="rounded-full bg-white px-3 py-2">Mod date: {formatDate(project.modEffectiveDate)}</span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ProjectStageForm
                      projectId={project.id}
                      returnTo={`/suppliers/${params.id}`}
                      stages={data.stages}
                      currentStageId={project.stageId}
                    />
                    <AssignProjectOwnerForm
                      entityId={project.id}
                      ownerUserId={project.ownerUserId}
                      returnTo={`/suppliers/${params.id}`}
                      users={data.users}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="hub-panel rounded-[32px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Tasks
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Execution queue</h2>
            <div className="mt-5 grid gap-3">
              {data.tasks.map((task) => (
                <div key={task.id} className="hub-subpanel flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-4">
                  <div>
                    <div className="font-medium text-[var(--ink)]">{task.title}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {task.projectName || "No project"} · {formatRelativeDaysFromNow(task.dueDate)}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      Owner: {task.ownerName || "Unassigned"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-2 text-sm text-[var(--muted)]">{task.status}</span>
                    <AssignTaskOwnerForm
                      entityId={task.id}
                      ownerUserId={task.ownerUserId}
                      returnTo={`/suppliers/${params.id}`}
                      users={data.users}
                    />
                    <TaskStatusForm taskId={task.id} returnTo={`/suppliers/${params.id}`} currentStatus={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="hub-panel rounded-[32px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Latest timeline</h2>
            <div className="mt-5 grid gap-3">
              {data.activities.map((activity) => (
                <div key={activity.id} className="hub-subpanel rounded-[24px] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--ink)]">{activity.subject}</div>
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {activity.projectName} · {activity.label}
                      </div>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{formatDate(activity.happenedAt)}</span>
                  </div>
                  {activity.body ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{activity.body}</p> : null}
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="grid gap-6">
          <CreateProjectForm
            supplierId={params.id}
            retailers={data.retailers}
            stages={data.stages}
            users={data.users}
            returnTo={`/suppliers/${params.id}`}
          />
          <CreateTaskForm
            supplierId={params.id}
            returnTo={`/suppliers/${params.id}`}
            projects={data.projectOptions}
            users={data.users}
          />
          <CreateSupplierContactForm supplierId={params.id} />
          {data.projectOptions.length > 0 ? (
            <CreateActivityForm projects={data.projectOptions} returnTo={`/suppliers/${params.id}`} />
          ) : (
            <div className="rounded-[28px] border border-[var(--line)] bg-white/75 p-5 text-sm leading-6 text-[var(--muted)]">
              Add a project first to start logging activities.
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
