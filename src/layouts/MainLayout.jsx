import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageName = () => {
    const path = location.pathname;
    const pathMap = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/users': 'Users',
      '/students': 'Students',
      '/teachers': 'Teachers',
      '/parents': 'Parents',
      '/departments': 'Departments',
      '/classes': 'Classes',
      '/courses': 'Courses',
      '/enrollments': 'Enrollments',
      '/grades': 'Grades',
      '/attendances': 'Attendances',
      '/exams': 'Exams',
      '/fees': 'Fees',
      '/payments': 'Payments',
      '/announcements': 'Announcements',
      '/reports': 'Reports',
      '/api-explorer': 'API Explorer',
      '/settings': 'Settings',
      '/login': 'Login',
    };
    return pathMap[path] || 'Dashboard';
  };

  const activePage = getPageName();

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-panel">
        <Navbar activePage={activePage} onMenuClick={() => setSidebarOpen(true)} />
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default MainLayout;
