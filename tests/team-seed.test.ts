import assert from "node:assert/strict";
import test from "node:test";
import { defaultUserSeed, teamSeedUsers } from "../src/lib/team/seed";

test("CSC team seed mirrors the uploaded roster at a high level", () => {
  assert.equal(teamSeedUsers.length, 16);
  assert.equal(defaultUserSeed.email, "clint@creativesales.biz");
  assert.equal(teamSeedUsers.filter((user) => user.role === "admin").length, 2);
  assert.ok(teamSeedUsers.some((user) => user.displayName === "Vicki" && user.jobTitle === "Director of Finance"));
  assert.equal(new Set(teamSeedUsers.map((user) => user.email)).size, teamSeedUsers.length);
});
