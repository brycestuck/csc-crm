import assert from "node:assert/strict";
import test from "node:test";
import {
  activityTypes,
  cashflowAccounts,
  cashflowCategories,
  commissionStructureTypes,
  reportingCadences,
  supplierContactRoles,
  supplierTransactionTypes,
} from "../src/lib/types/domain";

test("finance-ready domain lists are present in shared types", () => {
  assert.deepEqual(commissionStructureTypes, ["percentage", "tiered", "draw", "custom"]);
  assert.deepEqual(reportingCadences, ["monthly", "quarterly"]);
  assert.ok(supplierContactRoles.includes("finance"));
  assert.ok(activityTypes.includes("commission_report_received"));
  assert.ok(supplierTransactionTypes.includes("invoice"));
  assert.ok(cashflowCategories.includes("commission"));
  assert.ok(cashflowAccounts.includes("working_capital_mm"));
});
