"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import {
  assignAccountOwners,
  assignProjectOwner,
  assignSupplierOwner,
  assignTaskOwner,
  createActivity,
  createProject,
  createSupplier,
  createSupplierContact,
  createTask,
  createUser,
  toggleTaskStatus,
  updateProjectStage,
} from "@/lib/db/crm";
import {
  activityTypes,
  projectPriorities,
  supplierContactRoles,
  taskStatuses,
  userRoles,
} from "@/lib/types/domain";

const supplierSchema = z.object({
  name: z.string().trim().min(2),
  summary: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
});

const userSchema = z.object({
  displayName: z.string().trim().min(2),
  email: z.string().trim().email(),
  jobTitle: z.string().trim().optional(),
  department: z.string().trim().optional(),
  teamPartner: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  role: z.enum(userRoles),
});

const supplierContactSchema = z.object({
  supplierId: z.string().uuid(),
  fullName: z.string().trim().min(2),
  title: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  contactRole: z.enum(supplierContactRoles),
  notes: z.string().trim().optional(),
});

const projectSchema = z.object({
  supplierId: z.string().uuid(),
  name: z.string().trim().min(2),
  retailerId: z.string().uuid(),
  summary: z.string().trim().optional(),
  priority: z.enum(projectPriorities),
  pipelineStageId: z.string().uuid().optional().or(z.literal("")),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
  returnTo: z.string().optional(),
});

const taskSchema = z.object({
  supplierId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2),
  dueDate: z.string().optional(),
  priority: z.enum(projectPriorities),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
});

const activitySchema = z.object({
  projectId: z.string().uuid(),
  subject: z.string().trim().min(2),
  body: z.string().trim().optional(),
  activityType: z.enum(activityTypes),
});

const projectStageSchema = z.object({
  projectId: z.string().uuid(),
  pipelineStageId: z.string().uuid(),
});

const taskStatusSchema = z.object({
  taskId: z.string().uuid(),
  nextStatus: z.enum(taskStatuses),
  returnTo: z.string().default("/tasks"),
});

const supplierOwnerSchema = z.object({
  supplierId: z.string().uuid(),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
  returnTo: z.string().default("/suppliers"),
});

const projectOwnerSchema = z.object({
  projectId: z.string().uuid(),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
  returnTo: z.string().default("/projects"),
});

const taskOwnerSchema = z.object({
  taskId: z.string().uuid(),
  ownerUserId: z.string().uuid().optional().or(z.literal("")),
  returnTo: z.string().default("/tasks"),
});

const accountOwnerSchema = z.object({
  accountId: z.string().uuid(),
  eamUserId: z.string().uuid().optional().or(z.literal("")),
  spmUserId: z.string().uuid().optional().or(z.literal("")),
  returnTo: z.string().default("/leadership"),
});

export async function createSupplierAction(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    summary: formData.get("summary"),
    notes: formData.get("notes"),
    ownerUserId: formData.get("ownerUserId"),
  });

  const supplierId = await createSupplier({
    ...parsed,
    ownerUserId: currentUser.role === "admin" ? parsed.ownerUserId || undefined : undefined,
  });
  revalidatePath("/");
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplierId}`);
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const parsed = userSchema.parse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    jobTitle: formData.get("jobTitle"),
    department: formData.get("department"),
    teamPartner: formData.get("teamPartner"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    role: formData.get("role"),
  });

  const userId = await createUser(parsed);
  revalidatePath("/team");
  revalidatePath("/suppliers");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  redirect(`/team/${userId}`);
}

export async function createSupplierContactAction(formData: FormData) {
  await requireUser();
  const parsed = supplierContactSchema.parse({
    supplierId: formData.get("supplierId"),
    fullName: formData.get("fullName"),
    title: formData.get("title"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    contactRole: formData.get("contactRole"),
    notes: formData.get("notes"),
  });

  await createSupplierContact({
    ...parsed,
    email: parsed.email || undefined,
  });

  const supplierPath = `/suppliers/${parsed.supplierId}`;
  revalidatePath("/suppliers");
  revalidatePath(supplierPath);
  redirect(supplierPath);
}

export async function assignSupplierOwnerAction(formData: FormData) {
  await requireAdmin();
  const parsed = supplierOwnerSchema.parse({
    supplierId: formData.get("supplierId"),
    ownerUserId: formData.get("ownerUserId"),
    returnTo: formData.get("returnTo"),
  });

  await assignSupplierOwner({
    supplierId: parsed.supplierId,
    ownerUserId: parsed.ownerUserId || null,
  });
  revalidatePath("/");
  revalidatePath("/suppliers");
  revalidatePath("/team");
  revalidatePath("/leadership");
  revalidatePath(parsed.returnTo);
}

export async function createProjectAction(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = projectSchema.parse({
    supplierId: formData.get("supplierId"),
    name: formData.get("name"),
    retailerId: formData.get("retailerId"),
    summary: formData.get("summary"),
    priority: formData.get("priority"),
    pipelineStageId: formData.get("pipelineStageId"),
    ownerUserId: formData.get("ownerUserId"),
    returnTo: formData.get("returnTo"),
  });

  await createProject({
    ...parsed,
    pipelineStageId: parsed.pipelineStageId || undefined,
    ownerUserId: currentUser.role === "admin" ? parsed.ownerUserId || undefined : undefined,
    actorUserId: currentUser.id,
  });

  const supplierPath = `/suppliers/${parsed.supplierId}`;
  const returnTo = parsed.returnTo || supplierPath;
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/team");
  revalidatePath(supplierPath);
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function assignProjectOwnerAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectOwnerSchema.parse({
    projectId: formData.get("projectId"),
    ownerUserId: formData.get("ownerUserId"),
    returnTo: formData.get("returnTo"),
  });

  await assignProjectOwner({
    projectId: parsed.projectId,
    ownerUserId: parsed.ownerUserId || null,
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/team");
  revalidatePath("/leadership");
  revalidatePath(parsed.returnTo);
}

export async function updateProjectStageAction(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = projectStageSchema.parse({
    projectId: formData.get("projectId"),
    pipelineStageId: formData.get("pipelineStageId"),
  });

  const returnTo = String(formData.get("returnTo") || "/projects");
  await updateProjectStage({
    projectId: parsed.projectId,
    pipelineStageId: parsed.pipelineStageId,
    changedByUserId: currentUser.id,
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(returnTo);
}

export async function createTaskAction(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = taskSchema.parse({
    supplierId: formData.get("supplierId"),
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    ownerUserId: formData.get("ownerUserId"),
  });

  const returnTo = String(formData.get("returnTo") || "/tasks");
  await createTask({
    ...parsed,
    projectId: parsed.projectId || undefined,
    dueDate: parsed.dueDate || undefined,
    ownerUserId: currentUser.role === "admin" ? parsed.ownerUserId || undefined : undefined,
    actorUserId: currentUser.id,
  });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/team");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function assignTaskOwnerAction(formData: FormData) {
  await requireAdmin();
  const parsed = taskOwnerSchema.parse({
    taskId: formData.get("taskId"),
    ownerUserId: formData.get("ownerUserId"),
    returnTo: formData.get("returnTo"),
  });

  await assignTaskOwner({
    taskId: parsed.taskId,
    ownerUserId: parsed.ownerUserId || null,
  });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/team");
  revalidatePath("/leadership");
  revalidatePath(parsed.returnTo);
}

export async function toggleTaskStatusAction(formData: FormData) {
  await requireUser();
  const parsed = taskStatusSchema.parse({
    taskId: formData.get("taskId"),
    nextStatus: formData.get("nextStatus"),
    returnTo: formData.get("returnTo"),
  });

  await toggleTaskStatus(parsed);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/team");
  revalidatePath(parsed.returnTo);
}

export async function createActivityAction(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = activitySchema.parse({
    projectId: formData.get("projectId"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    activityType: formData.get("activityType"),
  });

  const returnTo = String(formData.get("returnTo") || "/activity");
  await createActivity({
    ...parsed,
    userId: currentUser.id,
  });
  revalidatePath("/");
  revalidatePath("/activity");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function assignAccountOwnersAction(formData: FormData) {
  await requireAdmin();
  const parsed = accountOwnerSchema.parse({
    accountId: formData.get("accountId"),
    eamUserId: formData.get("eamUserId"),
    spmUserId: formData.get("spmUserId"),
    returnTo: formData.get("returnTo"),
  });

  await assignAccountOwners({
    accountId: parsed.accountId,
    eamUserId: parsed.eamUserId || null,
    spmUserId: parsed.spmUserId || null,
  });

  revalidatePath("/");
  revalidatePath("/suppliers");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/team");
  revalidatePath("/leadership");
  revalidatePath(parsed.returnTo);
}
