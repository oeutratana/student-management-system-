import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({
  activePage,
  children,
  onNavigate,
}) => {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        <Navbar activePage={activePage} />

        <section className="flex-1 p-5 md:p-6">
          {children}
        </section>
      </main>
    </div>
  );
};

export default MainLayout;