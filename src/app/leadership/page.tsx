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
    { label: "Multi-owner suppliers", value: overview.multiOwnerSupplierCount },
  ];

  return (
    <main className="grid gap-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <p className="section-kicker">Leadership</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Control tower</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Admin-only view of people, suppliers, retailer accounts, and ownership assignments.
            </p>
          </div>
          <Link href="/team" className="btn-secondary">
            Open team directory
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <article key={card.label} className="subpanel p-4">
              <div className="section-kicker">{card.label}</div>
              <div className="metric-value mt-3">{card.value}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="section-kicker">Filters</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">Slice the field</h2>
          </div>
          <Link href="/leadership" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            Clear filters
          </Link>
        </div>

        <form className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px_auto]">
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
          <select
            name="assignmentStatus"
            defaultValue={filters.assignmentStatus}
            className="input-control"
          >
            <option value="all">All statuses</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
            <option value="multiple_owners">Multiple owners</option>
          </select>
          <button className="btn-primary">Apply</button>
        </form>
      </section>

      <section className="panel p-4">
        <div className="border-b border-zinc-200 pb-4">
          <p className="section-kicker">People</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Who owns what</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {people.length === 0 ? (
            <div className="subpanel p-4 text-sm text-zinc-500">No team members match the current filters.</div>
          ) : (
            people.map((person) => (
              <article key={person.id} className="subpanel p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={person.displayName}
                      color={person.avatarColor}
                      imagePath={person.avatarImagePath}
                      className="h-12 w-12"
                      textClassName="text-sm"
                      sizes="48px"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/team/${person.id}`} className="text-sm font-semibold text-zinc-950 hover:text-indigo-700">
                          {person.displayName}
                        </Link>
                        <span className="pill">{person.role}</span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">{person.jobTitle || "No title"}</div>
                      <div className="mt-1 text-sm text-zinc-500">{person.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill font-mono">{person.supplierCount} suppliers</span>
                    <span className="pill font-mono">{person.accountCount} accounts</span>
                    <span className="pill font-mono">{person.retailerCount} retailers</span>
                    <span className="pill font-mono">{person.activeProjectCount} projects</span>
                    <span className="pill font-mono">{person.openTaskCount} open tasks</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  <div>
                    <div className="section-kicker">Suppliers in play</div>
                    <div className="mt-2 text-sm text-zinc-500">
                      {person.supplierNames.length > 0 ? person.supplierNames.join(", ") : "No supplier coverage"}
                    </div>
                  </div>
                  <div>
                    <div className="section-kicker">Retailers covered</div>
                    <div className="mt-2 text-sm text-zinc-500">
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
        <div className="border-b border-zinc-200 pb-4">
          <p className="section-kicker">Suppliers</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Fallback owners, retailer accounts, project owners</h2>
        </div>
        <div className="mt-4 grid gap-4">
          {suppliers.length === 0 ? (
            <div className="subpanel p-4 text-sm text-zinc-500">No suppliers match the current filters.</div>
          ) : (
            suppliers.map((supplier) => (
              <article key={supplier.id} className="subpanel p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="text-base font-semibold text-zinc-950 hover:text-indigo-700"
                      >
                        {supplier.name}
                      </Link>
                      <span className="pill">{supplier.ownerLabel}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="pill font-mono">{supplier.accountCount} accounts</span>
                      <span className="pill font-mono">{supplier.activeProjectCount} projects</span>
                      <span className="pill font-mono">{supplier.openTaskCount} open tasks</span>
                    </div>
                  </div>
                  <div className="min-w-[260px]">
                    <div className="section-kicker">Fallback supplier owner</div>
                    <div className="mt-2">
                      <AssignSupplierOwnerForm
                        entityId={supplier.id}
                        ownerUserId={supplier.ownerUserId}
                        users={assignableUsers}
                        returnTo={returnTo}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                  <div className="grid gap-3 xl:col-span-1">
                    <div className="section-kicker">Retailer accounts</div>
                    {supplier.accounts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                        No retailer accounts match these filters.
                      </div>
                    ) : (
                      supplier.accounts.map((account) => (
                        <div key={account.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-zinc-950">{account.retailerName}</div>
                              {account.sourceCustomerName !== account.retailerName ? (
                                <div className="mt-1 text-sm text-zinc-500">
                                  Imported as {account.sourceCustomerName}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="pill font-mono">{account.projectCount} proj</span>
                              <span className="pill font-mono">{account.openTaskCount} open</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <AssignAccountOwnersForm
                              accountId={account.id}
                              eamUserId={account.eamUserId}
                              spmUserId={account.spmUserId}
                              users={assignableUsers}
                              returnTo={returnTo}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="grid gap-3 xl:col-span-1">
                    <div className="section-kicker">Active projects</div>
                    {supplier.projects.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                        No active projects match these filters.
                      </div>
                    ) : (
                      supplier.projects.map((project) => (
                        <div key={project.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-zinc-950">{project.name}</div>
                              <div className="mt-1 text-sm text-zinc-500">
                                {project.retailerName} · {project.stageName || "No stage"}
                              </div>
                            </div>
                            <Link href="/projects" className="text-xs font-medium text-indigo-700">
                              Projects
                            </Link>
                          </div>
                          <div className="mt-3">
                            <AssignProjectOwnerForm
                              entityId={project.id}
                              ownerUserId={project.ownerUserId}
                              users={assignableUsers}
                              returnTo={returnTo}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="grid gap-3 xl:col-span-1">
                    <div className="section-kicker">Open tasks</div>
                    {supplier.tasks.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                        No open tasks match these filters.
                      </div>
                    ) : (
                      supplier.tasks.map((task) => (
                        <div key={task.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-zinc-950">{task.title}</div>
                              <div className="mt-1 text-sm text-zinc-500">
                                {task.retailerName || "No retailer"} · {task.projectName || "No project"} · {task.status}
                              </div>
                            </div>
                            <Link href="/tasks" className="text-xs font-medium text-indigo-700">
                              Tasks
                            </Link>
                          </div>
                          <div className="mt-3">
                            <AssignTaskOwnerForm
                              entityId={task.id}
                              ownerUserId={task.ownerUserId}
                              users={assignableUsers}
                              returnTo={returnTo}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel p-4">
        <div className="border-b border-zinc-200 pb-4">
          <p className="section-kicker">Retailers</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Coverage by customer</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {retailers.length === 0 ? (
            <div className="subpanel p-4 text-sm text-zinc-500">No retailers match the current filters.</div>
          ) : (
            retailers.map((retailer) => (
              <article key={retailer.id} className="subpanel p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-zinc-950">{retailer.name}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="pill font-mono">{retailer.supplierCount} suppliers</span>
                      <span className="pill font-mono">{retailer.accountCount} accounts</span>
                      <span className="pill font-mono">{retailer.activeProjectCount} projects</span>
                      <span className="pill font-mono">{retailer.openTaskCount} open tasks</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="section-kicker">Coverage state</div>
                    <div className="mt-2 text-sm text-zinc-500">
                      {retailer.isMultipleOwners
                        ? "Multiple owners"
                        : retailer.isUnassigned
                          ? "Unassigned"
                          : "Assigned"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[320px_1fr]">
                  <div>
                    <div className="section-kicker">Owner mix</div>
                    <div className="mt-3 grid gap-2">
                      {retailer.ownerBreakdown.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                          No assigned EAM/SPM coverage.
                        </div>
                      ) : (
                        retailer.ownerBreakdown.map((owner) => (
                          <div
                            key={`${retailer.id}-${owner.userId}`}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-medium text-zinc-950">{owner.displayName}</div>
                              <div className="font-mono text-sm text-zinc-500">{owner.count}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="section-kicker">Linked supplier accounts</div>
                    <div className="mt-3 grid gap-2">
                      {retailer.accounts.map((account) => (
                        <div key={account.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/suppliers/${account.supplierId}`}
                                className="text-sm font-semibold text-zinc-950 hover:text-indigo-700"
                              >
                                {account.supplierName}
                              </Link>
                              <div className="mt-1 text-sm text-zinc-500">
                                EAM: {account.eamDisplayName || "Unassigned"} · SPM:{" "}
                                {account.spmDisplayName || "Unassigned"}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
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
