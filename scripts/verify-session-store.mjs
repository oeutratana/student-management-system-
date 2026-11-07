import { readFileSync } from "node:fs"

// A minimal browser environment: localStorage is shared by every tab of the
// origin, sessionStorage is private to one tab.
const makeStorage = () => {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    dump: () => Object.fromEntries(map),
  }
}

const localStorage = makeStorage()

// Every tab keeps its own sessionStorage, the way a browser does.
const tabs = new Map()
const openTab = (name) => {
  if (!tabs.has(name)) {
    tabs.set(name, makeStorage())
  }
  globalThis.sessionStorage = tabs.get(name)
  return name
}
const reloadTab = (name) => openTab(name)

globalThis.localStorage = localStorage
globalThis.sessionStorage = tabs.get("tab-a")

const source = readFileSync(
  new URL("../src/services/sessionStore.js", import.meta.url),
  "utf8",
)
const module = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
)

const assert = (label, actual, expected) => {
  const ok = actual === expected
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : ` (got ${actual}, expected ${expected})`}`,
  )
  if (!ok) process.exitCode = 1
}

const sessions = () => JSON.parse(localStorage.getItem("auth_sessions") || "{}")

// --- Tab A: the administrator signs in. -------------------------------------
openTab("tab-a")
module.saveSession("3", "admin-token")
assert("tab A uses the admin token", module.activeToken(), "admin-token")

// --- Tab B: a student signs in in another tab. -----------------------------
openTab("tab-b")
module.saveSession("7", "student-token")
assert("tab B uses the student token", module.activeToken(), "student-token")

// --- Tab A reloads. It must still be the administrator. ---------------------
reloadTab("tab-a")
assert(
  "tab A keeps the admin token after the student signed in elsewhere",
  module.activeToken(),
  "admin-token",
)
assert("tab A still points at the admin account", module.activeAccountId(), "3")

// --- Tab B reloads. It must still be the student. ---------------------------
reloadTab("tab-b")
assert("tab B keeps the student token", module.activeToken(), "student-token")

// --- A fresh tab falls back to the most recently used session. --------------
openTab("tab-c")
assert("a fresh tab picks the most recent session", module.activeAccountId(), "7")

// --- Both sessions live side by side. --------------------------------------
assert("both accounts are stored", Object.keys(sessions()).sort().join(","), "3,7")

// --- Signing out of tab A leaves the other account alone. ------------------
reloadTab("tab-a")
module.dropSessionByToken("admin-token")
assert("the admin session is gone", module.activeToken(), null)
assert("the student session is untouched", sessions()["7"].token, "student-token")
assert(
  "the signed-out tab does not fall back to another account",
  module.activeAccountId(),
  null,
)

// --- Tab B is still the student. -------------------------------------------
reloadTab("tab-b")
assert("tab B is unaffected by the sign-out in tab A", module.activeToken(), "student-token")

// --- A token of an earlier version of the app is still readable. -----------
localStorage.setItem("auth_token", "legacy-token")
assert("the legacy token is available for migration", module.legacyToken(), "legacy-token")
module.clearLegacyToken()
assert("the legacy token is cleared after the migration", module.legacyToken(), null)
