import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUS = new Map([
  ["active", "active"],
  ["archived", "archived"],
  ["not started", "todo"],
  ["in progress", "in_progress"],
  ["complete", "done"],
  ["completed", "done"]
])

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value.trim()
}

function iso(value, label, nullable = false) {
  if (value == null && nullable) return null
  const raw = requiredString(value, label)
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} must be an ISO date`)
  return parsed.toISOString()
}

function status(value, label) {
  const normalized = STATUS.get(requiredString(value, label).toLowerCase())
  if (!normalized) throw new Error(`${label} has an unsupported value`)
  return normalized
}

export function transformExport(source) {
  if (!source || typeof source !== "object") throw new Error("export must be an object")
  const users = Array.isArray(source.users) ? source.users : []
  const projects = Array.isArray(source.projects) ? source.projects : []
  const tasks = Array.isArray(source.tasks) ? source.tasks : []

  const userIds = new Set()
  const mappedUsers = users.map((row, index) => {
    const sourceId = requiredString(row.id, `users[${index}].id`)
    const email = requiredString(row.email, `users[${index}].email`).toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error(`users[${index}].email is invalid`)
    if (userIds.has(sourceId)) throw new Error(`duplicate user id ${sourceId}`)
    userIds.add(sourceId)
    return {
      source_id: sourceId,
      email,
      display_name: requiredString(row.displayName, `users[${index}].displayName`),
      created_at: iso(row.createdAt, `users[${index}].createdAt`)
    }
  })

  const projectIds = new Set()
  const mappedProjects = projects.map((row, index) => {
    const sourceId = requiredString(row.id, `projects[${index}].id`)
    const ownerSourceId = requiredString(row.ownerId, `projects[${index}].ownerId`)
    if (!userIds.has(ownerSourceId)) throw new Error(`projects[${index}] references missing owner ${ownerSourceId}`)
    if (projectIds.has(sourceId)) throw new Error(`duplicate project id ${sourceId}`)
    projectIds.add(sourceId)
    return {
      source_id: sourceId,
      owner_source_id: ownerSourceId,
      name: requiredString(row.name, `projects[${index}].name`),
      status: status(row.status, `projects[${index}].status`),
      created_at: iso(row.createdAt, `projects[${index}].createdAt`),
      updated_at: iso(row.updatedAt, `projects[${index}].updatedAt`)
    }
  })

  const taskIds = new Set()
  const mappedTasks = tasks.map((row, index) => {
    const sourceId = requiredString(row.id, `tasks[${index}].id`)
    const projectSourceId = requiredString(row.projectId, `tasks[${index}].projectId`)
    if (!projectIds.has(projectSourceId)) throw new Error(`tasks[${index}] references missing project ${projectSourceId}`)
    if (taskIds.has(sourceId)) throw new Error(`duplicate task id ${sourceId}`)
    taskIds.add(sourceId)
    return {
      source_id: sourceId,
      project_source_id: projectSourceId,
      title: requiredString(row.title, `tasks[${index}].title`),
      status: status(row.status, `tasks[${index}].status`),
      due_at: iso(row.dueAt, `tasks[${index}].dueAt`, true)
    }
  })

  return {
    exported_at: iso(source.exportedAt, "exportedAt"),
    users: mappedUsers,
    projects: mappedProjects,
    tasks: mappedTasks,
    reconciliation: {
      users: mappedUsers.length,
      projects: mappedProjects.length,
      tasks: mappedTasks.length,
      rejected: 0
    }
  }
}

export function writeBuild(transformed, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true })
  for (const key of ["users", "projects", "tasks"]) {
    fs.writeFileSync(path.join(outputDir, `${key}.json`), `${JSON.stringify(transformed[key], null, 2)}\n`)
  }
  fs.writeFileSync(path.join(outputDir, "reconciliation.json"), `${JSON.stringify(transformed.reconciliation, null, 2)}\n`)
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const inputPath = path.resolve(process.argv[2] || "source/base44-export.sample.json")
  const outputDir = path.resolve(process.argv[3] || "build")
  const transformed = transformExport(JSON.parse(fs.readFileSync(inputPath, "utf8")))
  writeBuild(transformed, outputDir)
  process.stdout.write(`${JSON.stringify(transformed.reconciliation)}\n`)
}
