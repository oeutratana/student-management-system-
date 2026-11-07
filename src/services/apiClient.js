import { activeToken, dropSessionByToken } from "./sessionStore"

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

// The API root, used to reach files served straight off the backend.
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "")

// The token of the account this tab is signed in as. Every request of this tab
// carries it, so a session in another tab cannot take this one over.
const getToken = () => activeToken()

// The auth provider registers a callback here instead of being imported, which
// would create a cycle. A 401 then resets the React auth state as well as
// storage, so the UI can never keep showing the account whose token just died.
let unauthorizedHandler = null
let redirectingToLogin = false

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

const endSession = (sentToken) => {
  // A session started while this request was in flight owns the tab now, so a
  // late 401 belonging to the previous session must not sign the new one out.
  if (getToken() !== sentToken) {
    return
  }

  dropSessionByToken(sentToken)
  unauthorizedHandler?.()

  // On the sign-in form already: the state reset above is enough, and a reload
  // here would throw away the error message the login request just produced.
  if (window.location.pathname === "/login" || redirectingToLogin) {
    return
  }

  redirectingToLogin = true

  // The page is reloaded so the app re-initialises from the now-empty session.
  // The current location rides along so the user can be returned to it.
  const from = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?from=${encodeURIComponent(from)}`)
}

const parseResponse = async (response, sentToken) => {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  // Only a request that carried a token may end the session. A 401 from a public
  // endpoint (a wrong password on /login, say) has no token to invalidate, and
  // reloading the page there would wipe the form and the error message instead
  // of letting the caller report it.
  if (response.status === 401 && sentToken) {
    endSession(sentToken)
  }

  if (!response.ok) {
    const message = data?.message || Object.values(data?.errors || {})?.flat()?.[0] || "API request failed"
    const error = new Error(message)
    error.status = response.status
    error.errors = data?.errors
    throw error
  }

  return data
}

const isAbsoluteUrl = (path) => /^https?:\/\//i.test(path)

const toApiPath = (path) => {
  if (!isAbsoluteUrl(path)) {
    return path
  }

  try {
    const url = new URL(path)
    return `${url.pathname}${url.search}`
  } catch {
    return path
  }
}

const extractRows = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  return []
}

const nextPagePath = (payload) => {
  const next = payload?.links?.next ?? payload?.next_page_url ?? payload?.data?.next_page_url
  return next ? toApiPath(next) : null
}

export const apiRequest = async (path, options = {}) => {
  // A caller may supply the token of a session that is not in storage yet (the
  // Google callback receives one in the URL). Everything else uses the token
  // this tab is already signed in with.
  const { token: tokenOverride, ...fetchOptions } = options

  // FormData bodies must keep the browser's own multipart boundary, so the
  // Content-Type header is only set for JSON payloads.
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData

  const headers = {
    Accept: "application/json",
    ...(fetchOptions.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...fetchOptions.headers,
  }

  const token = tokenOverride ?? getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  return parseResponse(response, token)
}

/**
 * Resolve a file stored on the public disk to a browser-loadable URL.
 * Accepts absolute URLs, root-relative paths and bare public paths.
 */
export const storageUrl = (path) => {
  if (!path) {
    return null
  }

  const value = String(path)

  if (isAbsoluteUrl(value) || value.startsWith("data:")) {
    return value
  }

  if (value.startsWith("/")) {
    return `${API_ROOT_URL}${value}`
  }

  return `${API_ROOT_URL}/storage/${value}`
}

export const listAll = async (path) => {
  const rows = []
  let next = path

  while (next) {
    const payload = await apiRequest(next)
    rows.push(...extractRows(payload))
    next = nextPagePath(payload)
  }

  return rows
}

export const resourceApi = (resource) => ({
  list: () => listAll(`/${resource}`),
  show: (id) => apiRequest(`/${resource}/${id}`),
  create: (data) => apiRequest(`/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/${resource}/${id}`, { method: "DELETE" }),
})
