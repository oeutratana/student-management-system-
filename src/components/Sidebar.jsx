import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Receipt,
  School,
  Settings,
  Server,
  Users,
  UserCog,
  UserRound,
  Wallet,
} from "lucide-react"

const sidebarSections = [
  {
    label: "sidebar.main",
    items: [{ label: "page.dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "sidebar.academics",
    items: [
      { label: "page.students", path: "/students", icon: Users },
      { label: "page.teachers", path: "/teachers", icon: UserCog },
      { label: "page.parents", path: "/parents", icon: UserRound },
      { label: "page.departments", path: "/departments", icon: School },
      { label: "page.classes", path: "/classes", icon: BookOpen },
      { label: "page.courses", path: "/courses", icon: GraduationCap },
    ],
  },
  {
    label: "sidebar.records",
    items: [
      { label: "page.enrollments", path: "/enrollments", icon: ClipboardList },
      { label: "page.grades", path: "/grades", icon: FileText },
      { label: "page.attendances", path: "/attendances", icon: CalendarDays },
      { label: "page.exams", path: "/exams", icon: Bell },
    ],
  },
  {
    label: "sidebar.finance",
    items: [
      { label: "page.fees", path: "/fees", icon: Wallet },
      { label: "page.payments", path: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "sidebar.system",
    items: [
      { label: "page.users", path: "/users", icon: UserCog },
      { label: "page.announcements", path: "/announcements", icon: Megaphone },
      { label: "page.reports", path: "/reports", icon: Receipt },
      { label: "page.apiExplorer", path: "/api-explorer", icon: Server },
      { label: "page.settings", path: "/settings", icon: Settings },
    ],
  },
]

const teacherPaths = new Set([
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

const studentPaths = new Set(["/announcements", "/settings"])

const visiblePaths = (user) => {
  if (user?.role === "teacher") return teacherPaths
  if (user?.role === "student") return studentPaths
  return null // admin sees everything
}

const Sidebar = ({ activePage, isOpen, onClose }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const paths = visiblePaths(user)
  const sections = paths
    ? sidebarSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => paths.has(item.path)),
        }))
        .filter((section) => section.items.length > 0)
    : sidebarSections

  const handleNavigate = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-logo">
          <GraduationCap size={22} />
        </span>
        <span>
          <span className="sidebar__brand-title">{t("brand.name")}</span>
          <span className="sidebar__brand-subtitle">{t("brand.subtitle")}</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {sections.map((section) => {
          const sectionLabel = t(section.label)
          return (
            <div key={sectionLabel}>
              <p className="sidebar__section-title">{sectionLabel}</p>
              {section.items.map((item) => {
                const Icon = item.icon
                const itemLabel = t(item.label)
                return (
                  <button
                    aria-current={activePage === itemLabel ? "page" : undefined}
                    className={activePage === itemLabel ? "sidebar__link is-active" : "sidebar__link"}
                    key={item.label}
                    onClick={() => handleNavigate(item.path, itemLabel)}
                    type="button"
                  >
                    <Icon size={18} />
                    <span>{itemLabel}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <strong>{t("brand.name")}</strong>
        {t("nav.title")}
      </div>
    </aside>
  )
}

export default Sidebar
