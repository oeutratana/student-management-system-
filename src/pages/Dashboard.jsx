import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Megaphone,
  School,
  TrendingUp,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";
import { dashboardApi } from "../services/schoolApi";

const statMeta = [
  {
    key: "students",
    title: "Students",
    value: "text-indigo-600 bg-indigo-50",
    icon: <Users size={22} />,
    trend: "+12%",
  },
  {
    key: "teachers",
    title: "Teachers",
    value: "text-amber-500 bg-amber-50",
    icon: <ClipboardCheck size={22} />,
    trend: "+4%",
  },
  {
    key: "parents",
    title: "Parents",
    value: "text-emerald-600 bg-emerald-50",
    icon: <UserCircle size={22} />,
    trend: "+8%",
  },
  {
    key: "departments",
    title: "Departments",
    value: "text-pink-500 bg-pink-50",
    icon: <School size={22} />,
    trend: "2 new",
  },
];

const performanceData = [
  { label: "G10", value: 86 },
  { label: "G11", value: 68 },
  { label: "G12", value: 92 },
  { label: "G9", value: 74 },
  { label: "G8", value: 58 },
];

const topScorers = [
  { name: "Branden Harris", score: "99.90%", rank: "1st", bg: "from-emerald-500 to-green-400" },
  { name: "Charles James", score: "99.76%", rank: "2nd", bg: "from-indigo-500 to-violet-500" },
  { name: "Mike Peter", score: "99.50%", rank: "3rd", bg: "from-amber-500 to-yellow-400" },
];

const feesData = [
  { label: "Tuition", value: 78, color: "bg-indigo-500" },
  { label: "Library", value: 54, color: "bg-amber-400" },
  { label: "Activities", value: 90, color: "bg-emerald-500" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: "-",
    teachers: "-",
    parents: "-",
    departments: "-",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .index()
      .then((data) => {
        setStats({
          students: data?.counts?.students ?? data?.students ?? "-",
          teachers: data?.counts?.teachers ?? data?.teachers ?? "-",
          parents: data?.counts?.parents ?? data?.parents ?? "-",
          departments: data?.counts?.departments ?? data?.departments ?? "-",
        });
        setAnnouncements(data?.announcements ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="alert">{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            {greeting}, Admin 👋
          </h1>
        </div>
        <button className="primary-button icon-button" type="button">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statMeta.map((stat) => (
          <div
            key={stat.key}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-18px_rgba(16,24,40,0.2)]"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${stat.value}`}>
                {stat.icon}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <TrendingUp size={13} />
                {stat.trend}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{stat.title}</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              {loading ? "..." : stats[stat.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarDays size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-900">Calendar & Attendance</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="icon-only" title="Previous month" type="button">
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-28 text-center text-sm font-bold text-slate-600">
                  {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <button className="icon-only" title="Next month" type="button">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {day}
                </div>
              ))}

              {Array.from({ length: 35 }).map((_, i) => {
                const isToday = i === 15;
                const hasMark = [10, 24].includes(i);
                const holiday = i >= 30 && i <= 32;
                return (
                  <div
                    key={i}
                    className={`relative grid h-11 place-items-center rounded-xl text-sm font-semibold transition-colors ${
                      isToday
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : holiday
                          ? "bg-emerald-50 text-emerald-600"
                          : hasMark
                            ? "bg-amber-50 text-amber-600"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                    title={holiday ? "Attendance day" : hasMark ? "Event day" : undefined}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Megaphone size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-900">Activities & Announcements</h2>
              </div>
              <button className="secondary-button" type="button">
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="py-6 text-sm text-slate-400">Loading announcements...</p>
              ) : announcements.length ? (
                announcements.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-white"
                  >
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Megaphone size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        {item.publish_date ?? "Latest"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.content ?? item.body ?? ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-slate-400">No announcements yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <TrendingUp size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">School Performance</h2>
            </div>

            <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-2">
              <div className="flex h-56 flex-1 items-end justify-around gap-4">
                {performanceData.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-400 transition-all hover:from-indigo-700 hover:to-violet-500"
                      style={{ height: `${bar.value}%` }}
                      title={`${bar.label}: ${bar.value}%`}
                    />
                    <span className="text-xs font-bold text-slate-400">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-500">Average score</span>
              <span className="text-lg font-extrabold text-indigo-600">82.4%</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
                <Trophy size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Top Scorers</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {topScorers.map((student) => (
                <div
                  key={student.name}
                  className={`rounded-2xl bg-gradient-to-br ${student.bg} p-4 text-center text-white shadow-lg`}
                >
                  <UserCircle size={40} className="mx-auto mb-2 opacity-90" />
                  <h4 className="truncate text-xs font-bold">{student.name}</h4>
                  <div className="my-2 text-2xl font-extrabold">{student.score}</div>
                  <div className="rounded-lg bg-white/20 py-1.5 text-xs font-bold">{student.rank}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CircleDollarSign size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Fees Collection</h2>
            </div>

            <div className="space-y-5">
              {feesData.map((fee) => (
                <div key={fee.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">{fee.label}</span>
                    <span className="font-extrabold text-slate-900">{fee.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${fee.color}`}
                      style={{ width: `${fee.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
