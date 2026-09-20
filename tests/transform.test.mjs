import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { transformExport } from "../scripts/transform-export.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sample = JSON.parse(fs.readFileSync(path.join(root, "source/base44-export.sample.json"), "utf8"))

test("transforms every synthetic record and normalizes statuses", () => {
  const result = transformExport(sample)
  assert.deepEqual(result.reconciliation, { users: 2, projects: 1, tasks: 2, rejected: 0 })
  assert.equal(result.users[0].email, "owner@example.test")
  assert.equal(result.projects[0].status, "active")
  assert.equal(result.tasks[0].status, "in_progress")
  assert.equal(result.tasks[1].status, "todo")
  assert.equal(result.tasks[1].due_at, null)
})

test("rejects a project whose owner is absent", () => {
  const invalid = structuredClone(sample)
  invalid.projects[0].ownerId = "usr_missing"
  assert.throws(() => transformExport(invalid), /missing owner/)
})

test("rejects a task whose project is absent", () => {
  const invalid = structuredClone(sample)
  invalid.tasks[0].projectId = "prj_missing"
  assert.throws(() => transformExport(invalid), /missing project/)
})

test("rejects duplicate source identifiers", () => {
  const invalid = structuredClone(sample)
  invalid.users.push(structuredClone(invalid.users[0]))
  assert.throws(() => transformExport(invalid), /duplicate user id/)
})

test("rejects malformed email and date values", () => {
  const badEmail = structuredClone(sample)
  badEmail.users[0].email = "not-an-email"
  assert.throws(() => transformExport(badEmail), /email is invalid/)

  const badDate = structuredClone(sample)
  badDate.tasks[0].dueAt = "not-a-date"
  assert.throws(() => transformExport(badDate), /must be an ISO date/)
})
