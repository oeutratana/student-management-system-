import { apiRequest, listAll, resourceApi } from "./apiClient"

export const authApi = {
  login: (credentials) => apiRequest("/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => apiRequest("/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiRequest("/me"),
  logout: () => apiRequest("/logout", { method: "POST" }),
}

export const dashboardApi = {
  index: () => apiRequest("/dashboard"),
}

export const reportsApi = {
  list: () => listAll("/reports"),
}

export const studentPortalApi = {
  class: () => apiRequest("/student/class"),
  courses: () => listAll("/student/courses"),
  exams: () => listAll("/student/exams"),
  grades: () => listAll("/student/grades"),
  attendance: () => listAll("/student/attendance"),
  fees: () => listAll("/student/fees"),
  payments: () => listAll("/student/payments"),
  announcements: () => listAll("/student/announcements"),
}

export const usersApi = resourceApi("users")
export const studentsApi = resourceApi("students")
export const teachersApi = resourceApi("teachers")
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
