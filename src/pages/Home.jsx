import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";

const features = [
  {
    title: "Student Records",
    description: "Manage enrollment, classes and student profiles from one place.",
    icon: Users,
  },
  {
    title: "Attendance Tracking",
    description: "Mark daily attendance and review absence trends quickly.",
    icon: CalendarCheck,
  },
  {
    title: "Academic Reports",
    description: "Follow scores, reports and performance updates for each class.",
    icon: BookOpen,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => navigate("/")}
          type="button"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <GraduationCap size={24} />
          </span>
          <span>
            <span className="block text-lg font-bold">Technology School</span>
            <span className="text-sm text-slate-500">Student Management</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features">Features</a>
          <a href="#overview">Overview</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:-translate-y-0.5"
          onClick={() => navigate("/dashboard")}
          type="button"
        >
          Dashboard
          <ArrowRight size={18} />
        </button>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
            <ShieldCheck size={16} />
            Smart school administration
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Manage students, classes and attendance with clarity.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A focused school management website for admins to monitor academic
            activity, organize records and keep daily operations moving.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:-translate-y-0.5"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Open Dashboard
              <LayoutDashboard size={18} />
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => navigate("/attendances")}
              type="button"
            >
              View Attendance
            </button>
          </div>

          <div className="mt-8 grid max-w-xl gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-3">
            {["Fast records", "Daily reports", "Secure access"].map((item) => (
              <span className="inline-flex items-center gap-2" key={item}>
                <CheckCircle2 className="text-green-500" size={18} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6">
              <img
                alt="Technology school platform preview"
                className="mx-auto h-60 w-full object-contain"
                src={heroImage}
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Students</p>
                  <strong className="mt-1 block text-2xl">24,542</strong>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Teachers</p>
                  <strong className="mt-1 block text-2xl">5,000</strong>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Attendance</p>
                  <strong className="mt-1 block text-2xl">94%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14" id="features">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_10px_40px_-30px_rgba(15,23,42,0.3)] transition-shadow hover:shadow-[0_16px_50px_-30px_rgba(15,23,42,0.4)]"
                key={feature.title}
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={24} />
                </span>
                <h2 className="mt-5 text-xl font-bold">{feature.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white" id="overview">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
          {[
            ["6000", "Schools"],
            ["24542", "Students"],
            ["5000", "Teachers"],
            ["10000", "Parents"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong className="block text-3xl font-extrabold text-slate-900">
                {value}
              </strong>
              <span className="mt-1 block text-sm font-semibold text-slate-500">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-6 text-slate-300" id="contact">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <span>Technology School Student Management System</span>
          <span>Admin tools for school operations</span>
        </div>
      </footer>
    </main>
  );
};

export default Home;
