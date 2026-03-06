import assert from "node:assert/strict";
import test from "node:test";
import { formatActivityTypeLabel, isKnownActivityType } from "../src/lib/activities/labels";

test("known finance activity types render stable labels", () => {
  assert.equal(formatActivityTypeLabel("commission_report_received"), "Commission report received");
  assert.equal(formatActivityTypeLabel("financial_note"), "Financial note");
  assert.equal(isKnownActivityType("payment_received"), true);
});

test("unknown activity types fall back to humanized labels", () => {
  assert.equal(formatActivityTypeLabel("invoice_follow_up_needed"), "Invoice follow up needed");
  assert.equal(isKnownActivityType("invoice_follow_up_needed"), false);
});
