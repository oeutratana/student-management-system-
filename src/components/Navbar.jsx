import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Navbar = ({ activePage, onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef(null)

  const name = user?.name || "Admin"
  const role = user?.role || "admin"
  const initial = name.charAt(0).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button className="navbar__menu-btn" onClick={onMenuClick} title="Open menu" type="button">
          <Menu size={20} />
        </button>

        <div className="navbar__title">
          <p>Student Management System</p>
          <h1>{activePage}</h1>
        </div>
      </div>

      <div className="navbar__right">
        <div className="navbar__search">
          <Search size={16} />
          <input aria-label="Search" placeholder="Search anything..." type="search" />
        </div>

        <button className="navbar__icon-btn" title="Notifications" type="button">
          <Bell size={18} />
          <span className="navbar__dot" />
        </button>

        <span className="navbar__divider" />

        <div className="navbar__profile" ref={dropdownRef}>
          <button
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="navbar__profile-btn"
            onClick={() => setProfileOpen((current) => !current)}
            type="button"
          >
            <span className="avatar">{initial}</span>
            <span className="navbar__profile-meta">
              <span className="navbar__profile-name">{name}</span>
              <span className="navbar__profile-role">{role}</span>
            </span>
            <ChevronDown className="navbar__profile-chevron" size={16} />
          </button>

          {profileOpen && (
            <div className="navbar__dropdown" role="menu">
              <div className="navbar__dropdown-head">
                <span className="avatar">{initial}</span>
                <span>
                  <strong>{name}</strong>
                  <small>{user?.email || "admin@example.com"}</small>
                </span>
              </div>
              <button onClick={() => navigate("/settings")} role="menuitem" type="button">
                <Settings size={16} />
                Settings
              </button>
              <button onClick={handleLogout} role="menuitem" type="button">
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
