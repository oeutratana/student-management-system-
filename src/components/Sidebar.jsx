import { useNavigate } from "react-router-dom";

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

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();

  const pathMap = {
    'Dashboard': '/dashboard',
    'Students': '/students',
    'Class': '/class',
    'Attendance': '/attendance',
    'Scores': '/scores',
    'Teachers': '/teachers',
    'Reports': '/reports',
    'Settings': '/settings',
  };

  const handleNavigate = (item) => {
    navigate(pathMap[item]);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Technology School</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item ? 'sidebar__link is-active' : 'sidebar__link'}
            key={item}
            onClick={() => handleNavigate(item)}
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
