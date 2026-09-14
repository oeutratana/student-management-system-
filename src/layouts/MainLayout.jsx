import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageName = () => {
    const path = location.pathname;
    const pathMap = {
      '/': 'page.dashboard',
      '/dashboard': 'page.dashboard',
      '/users': 'page.users',
      '/students': 'page.students',
      '/teachers': 'page.teachers',
      '/parents': 'page.parents',
      '/departments': 'page.departments',
      '/classes': 'page.classes',
      '/courses': 'page.courses',
      '/enrollments': 'page.enrollments',
      '/grades': 'page.grades',
      '/attendances': 'page.attendances',
      '/exams': 'page.exams',
      '/fees': 'page.fees',
      '/payments': 'page.payments',
      '/announcements': 'page.announcements',
      '/reports': 'page.reports',
      '/api-explorer': 'page.apiExplorer',
      '/settings': 'page.settings',
      '/login': 'page.login',
    };
    return pathMap[path] || 'page.dashboard';
  };

  const activePage = t(getPageName());

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
