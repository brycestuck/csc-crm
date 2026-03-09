import type { ReactNode } from "react";
import Link from "next/link";
import {
  AssignAccountOwnersForm,
  AssignProjectOwnerForm,
  AssignSupplierOwnerForm,
  AssignTaskOwnerForm,
} from "@/components/crm/forms";
import { SetupState } from "@/components/crm/setup-state";
import { UserAvatar } from "@/components/crm/user-avatar";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAssignableUserOptions,
  getLeadershipFilterOptions,
  getLeadershipOverviewData,
  getLeadershipPeopleData,
  getLeadershipRetailersData,
  getLeadershipSuppliersData,
  getWorkspaceStatus,
} from "@/lib/db/crm";
import {
  leadershipAssignmentStatuses,
  type LeadershipAssignmentStatus,
  type LeadershipFilterState,
} from "@/lib/types/domain";

export const dynamic = "force-dynamic";

function getParam(
  value: string | string[] | undefined,
  fallback: LeadershipAssignmentStatus | null = null
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>): LeadershipFilterState {
  const assignmentStatus = getParam(searchParams.assignmentStatus, "all");
  const normalizedStatus = leadershipAssignmentStatuses.includes(
    assignmentStatus as LeadershipAssignmentStatus
  )
    ? (assignmentStatus as LeadershipAssignmentStatus)
    : "all";

  return {
    teamMemberId: getParam(searchParams.teamMemberId),
    supplierId: getParam(searchParams.supplierId),
    retailerId: getParam(searchParams.retailerId),
    assignmentStatus: normalizedStatus,
  };
}

function buildReturnTo(filters: LeadershipFilterState) {
  const params = new URLSearchParams();
  if (filters.teamMemberId) params.set("teamMemberId", filters.teamMemberId);
  if (filters.supplierId) params.set("supplierId", filters.supplierId);
  if (filters.retailerId) params.set("retailerId", filters.retailerId);
  if (filters.assignmentStatus !== "all") params.set("assignmentStatus", filters.assignmentStatus);

  return params.toString() ? `/leadership?${params.toString()}` : "/leadership";
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className="section-kicker">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold text-zinc-950">{value}</div>
    </article>
  );
}

function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
      {message}
    </div>
  );
}

function CompactAssignmentWrap({ children }: { children: ReactNode }) {
  return (
    <div className="[&_button]:h-9 [&_button]:px-3 [&_button]:py-0 [&_button]:text-xs [&_form]:gap-1.5 [&_select]:min-w-0 [&_select]:py-2 [&_select]:text-xs">
      {children}
    </div>
  );
}

export default async function LeadershipPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin();

  const status = await getWorkspaceStatus();
  if (status.state !== "ready") {
    return <SetupState title="The Hub database is not ready" message={status.message} />;
  }

  const filters = parseFilters(searchParams);
  const returnTo = buildReturnTo(filters);

  const [overview, people, suppliers, retailers, filterOptions, assignableUsers] = await Promise.all([
    getLeadershipOverviewData(filters),
    getLeadershipPeopleData(filters),
    getLeadershipSuppliersData(filters),
    getLeadershipRetailersData(filters),
    getLeadershipFilterOptions(),
    getAssignableUserOptions(),
  ]);

  const overviewCards = [
    { label: "People", value: overview.peopleCount },
    { label: "Suppliers", value: overview.supplierCount },
    { label: "Retailers", value: overview.retailerCount },
    { label: "Accounts", value: overview.accountCount },
    { label: "Active projects", value: overview.activeProjectCount },
    { label: "Open tasks", value: overview.openTaskCount },
    { label: "Unassigned", value: overview.unassignedOwnershipCount },
    { label: "Multi-owner", value: overview.multiOwnerSupplierCount },
  ];

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-3">
          <div>
            <p className="section-kicker">Leadership</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Control tower</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leadership" className="btn-secondary">
              Clear filters
            </Link>
            <Link href="/team" className="btn-secondary">
              Team directory
            </Link>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-4 2xl:grid-cols-8">
          {overviewCards.map((card) => (
            <MetricTile key={card.label} label={card.label} value={card.value} />
          ))}
        </div>

        <form className="mt-3 grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px_auto]">
          <select name="teamMemberId" defaultValue={filters.teamMemberId || ""} className="input-control">
            <option value="">All team members</option>
            {filterOptions.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select name="supplierId" defaultValue={filters.supplierId || ""} className="input-control">
            <option value="">All suppliers</option>
            {filterOptions.suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <select name="retailerId" defaultValue={filters.retailerId || ""} className="input-control">
            <option value="">All retailers</option>
            {filterOptions.retailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.name}
              </option>
            ))}
          </select>
          <select name="assignmentStatus" defaultValue={filters.assignmentStatus} className="input-control">
            <option value="all">All statuses</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
            <option value="multiple_owners">Multiple owners</option>
          </select>
          <button className="btn-primary">Apply</button>
        </form>
      </section>

      <section className="panel p-4">
        <SectionHeader kicker="People" title="Who owns what" />
        <div className="mt-3 grid gap-2 xl:grid-cols-2">
          {people.length === 0 ? (
            <EmptyState message="No team members match the current filters." />
          ) : (
            people.map((person) => (
              <article key={person.id} className="subpanel p-3">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_310px] xl:items-start">
                  <div className="flex min-w-0 gap-3">
                    <UserAvatar
                      name={person.displayName}
                      color={person.avatarColor}
                      imagePath={person.avatarImagePath}
                      className="h-12 w-12 rounded-lg"
                      textClassName="text-sm"
                      sizes="48px"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/team/${person.id}`} className="truncate text-sm font-semibold text-zinc-950 hover:text-zinc-700">
                          {person.displayName}
                        </Link>
                        <span className="pill">{person.role}</span>
                      </div>
                      <div className="mt-1 truncate text-sm text-zinc-600">{person.jobTitle || "No title"}</div>
                      <div className="mt-1 truncate text-xs text-zinc-500">{person.email}</div>
                    </div>
                  </div>

                  <dl className="grid grid-cols-5 gap-1.5 text-center text-xs">
                    <div className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                      <dt className="uppercase tracking-[0.16em] text-zinc-500">Sup</dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-950">{person.supplierCount}</dd>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                      <dt className="uppercase tracking-[0.16em] text-zinc-500">Acc</dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-950">{person.accountCount}</dd>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                      <dt className="uppercase tracking-[0.16em] text-zinc-500">Ret</dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-950">{person.retailerCount}</dd>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                      <dt className="uppercase tracking-[0.16em] text-zinc-500">Proj</dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-950">{person.activeProjectCount}</dd>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                      <dt className="uppercase tracking-[0.16em] text-zinc-500">Tasks</dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-950">{person.openTaskCount}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
                    <div className="section-kicker">Suppliers</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-500">
                      {person.supplierNames.length > 0 ? person.supplierNames.join(", ") : "No supplier coverage"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
                    <div className="section-kicker">Retailers</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-500">
                      {person.retailerNames.length > 0 ? person.retailerNames.join(", ") : "No retailer coverage"}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel p-4">
        <SectionHeader
          kicker="Suppliers"
          title="Fallback owners, account coverage, project ownership"
        />
        <div className="mt-3 grid gap-2">
          {suppliers.length === 0 ? (
            <EmptyState message="No suppliers match the current filters." />
          ) : (
            suppliers.map((supplier) => (
              <article key={supplier.id} className="subpanel p-3">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="text-sm font-semibold text-zinc-950 hover:text-zinc-700"
                      >
                        {supplier.name}
                      </Link>
                      <span className="pill">{supplier.ownerLabel}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="pill font-mono">{supplier.accountCount} accounts</span>
                      <span className="pill font-mono">{supplier.activeProjectCount} projects</span>
                      <span className="pill font-mono">{supplier.openTaskCount} open tasks</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
                    <div className="section-kicker">Fallback owner</div>
                    <div className="mt-2">
                      <CompactAssignmentWrap>
                        <AssignSupplierOwnerForm
                          entityId={supplier.id}
                          ownerUserId={supplier.ownerUserId}
                          users={assignableUsers}
                          returnTo={returnTo}
                        />
                      </CompactAssignmentWrap>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="section-kicker">Retailer accounts</div>
                    <div className="mt-2 grid gap-2">
                      {supplier.accounts.length === 0 ? (
                        <EmptyState message="No retailer accounts match these filters." />
                      ) : (
                        supplier.accounts.map((account) => (
                          <div key={account.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-950">{account.retailerName}</div>
                                {account.sourceCustomerName !== account.retailerName ? (
                                  <div className="mt-1 truncate text-xs text-zinc-500">
                                    Imported as {account.sourceCustomerName}
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 gap-1.5">
                                <span className="pill font-mono">{account.projectCount} proj</span>
                                <span className="pill font-mono">{account.openTaskCount} open</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <CompactAssignmentWrap>
                                <AssignAccountOwnersForm
                                  accountId={account.id}
                                  eamUserId={account.eamUserId}
                                  spmUserId={account.spmUserId}
                                  users={assignableUsers}
                                  returnTo={returnTo}
                                />
                              </CompactAssignmentWrap>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="section-kicker">Active projects</div>
                    <div className="mt-2 grid gap-2">
                      {supplier.projects.length === 0 ? (
                        <EmptyState message="No active projects match these filters." />
                      ) : (
                        supplier.projects.map((project) => (
                          <div key={project.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-950">{project.name}</div>
                                <div className="mt-1 truncate text-xs text-zinc-500">
                                  {project.retailerName} · {project.stageName || "No stage"}
                                </div>
                              </div>
                              <Link href="/projects" className="shrink-0 text-xs font-medium text-zinc-600 hover:text-zinc-950">
                                Open
                              </Link>
                            </div>
                            <div className="mt-2">
                              <CompactAssignmentWrap>
                                <AssignProjectOwnerForm
                                  entityId={project.id}
                                  ownerUserId={project.ownerUserId}
                                  users={assignableUsers}
                                  returnTo={returnTo}
                                />
                              </CompactAssignmentWrap>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="section-kicker">Open tasks</div>
                    <div className="mt-2 grid gap-2">
                      {supplier.tasks.length === 0 ? (
                        <EmptyState message="No open tasks match these filters." />
                      ) : (
                        supplier.tasks.map((task) => (
                          <div key={task.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-950">{task.title}</div>
                                <div className="mt-1 truncate text-xs text-zinc-500">
                                  {task.retailerName || "No retailer"} · {task.projectName || "No project"} · {task.status}
                                </div>
                              </div>
                              <Link href="/tasks" className="shrink-0 text-xs font-medium text-zinc-600 hover:text-zinc-950">
                                Open
                              </Link>
                            </div>
                            <div className="mt-2">
                              <CompactAssignmentWrap>
                                <AssignTaskOwnerForm
                                  entityId={task.id}
                                  ownerUserId={task.ownerUserId}
                                  users={assignableUsers}
                                  returnTo={returnTo}
                                />
                              </CompactAssignmentWrap>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel p-4">
        <SectionHeader kicker="Retailers" title="Coverage by customer" />
        <div className="mt-3 grid gap-2">
          {retailers.length === 0 ? (
            <EmptyState message="No retailers match the current filters." />
          ) : (
            retailers.map((retailer) => (
              <article key={retailer.id} className="subpanel p-3">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
                  <div>
                    <div className="text-sm font-semibold text-zinc-950">{retailer.name}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="pill font-mono">{retailer.supplierCount} suppliers</span>
                      <span className="pill font-mono">{retailer.accountCount} accounts</span>
                      <span className="pill font-mono">{retailer.activeProjectCount} projects</span>
                      <span className="pill font-mono">{retailer.openTaskCount} open tasks</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
                    <div className="section-kicker">Coverage state</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {retailer.isMultipleOwners
                        ? "Multiple owners"
                        : retailer.isUnassigned
                          ? "Unassigned"
                          : "Assigned"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 xl:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="section-kicker">Owner mix</div>
                    <div className="mt-2 grid gap-2">
                      {retailer.ownerBreakdown.length === 0 ? (
                        <EmptyState message="No assigned EAM/SPM coverage." />
                      ) : (
                        retailer.ownerBreakdown.map((owner) => (
                          <div
                            key={`${retailer.id}-${owner.userId}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                          >
                            <div className="truncate text-sm font-medium text-zinc-950">{owner.displayName}</div>
                            <div className="font-mono text-sm text-zinc-500">{owner.count}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="section-kicker">Linked supplier accounts</div>
                    <div className="mt-2 grid gap-2">
                      {retailer.accounts.map((account) => (
                        <div key={account.id} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/suppliers/${account.supplierId}`}
                                className="truncate text-sm font-semibold text-zinc-950 hover:text-zinc-700"
                              >
                                {account.supplierName}
                              </Link>
                              <div className="mt-1 text-xs text-zinc-500">
                                EAM: {account.eamDisplayName || "Unassigned"} · SPM:{" "}
                                {account.spmDisplayName || "Unassigned"}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="pill font-mono">{account.projectCount} proj</span>
                              <span className="pill font-mono">{account.openTaskCount} open</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
