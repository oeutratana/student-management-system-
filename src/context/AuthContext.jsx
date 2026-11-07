import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { authApi } from "../services/schoolApi"
import { setUnauthorizedHandler } from "../services/apiClient"
import {
  activeToken,
  clearLegacyToken,
  dropSessionByToken,
  legacyToken,
  saveSession,
} from "../services/sessionStore"
import { normalizeRole } from "../rolePaths"

const AuthContext = createContext(null)

/**
 * Shape an authenticated user coming from the API.
 *
 * The role is normalised here, once, so that every permission check downstream
 * can compare against the lowercase names and an unexpected value can never be
 * mistaken for an elevated role.
 */
const toAuthUser = (raw) => {
  if (!raw || typeof raw !== "object") {
    return null
  }

  return {
    ...raw,
    name: raw.name ?? null,
    email: raw.email ?? null,
    role: normalizeRole(raw.role),
    permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
  }
}

// The API sends the user either on its own (/api/me) or wrapped in a "user"
// key (the sign-in response). Both shapes describe the same session.
const authUserOf = (payload) => toAuthUser(payload?.user ?? payload)

export const AuthProvider = ({ children }) => {
  // The user is deliberately never seeded from localStorage. Storage can still
  // hold the user of a previous session, and rendering that copy is exactly how
  // the app came to show one account while the token in the same tab belonged
  // to another. The token alone says "there may be a session"; only /me decides
  // who that is.
  const [token, setToken] = useState(activeToken)
  const [user, setUser] = useState(null)
  // "restoring" until the check below settles. Routes that can redirect based on
  // the session wait on authInitializing, which additionally requires a token to
  // still be there, so a tab with no session never shows the wait at all.
  const [status, setStatus] = useState("restoring")

  const authInitializing = status === "restoring" && Boolean(token)

  // Bumped by login/logout/reset so a response belonging to a replaced session
  // is recognised as stale and dropped instead of overwriting the current one.
  const generationRef = useRef(0)
  // StrictMode mounts effects twice in development. Only the first run may ask
  // for /me, so the session cannot be restored twice or raced against itself.
  const bootstrapRef = useRef(false)

  const resetSession = useCallback(() => {
    generationRef.current += 1

    const current = activeToken()
    if (current) {
      dropSessionByToken(current)
    }
    clearLegacyToken()

    setToken(null)
    setUser(null)
    setStatus("ready")
  }, [])

  useEffect(() => {
    if (bootstrapRef.current) {
      return undefined
    }
    bootstrapRef.current = true

    // The token of the account this tab is signed in as. A session started by
    // an earlier version of the app still sits in a single key and is migrated
    // once /api/me says which account it belongs to.
    const storedToken = activeToken() ?? legacyToken()
    const generation = generationRef.current

    // The probe describes the session that owned `storedToken`. If the stored
    // token or the generation has moved on by the time it answers, the answer
    // is about a session that no longer exists and must not be applied.
    const currentToken = () => activeToken() ?? legacyToken()
    const isStale = () => generationRef.current !== generation || currentToken() !== storedToken

    // The wait always ends from a callback rather than from the effect body, so
    // nothing here can render a session synchronously. With no stored token
    // there is nothing to restore, but the status still settles on the same path.
    const restore = storedToken ? authApi.me() : Promise.resolve(null)

    restore
      .then((current) => {
        // Nothing was stored, or this answer belongs to a replaced session.
        if (current === null || isStale()) {
          return
        }

        const authUser = authUserOf(current)

        // A payload without a role this app understands cannot authorize
        // anything, so the session ends here instead of rendering a shell whose
        // route and permission logic would have nothing reliable to read.
        if (!authUser?.role) {
          dropSessionByToken(storedToken)
          clearLegacyToken()
          setToken(null)
          setUser(null)
          return
        }

        // The API is the source of truth: it replaces whatever storage held.
        // The token is filed under the account it belongs to, so this tab is
        // pinned to that account and a later sign-in elsewhere cannot take it
        // over.
        if (authUser.id) {
          saveSession(String(authUser.id), storedToken)
          clearLegacyToken()
        }

        setToken(storedToken)
        setUser(authUser)
      })
      .catch((error) => {
        if (isStale()) {
          return
        }

        // A rejected token is dead, so the session ends. A network hiccup is
        // not the token's fault: the session is kept and the next load tries
        // again instead of signing the account out over a dropped connection.
        if (error?.status === 401) {
          dropSessionByToken(storedToken)
          clearLegacyToken()
          setToken(null)
          setUser(null)
          return
        }

        setToken(storedToken)
        setUser(null)
      })
      .finally(() => {
        if (generationRef.current === generation) {
          setStatus("ready")
        }
      })

    return undefined
  }, [])

  // apiClient cannot import this context without a cycle, so it is handed the
  // reset callback at runtime. A 401 then clears storage *and* the React state
  // instead of leaving a signed-in UI on top of a signed-out tab.
  useEffect(() => {
    setUnauthorizedHandler(resetSession)

    return () => setUnauthorizedHandler(null)
  }, [resetSession])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    const authUser = authUserOf(data)

    // Refuse a session the app cannot reason about: a missing token, or a user
    // whose role is not one of the three this app knows.
    if (!data?.token || !authUser?.role || !authUser?.id) {
      throw new Error("The server did not return a usable session.")
    }

    // Anything still in flight belongs to the session being replaced.
    generationRef.current += 1

    // The token is stored under the account it belongs to and this tab is
    // pointed at it. Another tab may sign in as somebody else without touching
    // this session.
    saveSession(String(authUser.id), data.token)
    clearLegacyToken()

    setToken(data.token)
    setUser(authUser)
    setStatus("ready")

    return authUser
  }, [])

  /**
   * Complete a sign-in whose token was issued elsewhere (the Google callback).
   * The token is verified against /me before it is stored, so a hand-edited URL
   * can never leave the app holding a token that belongs to nobody.
   */
  const loginWithToken = useCallback(async (rawToken) => {
    if (!rawToken) {
      throw new Error("The sign-in link did not include a token.")
    }

    const current = await authApi.me(rawToken)
    const authUser = authUserOf(current)

    if (!authUser?.role || !authUser?.id) {
      throw new Error("The server did not return a usable session.")
    }

    generationRef.current += 1

    saveSession(String(authUser.id), rawToken)
    clearLegacyToken()

    setToken(rawToken)
    setUser(authUser)
    setStatus("ready")

    return authUser
  }, [])

  const logout = useCallback(async () => {
    generationRef.current += 1

    try {
      await authApi.logout()
    } catch {
      // Ignore network errors; clear the local session regardless.
    }

    const current = activeToken()
    if (current) {
      dropSessionByToken(current)
    }
    clearLegacyToken()

    setToken(null)
    setUser(null)
    setStatus("ready")
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      // Already normalised by toAuthUser, and the only role the app reads.
      role: user?.role ?? null,
      // A session is only usable once /me has returned a user carrying a role
      // this app understands. Anything less is signed out rather than trusted,
      // which also keeps the redirects from bouncing between /login and a home
      // page that cannot be resolved.
      isAuthenticated: Boolean(token && user?.role),
      authInitializing,
      login,
      loginWithToken,
      logout,
      resetSession,
    }),
    [user, token, authInitializing, login, loginWithToken, logout, resetSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
