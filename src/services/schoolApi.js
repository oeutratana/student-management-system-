import { apiRequest, listAll, resourceApi } from "./apiClient"

export const authApi = {
  login: (credentials) => apiRequest("/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => apiRequest("/register", { method: "POST", body: JSON.stringify(data) }),
  me: (token) => apiRequest("/me", token ? { token } : {}),
  logout: () => apiRequest("/logout", { method: "POST" }),
  forgotPassword: (data) => apiRequest("/forgot-password", { method: "POST", body: JSON.stringify(data) }),
  resetPassword: (data) => apiRequest("/reset-password", { method: "POST", body: JSON.stringify(data) }),
}

// Account password setup - public, secured by the single-use setup token
// returned when an admin creates a teacher/student or resends a link. One
// endpoint serves both roles; the role is resolved from the linked user.
export const accountSetupApi = {
  setPassword: (data) => apiRequest("/account/setup-password", { method: "POST", body: JSON.stringify(data) }),

  // Students send a profile image alongside their details, so the payload has
  // to be multipart. The endpoint and its validation are identical either way.
  setPasswordWithProfile: (data) => {
    const body = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        body.append(key, value)
      }
    })

    return apiRequest("/account/setup-password", { method: "POST", body })
  },

  validate: (token) => apiRequest(`/account/setup-password/validate?token=${encodeURIComponent(token)}`),
}

// Teacher invitations - generate (admin), validate and complete (public).
export const teacherInvitationsApi = {
  create: () => apiRequest("/teacher-invitations", { method: "POST" }),
  show: (token) => apiRequest(`/teacher-invitations/${token}`),
  register: (token, data) => apiRequest(`/teacher-invitations/${token}/register`, { method: "POST", body: JSON.stringify(data) }),
}

export const dashboardApi = {
  index: () => apiRequest("/dashboard"),
}

export const reportsApi = {
  list: () => listAll("/reports"),
}

// The student portal. Every endpoint resolves the student from the token, so
// none of them takes a student id: there is nothing for the browser to forge.
export const studentPortalApi = {
  dashboard: () => apiRequest("/student/dashboard"),
  profile: () => apiRequest("/student/profile"),
  class: () => apiRequest("/student/class"),
  courses: { list: () => listAll("/student/courses") },
  grades: { list: () => listAll("/student/grades") },
  attendance: { list: () => listAll("/student/attendance") },
  fees: { list: () => listAll("/student/fees") },
  payments: { list: () => listAll("/student/payments") },
  announcements: { list: () => listAll("/student/announcements") },

  // Fee payment. The amount is worked out by the server from the fee and the
  // payments already recorded against it, so nothing about the sum is sent
  // from here. Starting a payment records nothing yet: it opens a session
  // with the gateway that the student then pays.
  payFee: (feeId) => apiRequest(`/student/fees/${feeId}/pay`, { method: "POST" }),

  // What the gateway says about a payment the student started.
  paymentStatus: (tranId) => apiRequest(`/student/payments/payway/${tranId}/status`),
}

export const usersApi = {
  ...resourceApi("users"),
  resendSetupLink: (id) => apiRequest(`/users/${id}/setup-password/resend`, { method: "POST" }),
}
export const studentsApi = {
  ...resourceApi("students"),
  resendSetupLink: (id) => apiRequest(`/students/${id}/setup-password/resend`, { method: "POST" }),
}
export const teachersApi = {
  ...resourceApi("teachers"),
  resendSetupLink: (id) => apiRequest(`/teachers/${id}/setup-password/resend`, { method: "POST" }),
}
export const parentsApi = resourceApi("parents")
export const departmentsApi = resourceApi("departments")
export const classesApi = resourceApi("classes")
export const coursesApi = resourceApi("courses")
export const enrollmentsApi = resourceApi("enrollments")
export const gradesApi = resourceApi("grades")
export const attendancesApi = resourceApi("attendances")
export const examsApi = resourceApi("exams")
export const feesApi = resourceApi("fees")
export const paymentsApi = resourceApi("payments")
export const announcementsApi = resourceApi("announcements")

const readPath = (item, path) =>
  path.split(".").reduce((value, key) => value?.[key], item)

export const toOptions = (rows, label) => {
  const format = typeof label === "function" ? label : (item) => readPath(item, label)
  return (rows ?? []).map((item) => ({
    value: item.id,
    label: format(item) ?? item.id,
  }))
}

/**
 * Label a student in a dropdown.
 *
 * A student enrolled by an admin has no name until they complete their own
 * setup, so fall back to their student code rather than showing "undefined".
 */
export const studentOptionLabel = (item) =>
  [item?.first_name, item?.last_name].filter(Boolean).join(" ") ||
  item?.student_code ||
  `#${item?.id}`
