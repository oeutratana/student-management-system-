import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AuthPending from "../components/AuthPending";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { allowedPathsFor, homePathFor } from "../rolePaths";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { authInitializing, user } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // The shell must never be laid out for an account that has not been
  // confirmed yet, so it waits for the same check the route guard does.
  if (authInitializing) {
    return <AuthPending />;
  }

  // A role the app does not recognise is given an empty path set, so this
  // redirect is the fail-closed branch rather than an admin fallback.
  if (!allowedPathsFor(user).has(location.pathname)) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  const getPageName = () => {
    const path = location.pathname;
    const pathMap = {
      "/": "page.dashboard",
      "/dashboard": "page.dashboard",
      "/users": "page.users",
      "/students": "page.students",
      "/teachers": "page.teachers",
      "/parents": "page.parents",
      "/departments": "page.departments",
      "/classes": "page.classes",
      "/courses": "page.courses",
      "/enrollments": "page.enrollments",
      "/grades": "page.grades",
      "/attendances": "page.attendances",
      "/exams": "page.exams",
      "/fees": "page.fees",
      "/payments": "page.payments",
      "/announcements": "page.announcements",
      "/reports": "page.reports",
      "/api-explorer": "page.apiExplorer",
      "/settings": "page.settings",
      "/login": "page.login",
      "/student": "page.dashboard",
      "/student/profile": "page.myProfile",
      "/student/class": "page.myClass",
      "/student/courses": "page.myCourses",
      "/student/grades": "page.myGrades",
      "/student/attendance": "page.myAttendance",
      "/student/fees": "page.myFees",
      "/student/payments": "page.myPayments",
      "/student/announcements": "page.announcements",
      "/payment/payway/return": "page.paymentReturn",
    };
    return pathMap[path] || "page.dashboard";
  };

  const activePage = t(getPageName());

  return (
    <div className={`app-shell${sidebarCollapsed ? " sidebar-is-collapsed" : ""}`}>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <main className="main-panel">
        <Navbar activePage={activePage} onMenuClick={() => setSidebarOpen(true)} />
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default MainLayout;
