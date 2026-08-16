const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

const getToken = () => localStorage.getItem("auth_token")

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message || Object.values(data?.errors || {})?.flat()?.[0] || "API request failed"
    throw new Error(message)
  }

  return data
}

export const apiRequest = async (path, options = {}) => {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  return parseResponse(response)
}

export const resourceApi = (resource) => ({
  list: () => apiRequest(`/${resource}`),
  create: (data) => apiRequest(`/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/${resource}/${id}`, { method: "DELETE" }),
})
