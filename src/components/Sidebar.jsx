import { useNavigate } from "react-router-dom"
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

const sections = [
  {
    label: "Main",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Academics",
    items: [
      { label: "Students", path: "/students", icon: Users },
      { label: "Teachers", path: "/teachers", icon: UserCog },
      { label: "Parents", path: "/parents", icon: UserRound },
      { label: "Departments", path: "/departments", icon: School },
      { label: "Classes", path: "/classes", icon: BookOpen },
      { label: "Courses", path: "/courses", icon: GraduationCap },
    ],
  },
  {
    label: "Records",
    items: [
      { label: "Enrollments", path: "/enrollments", icon: ClipboardList },
      { label: "Grades", path: "/grades", icon: FileText },
      { label: "Attendances", path: "/attendances", icon: CalendarDays },
      { label: "Exams", path: "/exams", icon: Bell },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Fees", path: "/fees", icon: Wallet },
      { label: "Payments", path: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Users", path: "/users", icon: UserCog },
      { label: "Announcements", path: "/announcements", icon: Megaphone },
      { label: "Reports", path: "/reports", icon: Receipt },
      { label: "API Explorer", path: "/api-explorer", icon: Server },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
]

const Sidebar = ({ activePage, isOpen, onClose }) => {
  const navigate = useNavigate()

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
          <span className="sidebar__brand-title">Technology School</span>
          <span className="sidebar__brand-subtitle">Admin Panel</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="sidebar__section-title">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  aria-current={activePage === item.label ? "page" : undefined}
                  className={activePage === item.label ? "sidebar__link is-active" : "sidebar__link"}
                  key={item.label}
                  onClick={() => handleNavigate(item.path, item.label)}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <strong>Technology School</strong>
        Student Management System
      </div>
    </aside>
  )
}

export default Sidebar
