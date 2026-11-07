/**
 * Role vocabulary and the routes each role may open.
 *
 * `user.role` is the single source of truth for the role, and it is only ever
 * compared after `normalizeRole`. The API sends lowercase ("admin" /
 * "teacher" / "student"), so a mismatch here must never be interpreted as an
 * elevated role: an unknown or missing role yields `null` and therefore an
 * empty route set, not the full admin set.
 */

export const ADMIN_ROLE = "admin"
export const TEACHER_ROLE = "teacher"
export const STUDENT_ROLE = "student"

export const KNOWN_ROLES = [ADMIN_ROLE, TEACHER_ROLE, STUDENT_ROLE]

// Every authenticated route declared in App.jsx. An admin may open all of them;
// keep this list in step when a route is added there.
export const appPaths = [
  "/dashboard",
  "/users",
  "/students",
  "/teachers",
  "/parents",
  "/departments",
  "/classes",
  "/courses",
  "/enrollments",
  "/grades",
  "/attendances",
  "/exams",
  "/fees",
  "/payments",
  "/announcements",
  "/reports",
  "/api-explorer",
  "/settings",
]

// The student portal. Its own paths keep the portal apart from the admin
// pages that share the same names ("/grades" is the whole school, "/student/
// grades" is the signed-in student), so a role check is a plain path check.
export const studentPortalPaths = [
  "/student",
  "/student/profile",
  "/student/class",
  "/student/courses",
  "/student/grades",
  "/student/attendance",
  "/student/fees",
  "/student/payments",
  "/student/announcements",
  // Where the payment gateway sends the customer back to after paying.
  "/payment/payway/return",
]

export const teacherPaths = new Set([
  "/dashboard",
  "/students",
  "/classes",
  "/courses",
  "/grades",
  "/attendances",
  "/exams",
  "/announcements",
  "/reports",
  "/settings",
])

export const studentPaths = new Set([
  ...studentPortalPaths,
  "/settings",
])

export const adminPaths = new Set(appPaths)

// An authenticated user with an unrecognised role may not open anything until
// the session is resolved.
export const noPaths = new Set()

/**
 * Reduce any role value the API or storage might hand us to one of the three
 * known role names, or `null` when it is not a role this app understands.
 *
 * The API sends the name as a plain string ("admin"). A payload that carries
 * the role as its relation (an object with a "name") is accepted as well, so a
 * change in the shape of the response cannot leave the app without a role and
 * sign the user out.
 */
export const normalizeRole = (role) => {
  const raw = typeof role === "string" ? role : role?.name
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  return KNOWN_ROLES.includes(value) ? value : null
}

export const roleOf = (user) => normalizeRole(user?.role)

export const isAdmin = (user) => roleOf(user) === ADMIN_ROLE

export const allowedPathsFor = (user) => {
  switch (roleOf(user)) {
    case ADMIN_ROLE:
      return adminPaths
    case TEACHER_ROLE:
      return teacherPaths
    case STUDENT_ROLE:
      return studentPaths
    default:
      return noPaths
  }
}

export const canAccessPath = (user, path) => allowedPathsFor(user).has(path)

/**
 * The translation key of the portal a role is signed in to.
 *
 * The shell used to say "Admin Panel" to everybody, which described an admin
 * to a student and a teacher who were actually in their own portal.
 */
export const portalLabelKeyFor = (user) => {
  switch (roleOf(user)) {
    case ADMIN_ROLE:
      return "brand.subtitleAdmin"
    case TEACHER_ROLE:
      return "brand.subtitleTeacher"
    case STUDENT_ROLE:
      return "brand.subtitleStudent"
    default:
      return "brand.subtitle"
  }
}

/**
 * Where a signed-in user belongs. Students have their own home page, so this
 * is not a constant; an unresolved role belongs on the sign-in form.
 */
export const homePathFor = (user) => {
  switch (roleOf(user)) {
    case STUDENT_ROLE:
      return "/student"
    case TEACHER_ROLE:
      return "/dashboard"
    case ADMIN_ROLE:
      return "/dashboard"
    default:
      return "/login"
  }
}
