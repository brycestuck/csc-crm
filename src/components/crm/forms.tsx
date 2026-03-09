import {
  assignProjectOwnerAction,
  assignSupplierOwnerAction,
  assignTaskOwnerAction,
  createActivityAction,
  createProjectAction,
  createSupplierAction,
  createSupplierContactAction,
  createTaskAction,
  createUserAction,
  toggleTaskStatusAction,
  updateProjectStageAction,
} from "@/app/actions";
import { formatActivityTypeLabel } from "@/lib/activities/labels";
import { activityTypes, projectPriorities, supplierContactRoles, userRoles } from "@/lib/types/domain";

type SupplierOption = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  displayName: string;
  role: string;
  jobTitle: string | null;
  avatarColor: string;
};

type ProjectOption = {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
};

type RetailerOption = {
  id: string;
  name: string;
};

type StageOption = {
  id: string;
  name: string;
  color?: string;
};

function inputClassName() {
  return "rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] outline-none transition focus:border-[var(--accent-strong)] focus:bg-white";
}

function cardClassName() {
  return "hub-panel grid gap-3 rounded-[28px] p-5";
}

function ownerOptionLabel(user: UserOption) {
  return user.jobTitle ? `${user.displayName} · ${user.jobTitle}` : user.displayName;
}

type OwnerSelectFormProps = {
  entityIdName: "supplierId" | "projectId" | "taskId";
  entityId: string;
  ownerUserId: string | null;
  returnTo: string;
  users: UserOption[];
  action: (formData: FormData) => void | Promise<void>;
};

function OwnerSelectForm({
  entityIdName,
  entityId,
  ownerUserId,
  returnTo,
  users,
  action,
}: OwnerSelectFormProps) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name={entityIdName} value={entityId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <select
        name="ownerUserId"
        defaultValue={ownerUserId || users[0]?.id || ""}
        className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm outline-none"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {ownerOptionLabel(user)}
          </option>
        ))}
      </select>
      <button className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium text-[var(--ink)]">
        Assign
      </button>
    </form>
  );
}

export function CreateSupplierForm({ users }: { users: UserOption[] }) {
  return (
    <form action={createSupplierAction} className={cardClassName()}>
      <h2 className="text-lg font-semibold text-[var(--ink)]">Add supplier</h2>
      <input name="name" placeholder="Supplier name" required className={inputClassName()} />
      <select name="ownerUserId" defaultValue={users[0]?.id || ""} className={inputClassName()}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {ownerOptionLabel(user)}
          </option>
        ))}
      </select>
      <textarea name="summary" placeholder="Short summary" rows={3} className={inputClassName()} />
      <textarea name="notes" placeholder="Internal notes" rows={4} className={inputClassName()} />
      <button className="rounded-2xl bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.18)]">
        Create supplier
      </button>
    </form>
  );
}

export function CreateUserForm() {
  return (
    <form action={createUserAction} className={cardClassName()}>
      <h2 className="text-lg font-semibold text-[var(--ink)]">Add team member</h2>
      <input name="displayName" placeholder="Full name" required className={inputClassName()} />
      <input name="email" type="email" placeholder="Email" required className={inputClassName()} />
      <input name="jobTitle" placeholder="Job title" className={inputClassName()} />
      <input name="phone" placeholder="Phone" className={inputClassName()} />
      <select name="role" defaultValue="member" className={inputClassName()}>
        {userRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <textarea name="bio" placeholder="Short profile note" rows={4} className={inputClassName()} />
      <button className="rounded-2xl bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.18)]">
        Create profile
      </button>
    </form>
  );
}

export function CreateSupplierContactForm({ supplierId }: { supplierId: string }) {
  return (
    <form action={createSupplierContactAction} className={cardClassName()}>
      <input type="hidden" name="supplierId" value={supplierId} />
      <h3 className="text-lg font-semibold text-[var(--ink)]">Add supplier contact</h3>
      <input name="fullName" placeholder="Full name" required className={inputClassName()} />
      <input name="title" placeholder="Title" className={inputClassName()} />
      <input name="email" type="email" placeholder="Email" className={inputClassName()} />
      <input name="phone" placeholder="Phone" className={inputClassName()} />
      <select name="contactRole" defaultValue="sales" className={inputClassName()}>
        {supplierContactRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <textarea name="notes" placeholder="Notes" rows={3} className={inputClassName()} />
      <button className="rounded-2xl bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.18)]">
        Save contact
      </button>
    </form>
  );
}

export function AssignSupplierOwnerForm(props: Omit<OwnerSelectFormProps, "entityIdName" | "action">) {
  return <OwnerSelectForm {...props} entityIdName="supplierId" action={assignSupplierOwnerAction} />;
}

export function CreateProjectForm({
  supplierId,
  supplierOptions,
  retailers,
  stages,
  users,
  returnTo,
}: {
  supplierId?: string;
  supplierOptions?: SupplierOption[];
  retailers: RetailerOption[];
  stages: StageOption[];
  users: UserOption[];
  returnTo: string;
}) {
  return (
    <form action={createProjectAction} className={cardClassName()}>
      {supplierId ? <input type="hidden" name="supplierId" value={supplierId} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <h3 className="text-lg font-semibold text-[var(--ink)]">Create project</h3>
      {!supplierId ? (
        <select name="supplierId" required defaultValue="" className={inputClassName()}>
          <option value="" disabled>
            Select supplier
          </option>
          {supplierOptions?.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      ) : null}
      <select name="ownerUserId" defaultValue={users[0]?.id || ""} className={inputClassName()}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {ownerOptionLabel(user)}
          </option>
        ))}
      </select>
      <input name="name" placeholder="Project name" required className={inputClassName()} />
      <select name="retailerId" required defaultValue="" className={inputClassName()}>
        <option value="" disabled>
          Select retailer
        </option>
        {retailers.map((retailer) => (
          <option key={retailer.id} value={retailer.id}>
            {retailer.name}
          </option>
        ))}
      </select>
      <select name="pipelineStageId" defaultValue={stages[0]?.id || ""} className={inputClassName()}>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>
      <select name="priority" defaultValue="medium" className={inputClassName()}>
        {projectPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <textarea name="summary" placeholder="Summary" rows={3} className={inputClassName()} />
      <button className="rounded-2xl bg-[var(--accent-strong)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(136,99,183,0.2)]">
        Add project
      </button>
    </form>
  );
}

export function AssignProjectOwnerForm(props: Omit<OwnerSelectFormProps, "entityIdName" | "action">) {
  return <OwnerSelectForm {...props} entityIdName="projectId" action={assignProjectOwnerAction} />;
}

export function CreateTaskForm({
  supplierId,
  supplierOptions,
  returnTo,
  projects,
  users,
}: {
  supplierId?: string;
  supplierOptions?: SupplierOption[];
  returnTo: string;
  projects: ProjectOption[];
  users: UserOption[];
}) {
  return (
    <form action={createTaskAction} className={cardClassName()}>
      {supplierId ? <input type="hidden" name="supplierId" value={supplierId} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <h3 className="text-lg font-semibold text-[var(--ink)]">Add task</h3>
      {!supplierId ? (
        <select name="supplierId" required defaultValue="" className={inputClassName()}>
          <option value="" disabled>
            Select supplier
          </option>
          {supplierOptions?.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      ) : null}
      <select name="ownerUserId" defaultValue={users[0]?.id || ""} className={inputClassName()}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {ownerOptionLabel(user)}
          </option>
        ))}
      </select>
      <input name="title" placeholder="Task title" required className={inputClassName()} />
      <select name="projectId" defaultValue="" className={inputClassName()}>
        <option value="">No project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.supplierName} · {project.name}
          </option>
        ))}
      </select>
      <input name="dueDate" type="date" className={inputClassName()} />
      <select name="priority" defaultValue="medium" className={inputClassName()}>
        {projectPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <button className="rounded-2xl bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.18)]">
        Add task
      </button>
    </form>
  );
}

export function AssignTaskOwnerForm(props: Omit<OwnerSelectFormProps, "entityIdName" | "action">) {
  return <OwnerSelectForm {...props} entityIdName="taskId" action={assignTaskOwnerAction} />;
}

export function CreateActivityForm({
  projectId,
  projects,
  returnTo,
}: {
  projectId?: string;
  projects?: ProjectOption[];
  returnTo: string;
}) {
  const operationalTypes = activityTypes.filter(
    (type) =>
      !type.startsWith("commission_") &&
      !type.startsWith("payment_") &&
      !type.startsWith("data_") &&
      type !== "invoice_sent" &&
      type !== "financial_note" &&
      type !== "budget_update"
  );

  return (
    <form action={createActivityAction} className={cardClassName()}>
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <h3 className="text-lg font-semibold text-[var(--ink)]">Log activity</h3>
      {!projectId ? (
        <select name="projectId" required defaultValue="" className={inputClassName()}>
          <option value="" disabled>
            Select project
          </option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.supplierName} · {project.name}
            </option>
          ))}
        </select>
      ) : null}
      <input name="subject" placeholder="Subject" required className={inputClassName()} />
      <select name="activityType" defaultValue="internal_note" className={inputClassName()}>
        {operationalTypes.map((type) => (
          <option key={type} value={type}>
            {formatActivityTypeLabel(type)}
          </option>
        ))}
      </select>
      <textarea name="body" placeholder="Details" rows={4} className={inputClassName()} />
      <button className="rounded-2xl bg-[var(--accent-deep)] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_28px_rgba(95,70,137,0.18)]">
        Save activity
      </button>
    </form>
  );
}

export function ProjectStageForm({
  projectId,
  returnTo,
  stages,
  currentStageId,
}: {
  projectId: string;
  returnTo: string;
  stages: StageOption[];
  currentStageId: string | null;
}) {
  return (
    <form action={updateProjectStageAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <select
        name="pipelineStageId"
        defaultValue={currentStageId || stages[0]?.id || ""}
        className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none"
      >
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>
      <button className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium text-[var(--ink)]">
        Update
      </button>
    </form>
  );
}

export function TaskStatusForm({
  taskId,
  returnTo,
  currentStatus,
}: {
  taskId: string;
  returnTo: string;
  currentStatus: string;
}) {
  const nextStatus = currentStatus === "done" ? "todo" : "done";

  return (
    <form action={toggleTaskStatusAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <button className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium text-[var(--ink)]">
        {currentStatus === "done" ? "Reopen" : "Mark done"}
      </button>
    </form>
  );
}
