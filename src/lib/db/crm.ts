import "server-only";

import { and, asc, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { formatActivityTypeLabel } from "@/lib/activities/labels";
import { getDb, getPool } from "@/lib/db/client";
import {
  activities,
  buyers,
  pipelineStages,
  projectStageHistory,
  projects,
  retailers,
  supplierContacts,
  suppliers,
  tasks,
  users,
} from "@/lib/db/schema";
import { defaultUserSeed, teamSeedUsers } from "@/lib/team/seed";
import {
  pipelineStageSeeds,
  type ActivityType,
  type ProjectPriority,
  type ProjectStatus,
  type SupplierContactRole,
  type TaskStatus,
  type UserRole,
} from "@/lib/types/domain";

const DEFAULT_RETAILERS = [
  { name: "Walmart", calendarType: "walmart_fiscal" as const },
  { name: "Michaels", calendarType: "standard" as const },
  { name: "Hobby Lobby", calendarType: "standard" as const },
  { name: "Dollar General", calendarType: "standard" as const },
  { name: "Amazon", calendarType: "standard" as const },
];

let workspaceSeedPromise: Promise<WorkspaceStatus> | null = null;

export type WorkspaceStatus =
  | { state: "missing-env"; message: string }
  | { state: "schema-missing"; message: string }
  | { state: "error"; message: string }
  | { state: "ready" };

type Option = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  displayName: string;
  role: UserRole;
  jobTitle: string | null;
  department: string | null;
  avatarColor: string;
};

type ProjectOption = {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
};

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export async function getWorkspaceStatus(): Promise<WorkspaceStatus> {
  if (!process.env.DATABASE_URL) {
    return {
      state: "missing-env",
      message: "Add DATABASE_URL in Replit Secrets, then run npm run db:push.",
    };
  }

  try {
    const pool = getPool();
    const result = await pool.query<{ count: number }>(
      `
        select count(*)::int as count
        from information_schema.tables
        where table_schema = 'public'
          and table_name in ('users', 'suppliers', 'projects', 'tasks', 'activities', 'pipeline_stages')
      `
    );

    const count = result.rows[0]?.count ?? 0;
    if (count < 6) {
      return {
        state: "schema-missing",
        message: "Database connected, but schema is missing. Run npm run db:push in the Replit shell.",
      };
    }

    const userProfileColumns = await pool.query<{ count: number }>(
      `
        select count(*)::int as count
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'users'
          and column_name in ('job_title', 'department', 'team_partner', 'phone', 'bio', 'avatar_color')
      `
    );

    if ((userProfileColumns.rows[0]?.count ?? 0) < 6) {
      return {
        state: "schema-missing",
        message: "The Hub schema needs an update. Run npm run db:push in the Replit shell to add team profile fields.",
      };
    }

    return { state: "ready" };
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : "Unknown database connection error.",
    };
  }
}

async function seedPipelineStages() {
  const db = getDb();

  for (const stage of pipelineStageSeeds) {
    await db
      .insert(pipelineStages)
      .values({
        name: stage.name,
        displayOrder: stage.displayOrder,
        color: stage.color,
      })
      .onConflictDoNothing();
  }
}

async function getDefaultUserId() {
  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, defaultUserSeed.email), isNull(users.deletedAt)))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  await db.insert(users).values(defaultUserSeed).onConflictDoNothing();

  const afterInsert = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, defaultUserSeed.email), isNull(users.deletedAt)))
    .limit(1);

  if (!afterInsert[0]) {
    throw new Error("Default workspace user could not be created.");
  }

  return afterInsert[0].id;
}

async function seedRetailers() {
  const db = getDb();

  for (const retailer of DEFAULT_RETAILERS) {
    await db.insert(retailers).values(retailer).onConflictDoNothing();
  }
}

async function seedTeamProfiles() {
  const db = getDb();

  for (const user of teamSeedUsers) {
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          department: user.department,
          teamPartner: user.teamPartner,
          bio: user.bio,
          avatarColor: user.avatarColor,
          role: user.role,
          updatedAt: new Date(),
        },
      });
  }
}

async function seedSampleWorkspace() {
  const db = getDb();
  const supplierCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(suppliers)
    .where(isNull(suppliers.deletedAt));

  if ((supplierCount[0]?.count ?? 0) > 0) {
    return;
  }

  const userId = await getDefaultUserId();

  const retailerRows = await db
    .select({ id: retailers.id, name: retailers.name })
    .from(retailers)
    .where(isNull(retailers.deletedAt));
  const retailerByName = new Map(retailerRows.map((row) => [row.name, row.id]));

  const stageRows = await db
    .select({ id: pipelineStages.id, name: pipelineStages.name })
    .from(pipelineStages)
    .where(eq(pipelineStages.isActive, true));
  const stageByName = new Map(stageRows.map((row) => [row.name, row.id]));

  const insertedSuppliers = await db
    .insert(suppliers)
    .values([
      {
        name: "Jacquard",
        ownerUserId: userId,
        summary: "Mixed-media supplier with active outreach into Michaels and Walmart.",
        notes: "Focus area: buyer feedback, samples, and modular sequencing for craft assortments.",
      },
      {
        name: "Ecorigin",
        ownerUserId: userId,
        summary: "Seasonal program supplier with Walmart celebrations work in motion.",
        notes: "Focus area: trend deck timing, modular review, and line-planning follow-up.",
      },
    ])
    .returning({ id: suppliers.id, name: suppliers.name });

  const supplierByName = new Map(insertedSuppliers.map((row) => [row.name, row.id]));

  await db.insert(supplierContacts).values([
    {
      supplierId: supplierByName.get("Jacquard")!,
      fullName: "Michelle Harmon",
      email: "michelle@jacquard.example",
      title: "VP Sales",
      contactRole: "sales",
      notes: "Primary commercial contact for new program submissions.",
    },
    {
      supplierId: supplierByName.get("Jacquard")!,
      fullName: "Ethan Shaw",
      email: "finance@jacquard.example",
      title: "Controller",
      contactRole: "finance",
      notes: "Reserved for finance-ready workflows later.",
    },
    {
      supplierId: supplierByName.get("Ecorigin")!,
      fullName: "Kelsey Reed",
      email: "kelsey@ecorigin.example",
      title: "National Accounts Director",
      contactRole: "sales",
      notes: "Primary owner for Walmart and seasonal assortment follow-up.",
    },
  ]);

  const insertedBuyers = await db
    .insert(buyers)
    .values([
      {
        retailerId: retailerByName.get("Michaels")!,
        fullName: "Amanda Ritchey",
        email: "amanda@michaels.example",
        position: "Buyer",
      },
      {
        retailerId: retailerByName.get("Walmart")!,
        fullName: "Jordan Blake",
        email: "jordan@walmart.example",
        position: "Buyer",
      },
    ])
    .returning({ id: buyers.id, fullName: buyers.fullName });

  const buyerByName = new Map(insertedBuyers.map((row) => [row.fullName, row.id]));

  const insertedProjects = await db
    .insert(projects)
    .values([
      {
        name: "Leather Paint Introduction",
        supplierId: supplierByName.get("Jacquard")!,
        retailerId: retailerByName.get("Michaels")!,
        buyerId: buyerByName.get("Amanda Ritchey"),
        ownerUserId: userId,
        pipelineStageId: stageByName.get("Samples / Review"),
        status: "active",
        priority: "high",
        summary: "Samples delivered. Team is waiting on timing guidance for set-up review.",
      },
      {
        name: "Walmart Introduction",
        supplierId: supplierByName.get("Jacquard")!,
        retailerId: retailerByName.get("Walmart")!,
        buyerId: buyerByName.get("Jordan Blake"),
        ownerUserId: userId,
        pipelineStageId: stageByName.get("Introduction"),
        status: "active",
        priority: "medium",
        summary: "Buyer transition and open-call positioning still need a clear next move.",
      },
      {
        name: "2026 Celebrations Modular",
        supplierId: supplierByName.get("Ecorigin")!,
        retailerId: retailerByName.get("Walmart")!,
        buyerId: buyerByName.get("Jordan Blake"),
        ownerUserId: userId,
        pipelineStageId: stageByName.get("PDB / Assessment"),
        status: "active",
        priority: "high",
        summary: "Trend deck and sample coordination in progress ahead of modular presentation.",
      },
    ])
    .returning({ id: projects.id, name: projects.name, pipelineStageId: projects.pipelineStageId });

  await db.insert(projectStageHistory).values(
    insertedProjects
      .filter((project) => project.pipelineStageId)
      .map((project) => ({
        projectId: project.id,
        toStageId: project.pipelineStageId!,
        changedByUserId: userId,
      }))
  );

  const projectByName = new Map(insertedProjects.map((row) => [row.name, row.id]));

  await db.insert(tasks).values([
    {
      title: "Follow up with Michaels on leather paint sample feedback",
      supplierId: supplierByName.get("Jacquard")!,
      retailerId: retailerByName.get("Michaels")!,
      projectId: projectByName.get("Leather Paint Introduction")!,
      ownerUserId: userId,
      priority: "high",
      dueDate: addDays(2),
      status: "todo",
      sourceType: "manual",
    },
    {
      title: "Confirm Walmart buyer transition and open-call next step",
      supplierId: supplierByName.get("Jacquard")!,
      retailerId: retailerByName.get("Walmart")!,
      projectId: projectByName.get("Walmart Introduction")!,
      ownerUserId: userId,
      priority: "medium",
      dueDate: addDays(5),
      status: "todo",
      sourceType: "manual",
    },
    {
      title: "Complete trend presentation for Celebrations review",
      supplierId: supplierByName.get("Ecorigin")!,
      retailerId: retailerByName.get("Walmart")!,
      projectId: projectByName.get("2026 Celebrations Modular")!,
      ownerUserId: userId,
      priority: "high",
      dueDate: addDays(3),
      status: "in_progress",
      sourceType: "manual",
    },
  ]);

  await db.insert(activities).values([
    {
      projectId: projectByName.get("Leather Paint Introduction")!,
      userId,
      activityType: "email_received",
      subject: "Amanda requested a full sample assortment",
      body: "Michaels asked for the current color assortment and pricing details before confirming next steps.",
      contactType: "buyer",
      contactName: "Amanda Ritchey",
    },
    {
      projectId: projectByName.get("Walmart Introduction")!,
      userId,
      activityType: "follow_up",
      subject: "Need update on buyer transition",
      body: "Open-call path is still unclear while the retailer finalizes category ownership.",
      contactType: "internal",
      contactName: "CSC Team",
    },
    {
      projectId: projectByName.get("2026 Celebrations Modular")!,
      userId,
      activityType: "meeting",
      subject: "Internal review on trend deck sequencing",
      body: "Team aligned on deck direction and sample order for upcoming modular presentation.",
      contactType: "internal",
      contactName: "CSC Team",
    },
  ]);
}

export async function ensureWorkspaceSeeded() {
  if (workspaceSeedPromise) {
    return workspaceSeedPromise;
  }

  workspaceSeedPromise = (async () => {
    const status = await getWorkspaceStatus();
    if (status.state !== "ready") {
      return status;
    }

    await seedPipelineStages();
    await seedRetailers();
    await seedTeamProfiles();
    await getDefaultUserId();
    await seedSampleWorkspace();

    return status;
  })();

  try {
    return await workspaceSeedPromise;
  } finally {
    workspaceSeedPromise = null;
  }
}

async function getSupplierOptions(): Promise<Option[]> {
  const db = getDb();

  return db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(isNull(suppliers.deletedAt))
    .orderBy(asc(suppliers.name));
}

async function getRetailerOptions(): Promise<Option[]> {
  const db = getDb();

  return db
    .select({ id: retailers.id, name: retailers.name })
    .from(retailers)
    .where(isNull(retailers.deletedAt))
    .orderBy(asc(retailers.name));
}

async function getUserOptions(): Promise<UserOption[]> {
  const db = getDb();

  return db
    .select({
      id: users.id,
      displayName: users.displayName,
      role: users.role,
      jobTitle: users.jobTitle,
      department: users.department,
      avatarColor: users.avatarColor,
    })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.isActive, true)))
    .orderBy(asc(users.displayName));
}

async function getStageOptions() {
  const db = getDb();

  return db
    .select({ id: pipelineStages.id, name: pipelineStages.name, color: pipelineStages.color })
    .from(pipelineStages)
    .where(eq(pipelineStages.isActive, true))
    .orderBy(asc(pipelineStages.displayOrder));
}

async function getProjectOptions(): Promise<ProjectOption[]> {
  const db = getDb();

  return db
    .select({
      id: projects.id,
      name: projects.name,
      supplierId: suppliers.id,
      supplierName: suppliers.name,
    })
    .from(projects)
    .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
    .where(and(isNull(projects.deletedAt), isNull(suppliers.deletedAt)))
    .orderBy(asc(suppliers.name), asc(projects.name));
}

export async function getDashboardData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [supplierCounts, projectCounts, taskCounts, overdueTaskCounts, dueThisWeekCounts] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(suppliers).where(isNull(suppliers.deletedAt)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(and(isNull(projects.deletedAt), eq(projects.status, "active"))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(and(isNull(tasks.deletedAt), ne(tasks.status, "done"))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(and(isNull(tasks.deletedAt), ne(tasks.status, "done"), sql`${tasks.dueDate} < current_date`)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(
          and(
            isNull(tasks.deletedAt),
            ne(tasks.status, "done"),
            sql`${tasks.dueDate} between current_date and current_date + interval '7 day'`
          )
        ),
    ]);

  const upcomingTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueDate: tasks.dueDate,
      status: tasks.status,
      projectName: projects.name,
      supplierName: suppliers.name,
      ownerName: users.displayName,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(suppliers, eq(tasks.supplierId, suppliers.id))
    .leftJoin(users, eq(tasks.ownerUserId, users.id))
    .where(and(isNull(tasks.deletedAt), ne(tasks.status, "done")))
    .orderBy(sql`${tasks.dueDate} is null`, asc(tasks.dueDate), asc(tasks.createdAt))
    .limit(8);

  const recentActivities = await db
    .select({
      id: activities.id,
      subject: activities.subject,
      activityType: activities.activityType,
      happenedAt: activities.happenedAt,
      projectName: projects.name,
      supplierName: suppliers.name,
    })
    .from(activities)
    .innerJoin(projects, eq(activities.projectId, projects.id))
    .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
    .where(and(isNull(activities.deletedAt), isNull(projects.deletedAt), isNull(suppliers.deletedAt)))
    .orderBy(desc(activities.happenedAt))
    .limit(8);

  const staleProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      supplierName: suppliers.name,
      status: projects.status,
      updatedAt: projects.updatedAt,
      lastActivityAt: sql<Date | null>`max(${activities.happenedAt})`,
    })
    .from(projects)
    .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
    .leftJoin(activities, and(eq(activities.projectId, projects.id), isNull(activities.deletedAt)))
    .where(and(isNull(projects.deletedAt), eq(projects.status, "active")))
    .groupBy(projects.id, suppliers.name)
    .orderBy(sql`coalesce(max(${activities.happenedAt}), ${projects.updatedAt}) asc`)
    .limit(6);

  return {
    metrics: {
      supplierCount: supplierCounts[0]?.count ?? 0,
      activeProjectCount: projectCounts[0]?.count ?? 0,
      openTaskCount: taskCounts[0]?.count ?? 0,
      overdueTaskCount: overdueTaskCounts[0]?.count ?? 0,
      dueThisWeekCount: dueThisWeekCounts[0]?.count ?? 0,
    },
    upcomingTasks,
    recentActivities: recentActivities.map((activity) => ({
      ...activity,
      label: formatActivityTypeLabel(activity.activityType),
    })),
    staleProjects,
  };
}

export async function getSuppliersPageData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [supplierRows, userRows, projectCounts, taskCounts, contactCounts] = await Promise.all([
    db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        summary: suppliers.summary,
        notes: suppliers.notes,
        updatedAt: suppliers.updatedAt,
        ownerUserId: suppliers.ownerUserId,
        ownerName: users.displayName,
        ownerColor: users.avatarColor,
      })
      .from(suppliers)
      .leftJoin(users, eq(suppliers.ownerUserId, users.id))
      .where(isNull(suppliers.deletedAt))
      .orderBy(asc(suppliers.name)),
    getUserOptions(),
    db
      .select({ supplierId: projects.supplierId, count: sql<number>`count(*)::int` })
      .from(projects)
      .where(isNull(projects.deletedAt))
      .groupBy(projects.supplierId),
    db
      .select({ supplierId: tasks.supplierId, count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(and(isNull(tasks.deletedAt), ne(tasks.status, "done")))
      .groupBy(tasks.supplierId),
    db
      .select({ supplierId: supplierContacts.supplierId, count: sql<number>`count(*)::int` })
      .from(supplierContacts)
      .where(isNull(supplierContacts.deletedAt))
      .groupBy(supplierContacts.supplierId),
  ]);

  const projectCountBySupplier = new Map(projectCounts.map((row) => [row.supplierId, row.count]));
  const taskCountBySupplier = new Map(taskCounts.map((row) => [row.supplierId, row.count]));
  const contactCountBySupplier = new Map(contactCounts.map((row) => [row.supplierId, row.count]));

  return {
    users: userRows,
    suppliers: supplierRows.map((supplier) => ({
      ...supplier,
      projectCount: projectCountBySupplier.get(supplier.id) ?? 0,
      openTaskCount: taskCountBySupplier.get(supplier.id) ?? 0,
      contactCount: contactCountBySupplier.get(supplier.id) ?? 0,
    })),
  };
}

export async function getSupplierDetailData(supplierId: string) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const supplier = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      summary: suppliers.summary,
      notes: suppliers.notes,
      ownerUserId: suppliers.ownerUserId,
      ownerName: users.displayName,
      ownerColor: users.avatarColor,
      updatedAt: suppliers.updatedAt,
    })
    .from(suppliers)
    .leftJoin(users, eq(suppliers.ownerUserId, users.id))
    .where(and(eq(suppliers.id, supplierId), isNull(suppliers.deletedAt)))
    .limit(1);

  if (!supplier[0]) {
    return null;
  }

  const [projectRows, taskRows, activityRows, retailerRows, stageRows, contactRows, userRows] =
    await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          summary: projects.summary,
          status: projects.status,
          priority: projects.priority,
          stageId: pipelineStages.id,
          stageName: pipelineStages.name,
          stageColor: pipelineStages.color,
          walmartWeekTarget: projects.walmartWeekTarget,
          modEffectiveDate: projects.modEffectiveDate,
          retailerName: retailers.name,
          buyerName: buyers.fullName,
          ownerUserId: projects.ownerUserId,
          ownerName: users.displayName,
          ownerColor: users.avatarColor,
        })
        .from(projects)
        .innerJoin(retailers, eq(projects.retailerId, retailers.id))
        .leftJoin(pipelineStages, eq(projects.pipelineStageId, pipelineStages.id))
        .leftJoin(buyers, eq(projects.buyerId, buyers.id))
        .leftJoin(users, eq(projects.ownerUserId, users.id))
        .where(and(eq(projects.supplierId, supplierId), isNull(projects.deletedAt)))
        .orderBy(desc(projects.updatedAt)),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          dueDate: tasks.dueDate,
          status: tasks.status,
          priority: tasks.priority,
          projectId: tasks.projectId,
          projectName: projects.name,
          ownerUserId: tasks.ownerUserId,
          ownerName: users.displayName,
          ownerColor: users.avatarColor,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(users, eq(tasks.ownerUserId, users.id))
        .where(and(eq(tasks.supplierId, supplierId), isNull(tasks.deletedAt)))
        .orderBy(
          sql`case when ${tasks.status} = 'done' then 1 else 0 end`,
          asc(tasks.dueDate),
          asc(tasks.createdAt)
        ),
      db
        .select({
          id: activities.id,
          subject: activities.subject,
          body: activities.body,
          activityType: activities.activityType,
          happenedAt: activities.happenedAt,
          projectName: projects.name,
        })
        .from(activities)
        .innerJoin(projects, eq(activities.projectId, projects.id))
        .where(and(eq(projects.supplierId, supplierId), isNull(activities.deletedAt), isNull(projects.deletedAt)))
        .orderBy(desc(activities.happenedAt))
        .limit(20),
      getRetailerOptions(),
      getStageOptions(),
      db
        .select({
          id: supplierContacts.id,
          fullName: supplierContacts.fullName,
          title: supplierContacts.title,
          email: supplierContacts.email,
          phone: supplierContacts.phone,
          contactRole: supplierContacts.contactRole,
          notes: supplierContacts.notes,
        })
        .from(supplierContacts)
        .where(and(eq(supplierContacts.supplierId, supplierId), isNull(supplierContacts.deletedAt)))
        .orderBy(asc(supplierContacts.fullName)),
      getUserOptions(),
    ]);

  return {
    supplier: supplier[0],
    users: userRows,
    contacts: contactRows,
    projects: projectRows,
    tasks: taskRows,
    activities: activityRows.map((row) => ({
      ...row,
      label: formatActivityTypeLabel(row.activityType),
    })),
    retailers: retailerRows,
    stages: stageRows,
    projectOptions: projectRows.map((project) => ({
      id: project.id,
      name: project.name,
      supplierId,
      supplierName: supplier[0].name,
    })),
  };
}

export async function getProjectsPageData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [projectRows, stageRows, supplierRows, retailerRows, userRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        priority: projects.priority,
        summary: projects.summary,
        supplierName: suppliers.name,
        retailerName: retailers.name,
        buyerName: buyers.fullName,
        ownerUserId: projects.ownerUserId,
        ownerName: users.displayName,
        ownerColor: users.avatarColor,
        stageId: pipelineStages.id,
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
      })
      .from(projects)
      .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
      .innerJoin(retailers, eq(projects.retailerId, retailers.id))
      .leftJoin(pipelineStages, eq(projects.pipelineStageId, pipelineStages.id))
      .leftJoin(buyers, eq(projects.buyerId, buyers.id))
      .leftJoin(users, eq(projects.ownerUserId, users.id))
      .where(and(isNull(projects.deletedAt), isNull(suppliers.deletedAt), isNull(retailers.deletedAt)))
      .orderBy(asc(suppliers.name), asc(projects.name)),
    getStageOptions(),
    getSupplierOptions(),
    getRetailerOptions(),
    getUserOptions(),
  ]);

  const stageSummary = stageRows.map((stage) => ({
    ...stage,
    count: projectRows.filter((project) => project.stageId === stage.id).length,
  }));

  return {
    projects: projectRows,
    stages: stageRows,
    suppliers: supplierRows,
    retailers: retailerRows,
    users: userRows,
    stageSummary,
  };
}

export async function getTasksPageData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [taskRows, supplierRows, projectRows, userRows] = await Promise.all([
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
        priority: tasks.priority,
        supplierName: suppliers.name,
        projectName: projects.name,
        ownerUserId: tasks.ownerUserId,
        ownerName: users.displayName,
        ownerColor: users.avatarColor,
      })
      .from(tasks)
      .leftJoin(suppliers, eq(tasks.supplierId, suppliers.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.ownerUserId, users.id))
      .where(isNull(tasks.deletedAt))
      .orderBy(
        sql`case when ${tasks.status} = 'done' then 1 else 0 end`,
        sql`${tasks.dueDate} is null`,
        asc(tasks.dueDate),
        asc(tasks.createdAt)
      ),
    getSupplierOptions(),
    getProjectOptions(),
    getUserOptions(),
  ]);

  return {
    tasks: taskRows,
    suppliers: supplierRows,
    projects: projectRows,
    users: userRows,
    metrics: {
      openCount: taskRows.filter((task) => task.status !== "done").length,
      doneCount: taskRows.filter((task) => task.status === "done").length,
      overdueCount: taskRows.filter(
        (task) => task.status !== "done" && task.dueDate && task.dueDate < getTodayIsoDate()
      ).length,
    },
  };
}

export async function getActivitiesPageData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [rows, projectRows] = await Promise.all([
    db
      .select({
        id: activities.id,
        subject: activities.subject,
        body: activities.body,
        activityType: activities.activityType,
        happenedAt: activities.happenedAt,
        projectName: projects.name,
        supplierName: suppliers.name,
      })
      .from(activities)
      .innerJoin(projects, eq(activities.projectId, projects.id))
      .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
      .where(and(isNull(activities.deletedAt), isNull(projects.deletedAt), isNull(suppliers.deletedAt)))
      .orderBy(desc(activities.happenedAt)),
    getProjectOptions(),
  ]);

  const activitiesWithLabels = rows.map((row) => ({
    ...row,
    label: formatActivityTypeLabel(row.activityType),
  }));

  const typeSummary = Array.from(
    activitiesWithLabels.reduce((map, activity) => {
      map.set(activity.label, (map.get(activity.label) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);

  return {
    activities: activitiesWithLabels,
    projects: projectRows,
    typeSummary,
  };
}

export async function getTeamPageData() {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const [teamRows, supplierCounts, projectCounts, taskCounts] = await Promise.all([
    db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        jobTitle: users.jobTitle,
        department: users.department,
        teamPartner: users.teamPartner,
        phone: users.phone,
        bio: users.bio,
        avatarColor: users.avatarColor,
        role: users.role,
      })
      .from(users)
      .where(and(isNull(users.deletedAt), eq(users.isActive, true)))
      .orderBy(asc(users.displayName)),
    db
      .select({ ownerUserId: suppliers.ownerUserId, count: sql<number>`count(*)::int` })
      .from(suppliers)
      .where(isNull(suppliers.deletedAt))
      .groupBy(suppliers.ownerUserId),
    db
      .select({ ownerUserId: projects.ownerUserId, count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(isNull(projects.deletedAt), eq(projects.status, "active")))
      .groupBy(projects.ownerUserId),
    db
      .select({ ownerUserId: tasks.ownerUserId, count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(and(isNull(tasks.deletedAt), ne(tasks.status, "done")))
      .groupBy(tasks.ownerUserId),
  ]);

  const supplierCountByOwner = new Map(supplierCounts.map((row) => [row.ownerUserId, row.count]));
  const projectCountByOwner = new Map(projectCounts.map((row) => [row.ownerUserId, row.count]));
  const taskCountByOwner = new Map(taskCounts.map((row) => [row.ownerUserId, row.count]));

  return {
    users: teamRows.map((user) => ({
      ...user,
      supplierCount: supplierCountByOwner.get(user.id) ?? 0,
      activeProjectCount: projectCountByOwner.get(user.id) ?? 0,
      openTaskCount: taskCountByOwner.get(user.id) ?? 0,
    })),
  };
}

export async function getTeamMemberDetailData(userId: string) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const user = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      jobTitle: users.jobTitle,
      department: users.department,
      teamPartner: users.teamPartner,
      phone: users.phone,
      bio: users.bio,
      avatarColor: users.avatarColor,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt), eq(users.isActive, true)))
    .limit(1);

  if (!user[0]) {
    return null;
  }

  const [supplierRows, projectRows, taskRows, activityRows] = await Promise.all([
    db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        summary: suppliers.summary,
        updatedAt: suppliers.updatedAt,
      })
      .from(suppliers)
      .where(and(eq(suppliers.ownerUserId, userId), isNull(suppliers.deletedAt)))
      .orderBy(asc(suppliers.name)),
    db
      .select({
        id: projects.id,
        name: projects.name,
        summary: projects.summary,
        status: projects.status,
        priority: projects.priority,
        retailerName: retailers.name,
        supplierName: suppliers.name,
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
      })
      .from(projects)
      .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
      .innerJoin(retailers, eq(projects.retailerId, retailers.id))
      .leftJoin(pipelineStages, eq(projects.pipelineStageId, pipelineStages.id))
      .where(and(eq(projects.ownerUserId, userId), isNull(projects.deletedAt)))
      .orderBy(desc(projects.updatedAt)),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        status: tasks.status,
        priority: tasks.priority,
        supplierName: suppliers.name,
        projectName: projects.name,
      })
      .from(tasks)
      .leftJoin(suppliers, eq(tasks.supplierId, suppliers.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(eq(tasks.ownerUserId, userId), isNull(tasks.deletedAt)))
      .orderBy(
        sql`case when ${tasks.status} = 'done' then 1 else 0 end`,
        sql`${tasks.dueDate} is null`,
        asc(tasks.dueDate),
        asc(tasks.createdAt)
      ),
    db
      .select({
        id: activities.id,
        subject: activities.subject,
        body: activities.body,
        activityType: activities.activityType,
        happenedAt: activities.happenedAt,
        supplierName: suppliers.name,
        projectName: projects.name,
      })
      .from(activities)
      .innerJoin(projects, eq(activities.projectId, projects.id))
      .innerJoin(suppliers, eq(projects.supplierId, suppliers.id))
      .where(
        and(
          isNull(activities.deletedAt),
          isNull(projects.deletedAt),
          isNull(suppliers.deletedAt),
          or(eq(activities.userId, userId), eq(projects.ownerUserId, userId))
        )
      )
      .orderBy(desc(activities.happenedAt))
      .limit(20),
  ]);

  return {
    user: user[0],
    metrics: {
      supplierCount: supplierRows.length,
      projectCount: projectRows.length,
      taskCount: taskRows.filter((task) => task.status !== "done").length,
    },
    suppliers: supplierRows,
    projects: projectRows,
    tasks: taskRows,
    activities: activityRows.map((activity) => ({
      ...activity,
      label: formatActivityTypeLabel(activity.activityType),
    })),
  };
}

export async function createSupplier(input: {
  name: string;
  summary?: string;
  notes?: string;
  ownerUserId?: string;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const ownerUserId = input.ownerUserId || (await getDefaultUserId());

  const inserted = await db
    .insert(suppliers)
    .values({
      name: input.name,
      summary: input.summary || null,
      notes: input.notes || null,
      ownerUserId,
    })
    .returning({ id: suppliers.id });

  return inserted[0].id;
}

export async function assignSupplierOwner(input: { supplierId: string; ownerUserId: string }) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  await db
    .update(suppliers)
    .set({ ownerUserId: input.ownerUserId, updatedAt: new Date() })
    .where(eq(suppliers.id, input.supplierId));
}

export async function createSupplierContact(input: {
  supplierId: string;
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  contactRole: SupplierContactRole;
  notes?: string;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  await db.insert(supplierContacts).values({
    supplierId: input.supplierId,
    fullName: input.fullName,
    title: input.title || null,
    email: input.email || null,
    phone: input.phone || null,
    contactRole: input.contactRole,
    notes: input.notes || null,
  });
}

export async function createUser(input: {
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  teamPartner?: string;
  phone?: string;
  bio?: string;
  role: UserRole;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  const colorPool = ["#8863b7", "#5f4689", "#7c6ab0", "#b08ccb", "#7c89d9", "#6b8ea6"];
  const color = colorPool[input.displayName.length % colorPool.length];

  const inserted = await db
    .insert(users)
    .values({
      displayName: input.displayName,
      email: input.email,
      jobTitle: input.jobTitle || null,
      department: input.department || null,
      teamPartner: input.teamPartner || null,
      phone: input.phone || null,
      bio: input.bio || null,
      avatarColor: color,
      role: input.role,
    })
    .returning({ id: users.id });

  return inserted[0].id;
}

export async function createProject(input: {
  supplierId: string;
  name: string;
  retailerId: string;
  summary?: string;
  priority: ProjectPriority;
  pipelineStageId?: string;
  status?: ProjectStatus;
  ownerUserId?: string;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const ownerUserId = input.ownerUserId || (await getDefaultUserId());

  let pipelineStageId = input.pipelineStageId;
  if (!pipelineStageId) {
    const firstStage = await db
      .select({ id: pipelineStages.id })
      .from(pipelineStages)
      .where(eq(pipelineStages.isActive, true))
      .orderBy(asc(pipelineStages.displayOrder))
      .limit(1);
    pipelineStageId = firstStage[0]?.id;
  }

  const inserted = await db
    .insert(projects)
    .values({
      supplierId: input.supplierId,
      name: input.name,
      retailerId: input.retailerId,
      summary: input.summary || null,
      priority: input.priority,
      status: input.status || "active",
      ownerUserId,
      pipelineStageId,
    })
    .returning({ id: projects.id });

  if (pipelineStageId) {
    await db.insert(projectStageHistory).values({
      projectId: inserted[0].id,
      toStageId: pipelineStageId,
      changedByUserId: ownerUserId,
    });
  }

  return inserted[0].id;
}

export async function assignProjectOwner(input: { projectId: string; ownerUserId: string }) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  await db
    .update(projects)
    .set({ ownerUserId: input.ownerUserId, updatedAt: new Date() })
    .where(eq(projects.id, input.projectId));
}

export async function updateProjectStage(input: { projectId: string; pipelineStageId: string }) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const changedByUserId = await getDefaultUserId();

  const existing = await db
    .select({ stageId: projects.pipelineStageId })
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);

  const previousStageId = existing[0]?.stageId ?? null;
  if (previousStageId === input.pipelineStageId) {
    return;
  }

  await db
    .update(projects)
    .set({ pipelineStageId: input.pipelineStageId, updatedAt: new Date() })
    .where(eq(projects.id, input.projectId));

  await db.insert(projectStageHistory).values({
    projectId: input.projectId,
    fromStageId: previousStageId,
    toStageId: input.pipelineStageId,
    changedByUserId,
  });
}

export async function createTask(input: {
  supplierId: string;
  projectId?: string;
  title: string;
  dueDate?: string;
  priority: ProjectPriority;
  ownerUserId?: string;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const ownerUserId = input.ownerUserId || (await getDefaultUserId());

  let supplierId = input.supplierId;
  let retailerId: string | null = null;

  if (input.projectId) {
    const projectContext = await db
      .select({ supplierId: projects.supplierId, retailerId: projects.retailerId })
      .from(projects)
      .where(and(eq(projects.id, input.projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (projectContext[0]) {
      supplierId = projectContext[0].supplierId;
      retailerId = projectContext[0].retailerId;
    }
  }

  await db.insert(tasks).values({
    supplierId,
    retailerId,
    projectId: input.projectId || null,
    title: input.title,
    dueDate: input.dueDate || null,
    priority: input.priority,
    status: "todo",
    ownerUserId,
    sourceType: "manual",
  });
}

export async function assignTaskOwner(input: { taskId: string; ownerUserId: string }) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  await db
    .update(tasks)
    .set({ ownerUserId: input.ownerUserId, updatedAt: new Date() })
    .where(eq(tasks.id, input.taskId));
}

export async function toggleTaskStatus(input: { taskId: string; nextStatus: TaskStatus }) {
  await ensureWorkspaceSeeded();
  const db = getDb();

  await db
    .update(tasks)
    .set({
      status: input.nextStatus,
      completedAt: input.nextStatus === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, input.taskId));
}

export async function createActivity(input: {
  projectId: string;
  subject: string;
  body?: string;
  activityType: ActivityType;
}) {
  await ensureWorkspaceSeeded();
  const db = getDb();
  const userId = await getDefaultUserId();

  await db.insert(activities).values({
    projectId: input.projectId,
    subject: input.subject,
    body: input.body || null,
    activityType: input.activityType,
    userId,
    contactType: "internal",
  });
}
