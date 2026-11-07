import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { ADMIN_ROLE, STUDENT_ROLE, TEACHER_ROLE, allowedPathsFor, portalLabelKeyFor, roleOf } from "../rolePaths"
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Receipt,
  School,
  Server,
  Settings,
  Users,
  UserCog,
  UserRound,
  Wallet,
} from "lucide-react"

// Every entry the sidebar can show, in one place. A role picks a subset of
// these through its own section list, and the path sets in rolePaths.js filter
// the result once more, so a menu entry and a route can never disagree.
const navItems = {
  dashboard: { label: "page.dashboard", path: "/dashboard", icon: LayoutDashboard },
  students: { label: "page.students", path: "/students", icon: Users },
  teachers: { label: "page.teachers", path: "/teachers", icon: UserCog },
  parents: { label: "page.parents", path: "/parents", icon: UserRound },
  departments: { label: "page.departments", path: "/departments", icon: School },
  classes: { label: "page.classes", path: "/classes", icon: BookOpen },
  courses: { label: "page.courses", path: "/courses", icon: GraduationCap },
  enrollments: { label: "page.enrollments", path: "/enrollments", icon: ClipboardList },
  grades: { label: "page.grades", path: "/grades", icon: FileText },
  attendances: { label: "page.attendances", path: "/attendances", icon: CalendarDays },
  exams: { label: "page.exams", path: "/exams", icon: Bell },
  fees: { label: "page.fees", path: "/fees", icon: Wallet },
  payments: { label: "page.payments", path: "/payments", icon: CreditCard },
  users: { label: "page.users", path: "/users", icon: UserCog },
  announcements: { label: "page.announcements", path: "/announcements", icon: Megaphone },
  reports: { label: "page.reports", path: "/reports", icon: Receipt },
  apiExplorer: { label: "page.apiExplorer", path: "/api-explorer", icon: Server },
  settings: { label: "page.settings", path: "/settings", icon: Settings },
  myProfile: { label: "page.myProfile", path: "/student/profile", icon: UserRound },
  myClass: { label: "page.myClass", path: "/student/class", icon: School },
  myCourses: { label: "page.myCourses", path: "/student/courses", icon: GraduationCap },
  myGrades: { label: "page.myGrades", path: "/student/grades", icon: FileText },
  myAttendance: { label: "page.myAttendance", path: "/student/attendance", icon: CalendarDays },
  myFees: { label: "page.myFees", path: "/student/fees", icon: Wallet },
  myPayments: { label: "page.myPayments", path: "/student/payments", icon: CreditCard },
}

const adminSections = [
  {
    label: "sidebar.main",
    items: [navItems.dashboard],
  },
  {
    label: "sidebar.academics",
    items: [
      navItems.students,
      navItems.teachers,
      navItems.parents,
      navItems.departments,
      navItems.classes,
      navItems.courses,
    ],
  },
  {
    label: "sidebar.records",
    items: [navItems.enrollments, navItems.grades, navItems.attendances, navItems.exams],
  },
  {
    label: "sidebar.finance",
    items: [navItems.fees, navItems.payments],
  },
  {
    label: "sidebar.system",
    items: [
      navItems.users,
      navItems.announcements,
      navItems.reports,
      navItems.apiExplorer,
      navItems.settings,
    ],
  },
]

const teacherSections = [
  {
    label: "sidebar.main",
    items: [navItems.dashboard],
  },
  {
    label: "sidebar.academics",
    items: [navItems.students, navItems.classes, navItems.courses],
  },
  {
    label: "sidebar.records",
    items: [navItems.grades, navItems.attendances, navItems.exams],
  },
  {
    label: "sidebar.system",
    items: [navItems.announcements, navItems.reports, navItems.settings],
  },
]

const studentSections = [
  {
    label: "sidebar.main",
    items: [
      { label: "page.dashboard", path: "/student", icon: LayoutDashboard },
      navItems.myProfile,
    ],
  },
  {
    label: "sidebar.academics",
    items: [navItems.myClass, navItems.myCourses],
  },
  {
    label: "sidebar.records",
    items: [navItems.myGrades, navItems.myAttendance],
  },
  {
    label: "sidebar.finance",
    items: [navItems.myFees, navItems.myPayments],
  },
  {
    label: "sidebar.system",
    items: [
      { label: "page.announcements", path: "/student/announcements", icon: Megaphone },
      navItems.settings,
    ],
  },
]

// The navigation a role is offered. A role the app does not know gets no
// sections at all rather than the admin ones.
const sectionsForRole = (role) => {
  switch (role) {
    case ADMIN_ROLE:
      return adminSections
    case TEACHER_ROLE:
      return teacherSections
    case STUDENT_ROLE:
      return studentSections
    default:
      return []
  }
}

const Sidebar = ({ activePage, isOpen, onClose, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [openSections, setOpenSections] = useState(
    () => new Set([...adminSections, ...teacherSections, ...studentSections].map((s) => s.label))
  )

  // Filtered from the authenticated user held by AuthContext - the same object
  // the header renders - so the nav can never describe a different account than
  // the one signed in. No role is read from storage.
  const sections = sectionsForRole(roleOf(user))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => allowedPathsFor(user).has(item.path)),
    }))
    .filter((section) => section.items.length > 0)

  const toggleSection = (label) => {
    if (collapsed) return
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const handleNavigate = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <aside className={`sidebar${isOpen ? " is-open" : ""}${collapsed ? " is-collapsed" : ""}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-logo">
          <GraduationCap size={22} />
        </span>
        <span className="sidebar__brand-text">
          <span className="sidebar__brand-title">{t("brand.name")}</span>
          <span className="sidebar__brand-subtitle">{t(portalLabelKeyFor(user))}</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {sections.map((section) => {
          const sectionLabel = t(section.label)
          const isOpenSection = collapsed || openSections.has(section.label)
          return (
            <div
              className={`sidebar__section${isOpenSection ? " is-open" : ""}`}
              key={section.label}
            >
              {!collapsed && (
                <button
                  className="sidebar__section-header"
                  onClick={() => toggleSection(section.label)}
                  title={sectionLabel}
                  type="button"
                >
                  <span className="sidebar__section-title">{sectionLabel}</span>
                  <ChevronRight
                    size={12}
                    className="sidebar__section-chevron"
                  />
                </button>
              )}
              {collapsed && (
                <p className="sidebar__section-title sidebar__section-title--mini" title={sectionLabel}>
                  {sectionLabel.charAt(0)}
                </p>
              )}
              <div className="sidebar__section-items">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const itemLabel = t(item.label)
                  const isActive = activePage === itemLabel
                  return (
                    <button
                      aria-current={isActive ? "page" : undefined}
                      className={`sidebar__link${isActive ? " is-active" : ""}`}
                      data-tooltip={collapsed ? itemLabel : undefined}
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      type="button"
                    >
                      <Icon size={18} />
                      <span className="sidebar__link-label">{itemLabel}</span>
                      {isActive && <span className="sidebar__active-dot" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="sidebar__toggle-wrap">
        <button
          className="sidebar__toggle"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
