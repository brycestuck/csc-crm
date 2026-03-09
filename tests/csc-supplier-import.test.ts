import assert from "node:assert/strict";
import test from "node:test";
import {
  cscSupplierAssignmentSeeds,
  cscSupplierMasterNames,
} from "../src/lib/imports/csc-supplier-seed";
import {
  deriveSupplierOwnerSummary,
  normalizeAssignmentOwnerName,
  normalizeCustomerName,
} from "../src/lib/imports/csc-supplier-normalization";

test("CSC workbook seed data matches the provided supplier and assignment files", () => {
  assert.equal(cscSupplierMasterNames.length, 30);
  assert.equal(cscSupplierAssignmentSeeds.length, 127);
  assert.ok(cscSupplierMasterNames.includes("Jacquard"));
  assert.ok(cscSupplierAssignmentSeeds.some((row) => row.supplier === "Trend Glass"));
});

test("customer normalization canonicalizes Walmart and skips program buckets", () => {
  assert.deepEqual(normalizeCustomerName("Wal-Mart"), {
    sourceCustomerName: "Wal-Mart",
    canonicalName: "Walmart",
    isSkipped: false,
  });
  assert.equal(normalizeCustomerName("BD Fees").isSkipped, true);
});

test("owner normalization maps known aliases and preserves blanks", () => {
  assert.equal(normalizeAssignmentOwnerName("Chasity"), "Chas");
  assert.equal(normalizeAssignmentOwnerName("Stacie"), "Stacie");
  assert.equal(normalizeAssignmentOwnerName(""), null);
});

test("supplier owner summary resolves single owner, multiple owners, and fallback states", () => {
  assert.deepEqual(
    deriveSupplierOwnerSummary(
      [{ eamDisplayName: "Ragan", eamUserId: "u1" }],
      null,
      null
    ),
    {
      label: "Ragan",
      ownerUserId: "u1",
      state: "single",
    }
  );

  assert.deepEqual(
    deriveSupplierOwnerSummary(
      [
        { eamDisplayName: "Ragan", eamUserId: "u1" },
        { eamDisplayName: "Melanie", eamUserId: "u2" },
      ],
      null,
      null
    ),
    {
      label: "Multiple owners",
      ownerUserId: null,
      state: "multiple",
    }
  );

  assert.deepEqual(
    deriveSupplierOwnerSummary([], "Clint", "u3"),
    {
      label: "Clint",
      ownerUserId: "u3",
      state: "single",
    }
  );
});
