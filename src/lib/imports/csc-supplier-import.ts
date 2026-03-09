import "server-only";

import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  buyers,
  importIssues,
  importRuns,
  projects,
  retailers,
  supplierAccounts,
  supplierContacts,
  suppliers,
  tasks,
  users,
} from "@/lib/db/schema";
import {
  cscSupplierAssignmentSeeds,
  cscSupplierMasterNames,
} from "@/lib/imports/csc-supplier-seed";
import {
  normalizeAssignmentOwnerName,
  normalizeCustomerName,
} from "@/lib/imports/csc-supplier-normalization";

const MASTER_IMPORT_SOURCE = "csc_supplier_master";
const ASSIGNMENT_IMPORT_SOURCE = "csc_supplier_assignments";
const MASTER_FILE_NAME = "CSC Supplier List.xlsx";
const ASSIGNMENT_FILE_NAME = "Who Works on Which Suppliers at What Retailers (and with Which Support People).xlsx";
const AUTO_CREATED_SUPPLIER_NOTE =
  "Auto-created from CSC assignment workbook because this supplier was missing from the supplier master list.";

async function findCompletedImportRun(sourceType: string) {
  const db = getDb();

  const rows = await db
    .select({ id: importRuns.id })
    .from(importRuns)
    .where(and(eq(importRuns.sourceType, sourceType), eq(importRuns.status, "completed")))
    .limit(1);

  return rows[0]?.id ?? null;
}

async function startImportRun(sourceType: string, fileName: string, createdByUserId?: string) {
  const db = getDb();
  const inserted = await db
    .insert(importRuns)
    .values({
      sourceType,
      fileName,
      status: "running",
      createdByUserId: createdByUserId || null,
    })
    .returning({ id: importRuns.id });

  return inserted[0].id;
}

async function completeImportRun(importRunId: string, status: "completed" | "failed") {
  const db = getDb();

  await db
    .update(importRuns)
    .set({
      status,
      completedAt: new Date(),
    })
    .where(eq(importRuns.id, importRunId));
}

async function removeDemoWorkspaceIfNeeded() {
  const db = getDb();

  const demoSuppliers = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(
      and(
        isNull(suppliers.deletedAt),
        or(
          eq(suppliers.name, "Ecorigin"),
          and(
            eq(suppliers.name, "Jacquard"),
            eq(
              suppliers.notes,
              "Focus area: buyer feedback, samples, and modular sequencing for craft assortments."
            )
          )
        )
      )
    );

  const demoSupplierIds = demoSuppliers.map((row) => row.id);
  if (demoSupplierIds.length === 0) {
    return;
  }

  const demoProjectIds = (
    await db
      .select({ id: projects.id })
      .from(projects)
      .where(inArray(projects.supplierId, demoSupplierIds))
  ).map((row) => row.id);

  if (demoProjectIds.length > 0) {
    await db.delete(tasks).where(or(inArray(tasks.projectId, demoProjectIds), inArray(tasks.supplierId, demoSupplierIds)));
    await db.delete(projects).where(inArray(projects.id, demoProjectIds));
  } else {
    await db.delete(tasks).where(inArray(tasks.supplierId, demoSupplierIds));
  }

  await db.delete(supplierContacts).where(inArray(supplierContacts.supplierId, demoSupplierIds));
  await db.delete(suppliers).where(inArray(suppliers.id, demoSupplierIds));
  await db.delete(buyers).where(inArray(buyers.email, ["amanda@michaels.example", "jordan@walmart.example"]));
}

async function getUserLookup() {
  const db = getDb();
  const teamRows = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.isActive, true)));

  return new Map(teamRows.map((user) => [user.displayName.toLowerCase(), user]));
}

async function getSupplierLookup() {
  const db = getDb();
  const rows = await db
    .select({ id: suppliers.id, name: suppliers.name, notes: suppliers.notes })
    .from(suppliers)
    .where(isNull(suppliers.deletedAt));

  return new Map(rows.map((row) => [row.name, row]));
}

async function getRetailerLookup() {
  const db = getDb();
  const rows = await db
    .select({ id: retailers.id, name: retailers.name })
    .from(retailers)
    .where(isNull(retailers.deletedAt));

  return new Map(rows.map((row) => [row.name, row]));
}

async function insertImportIssues(
  importRunId: string,
  issues: Array<{
    rowRef: string;
    columnRef: string;
    message: string;
    rawPayload: Record<string, unknown>;
  }>
) {
  if (issues.length === 0) {
    return;
  }

  const db = getDb();
  await db.insert(importIssues).values(
    issues.map((issue) => ({
      importRunId,
      severity: "warning" as const,
      rowRef: issue.rowRef,
      columnRef: issue.columnRef,
      message: issue.message,
      rawPayload: issue.rawPayload,
    }))
  );
}

async function resolveOrCreateSupplierId(
  supplierName: string,
  supplierLookup: Map<string, { id: string; name: string; notes: string | null }>,
  missingFromMaster: boolean
) {
  const existing = supplierLookup.get(supplierName);
  if (existing) {
    return existing.id;
  }

  const db = getDb();
  const inserted = await db
    .insert(suppliers)
    .values({
      name: supplierName,
      notes: missingFromMaster ? AUTO_CREATED_SUPPLIER_NOTE : null,
    })
    .returning({ id: suppliers.id, name: suppliers.name, notes: suppliers.notes });

  supplierLookup.set(supplierName, inserted[0]);
  return inserted[0].id;
}

async function resolveOrCreateRetailerId(
  retailerName: string,
  retailerLookup: Map<string, { id: string; name: string }>
) {
  const existing = retailerLookup.get(retailerName);
  if (existing) {
    return existing.id;
  }

  const db = getDb();
  const inserted = await db
    .insert(retailers)
    .values({ name: retailerName })
    .onConflictDoUpdate({
      target: retailers.name,
      set: { updatedAt: new Date(), deletedAt: null },
    })
    .returning({ id: retailers.id, name: retailers.name });

  retailerLookup.set(retailerName, inserted[0]);
  return inserted[0].id;
}

async function reconcileDerivedSupplierOwners(importedSupplierIds: string[]) {
  if (importedSupplierIds.length === 0) {
    return;
  }

  const db = getDb();
  const accountRows = await db
    .select({
      supplierId: supplierAccounts.supplierId,
      eamUserId: supplierAccounts.eamUserId,
    })
    .from(supplierAccounts)
    .where(and(inArray(supplierAccounts.supplierId, importedSupplierIds), isNull(supplierAccounts.deletedAt)));

  const ownerIdsBySupplier = new Map<string, Set<string>>();
  for (const row of accountRows) {
    if (!row.eamUserId) {
      continue;
    }
    const existing = ownerIdsBySupplier.get(row.supplierId) ?? new Set<string>();
    existing.add(row.eamUserId);
    ownerIdsBySupplier.set(row.supplierId, existing);
  }

  for (const supplierId of importedSupplierIds) {
    const ownerIds = Array.from(ownerIdsBySupplier.get(supplierId) ?? []);
    await db
      .update(suppliers)
      .set({
        ownerUserId: ownerIds.length === 1 ? ownerIds[0] : null,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));
  }
}

export async function importCscSupplierMaster(createdByUserId?: string) {
  const completed = await findCompletedImportRun(MASTER_IMPORT_SOURCE);
  if (completed) {
    return completed;
  }

  const db = getDb();
  const importRunId = await startImportRun(MASTER_IMPORT_SOURCE, MASTER_FILE_NAME, createdByUserId);

  try {
    const existingSuppliers = await getSupplierLookup();

    for (const supplierName of cscSupplierMasterNames) {
      if (existingSuppliers.has(supplierName)) {
        continue;
      }

      const inserted = await db
        .insert(suppliers)
        .values({ name: supplierName })
        .returning({ id: suppliers.id, name: suppliers.name, notes: suppliers.notes });

      existingSuppliers.set(supplierName, inserted[0]);
    }

    await completeImportRun(importRunId, "completed");
    return importRunId;
  } catch (error) {
    await completeImportRun(importRunId, "failed");
    throw error;
  }
}

export async function importCscSupplierAssignments(createdByUserId?: string) {
  const completed = await findCompletedImportRun(ASSIGNMENT_IMPORT_SOURCE);
  if (completed) {
    return completed;
  }

  await importCscSupplierMaster(createdByUserId);

  const db = getDb();
  const importRunId = await startImportRun(ASSIGNMENT_IMPORT_SOURCE, ASSIGNMENT_FILE_NAME, createdByUserId);

  try {
    const userLookup = await getUserLookup();
    const supplierLookup = await getSupplierLookup();
    const retailerLookup = await getRetailerLookup();
    const masterSupplierNames = new Set<string>(cscSupplierMasterNames);
    const importIssuesToCreate: Array<{
      rowRef: string;
      columnRef: string;
      message: string;
      rawPayload: Record<string, unknown>;
    }> = [];
    const importedSupplierIds = new Set<string>();

    for (let index = 0; index < cscSupplierAssignmentSeeds.length; index += 1) {
      const row = cscSupplierAssignmentSeeds[index];
      const rowNumber = index + 2;
      const normalizedCustomer = normalizeCustomerName(row.customerName);

      if (normalizedCustomer.isSkipped) {
        importIssuesToCreate.push({
          rowRef: `Row ${rowNumber}`,
          columnRef: "CUSTOMER_NAME",
          message: `Skipped non-standard customer bucket ${normalizedCustomer.canonicalName}.`,
          rawPayload: row,
        });
        continue;
      }

      const supplierId = await resolveOrCreateSupplierId(
        row.supplier,
        supplierLookup,
        !masterSupplierNames.has(row.supplier)
      );
      const retailerId = await resolveOrCreateRetailerId(normalizedCustomer.canonicalName, retailerLookup);
      importedSupplierIds.add(supplierId);

      const normalizedEamName = normalizeAssignmentOwnerName(row.eam);
      const normalizedSpmName = normalizeAssignmentOwnerName(row.spm);
      const eamUser = normalizedEamName ? userLookup.get(normalizedEamName.toLowerCase()) : null;
      const spmUser = normalizedSpmName ? userLookup.get(normalizedSpmName.toLowerCase()) : null;

      if (normalizedEamName && !eamUser) {
        importIssuesToCreate.push({
          rowRef: `Row ${rowNumber}`,
          columnRef: "EAM",
          message: `Could not match EAM ${row.eam} to a CSC team profile.`,
          rawPayload: row,
        });
      }

      if (normalizedSpmName && !spmUser) {
        importIssuesToCreate.push({
          rowRef: `Row ${rowNumber}`,
          columnRef: "SPM",
          message: `Could not match SPM ${row.spm} to a CSC team profile.`,
          rawPayload: row,
        });
      }

      await db
        .insert(supplierAccounts)
        .values({
          supplierId,
          retailerId,
          eamUserId: eamUser?.id ?? null,
          spmUserId: spmUser?.id ?? null,
          sourceCustomerName: normalizedCustomer.sourceCustomerName,
        })
        .onConflictDoUpdate({
          target: [supplierAccounts.supplierId, supplierAccounts.retailerId],
          set: {
            eamUserId: eamUser?.id ?? null,
            spmUserId: spmUser?.id ?? null,
            sourceCustomerName: normalizedCustomer.sourceCustomerName,
            updatedAt: new Date(),
            deletedAt: null,
          },
        });
    }

    await insertImportIssues(importRunId, importIssuesToCreate);
    await reconcileDerivedSupplierOwners(Array.from(importedSupplierIds));
    await completeImportRun(importRunId, "completed");
    return importRunId;
  } catch (error) {
    await completeImportRun(importRunId, "failed");
    throw error;
  }
}

export async function ensureCscSupplierWorkspaceImported(createdByUserId?: string) {
  await removeDemoWorkspaceIfNeeded();
  await importCscSupplierMaster(createdByUserId);
  await importCscSupplierAssignments(createdByUserId);
}
