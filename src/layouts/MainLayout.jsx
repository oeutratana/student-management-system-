import { useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  const getPageName = () => {
    const path = location.pathname;
    const pathMap = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/students': 'Students',
      '/add-student': 'AddStudent',
      '/attendance': 'Attendance',
      '/mark-attendance': 'Attendance',
      '/scores': 'Scores',
      '/class': 'Class',
      '/teachers': 'Teachers',
      '/add-teacher': 'AddTeacher',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/login': 'Login',
    };
    return pathMap[path] || 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar activePage={getPageName()} />

      <main className="flex-1 flex flex-col min-h-screen">
        <Navbar activePage={getPageName()} />

        <section className="flex-1 p-5 md:p-6">
          {children}
        </section>
      </main>
    </div>
  );
};

export default MainLayout;
