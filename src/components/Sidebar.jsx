const navItems = [
  'Dashboard',
  'Students',
  // 'AddStudent',
  'Class',
  'Attendance',
  'Scores',
  'Teachers',
  'Reports',
  'Settings',
]

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Technology School</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item ? 'sidebar__link is-active' : 'sidebar__link'}
            key={item}
            onClick={() => onNavigate(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
