/**
 * Where the signed-in session lives.
 *
 * A browser can hold more than one account at a time: an admin in one tab and a
 * student in another. A single `auth_token` in localStorage belongs to whichever
 * tab signed in last, so the other tab quietly becomes that account the moment
 * it is reloaded - the app shows "admin" until the reload, and the student
 * portal afterwards.
 *
 * The token of every account is therefore kept separately, and each tab
 * remembers which of those accounts it is signed in as:
 *
 *   localStorage  "auth_sessions"  { "<accountId>": { token, at } }
 *   sessionStorage "auth_account"  "<accountId>"
 *
 * localStorage holds the tokens so a session survives closing the browser;
 * sessionStorage holds the pointer, because that part has to be private to the
 * tab. A tab that has no pointer yet (a freshly opened one) falls back to the
 * account that was used most recently.
 */

const SESSIONS_KEY = "auth_sessions"
const ACCOUNT_KEY = "auth_account"

// Sessions of an earlier version of the app, kept until they are migrated.
const LEGACY_TOKEN_KEY = "auth_token"

const readSessions = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "{}")
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const writeSessions = (sessions) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

const readPointer = () => {
  try {
    return sessionStorage.getItem(ACCOUNT_KEY)
  } catch {
    return null
  }
}

const writePointer = (accountId) => {
  try {
    sessionStorage.setItem(ACCOUNT_KEY, accountId)
  } catch {
    // A browser that refuses to keep a tab-scoped pointer still works, it just
    // falls back to the most recently used session.
  }
}

/**
 * Mark this tab as signed out. The pointer is emptied instead of removed, so a
 * tab that signed out does not fall back to another account's session.
 */
const markSignedOut = () => {
  try {
    sessionStorage.setItem(ACCOUNT_KEY, "")
  } catch {
    // Nothing to mark.
  }
}

/**
 * The account this tab is signed in as: the one it pointed at, or the one that
 * was used most recently when the tab has no pointer yet.
 */
export const activeAccountId = () => {
  const sessions = readSessions()

  const pointed = readPointer()

  if (pointed !== null) {
    // The tab has a pointer: it is signed in as that account, or it signed out
    // on purpose and must not fall back to somebody else's session.
    return pointed && sessions[pointed] ? pointed : null
  }

  // A tab that has never been signed in picks the account that was used most
  // recently, which keeps the "still signed in after a restart" behaviour.
  const latest = Object.entries(sessions).sort((a, b) => (b[1]?.at ?? 0) - (a[1]?.at ?? 0))[0]
  return latest ? latest[0] : null
}

/**
 * The token of the account this tab is signed in as, or null when the tab has
 * no session at all.
 */
export const activeToken = () => {
  const accountId = activeAccountId()
  if (!accountId) {
    return null
  }

  return readSessions()[accountId]?.token ?? null
}

/**
 * Store the token of an account and point this tab at it.
 */
export const saveSession = (accountId, token) => {
  if (!accountId || !token) {
    return
  }

  const sessions = readSessions()
  sessions[accountId] = { token, at: Date.now() }
  writeSessions(sessions)
  writePointer(accountId)
}

/**
 * Forget an account. Other tabs that are signed in as that account lose their
 * session too, which is what signing out means.
 */
export const dropSession = (accountId) => {
  const sessions = readSessions()

  if (sessions[accountId]) {
    delete sessions[accountId]
    writeSessions(sessions)
  }

  if (readPointer() === accountId) {
    markSignedOut()
  }
}

/**
 * Forget the session that owns a token, whichever account it belongs to.
 * Returns the account id when it was known.
 */
export const dropSessionByToken = (token) => {
  if (!token) {
    return null
  }

  const sessions = readSessions()
  const entry = Object.entries(sessions).find(([, session]) => session?.token === token)

  if (entry) {
    dropSession(entry[0])
    return entry[0]
  }

  if (legacyToken() === token) {
    clearLegacyToken()
  }

  return null
}

/**
 * Forget every session of this browser.
 */
export const clearSessions = () => {
  localStorage.removeItem(SESSIONS_KEY)
  clearLegacyToken()

  try {
    sessionStorage.removeItem(ACCOUNT_KEY)
  } catch {
    // Nothing to clear.
  }
}

/**
 * The token of a session started by an earlier version of the app. It is
 * migrated into the per-account store as soon as /api/me says who it belongs
 * to.
 */
export const legacyToken = () => {
  try {
    return localStorage.getItem(LEGACY_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export const clearLegacyToken = () => {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    // Nothing to clear.
  }
}
