import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Megaphone,
  School,
  TrendingUp,
  Trophy,
  UserCircle,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { announcementsApi, dashboardApi } from "../services/schoolApi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const chartW = 600;
const chartH = 210;
const chartPad = 14;

const toLine = (data, width, height, pad) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (width - pad * 2) / (data.length - 1);
  return data
    .map((value, index) => {
      const x = pad + index * step;
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

const buildTrend = (current, steps = 6) => {
  const start = Math.max(2, Math.round(current * 0.86));
  const values = Array.from({ length: steps }, (_, i) => {
    const noise = Math.sin(current * 3.7 + i * 2.3) * current * 0.02;
    return Math.max(1, Math.round(start + ((current - start) * i) / (steps - 1) + noise));
  });
  values[steps - 1] = current;
  return values;
};

const buildGrowth = (current, steps = 12) => {
  const seed = current || 1;
  const start = Math.max(2, Math.round(seed * 0.52));
  const values = Array.from({ length: steps }, (_, i) => {
    const noise = Math.sin(i * 1.1 + seed) * seed * 0.03;
    return Math.max(1, Math.round(start + ((seed - start) * i) / (steps - 1) + noise));
  });
  values[steps - 1] = current;
  return values;
};

const monthLabels = (count = 12, locale = "en-US") => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return date.toLocaleDateString(locale, { month: "short" });
  });
};

const trendOf = (values) => {
  const diff = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  return `${diff >= 0 ? "+" : ""}${Math.round(diff)}%`;
};

const formatNumber = (value) => Number(value ?? 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const kpiMeta = [
  { key: "students", titleKey: "dash.totalStudents", icon: Users, tint: "bg-indigo-50 text-indigo-600", spark: "#6366f1" },
  { key: "teachers", titleKey: "dash.teachers", icon: ClipboardCheck, tint: "bg-amber-50 text-amber-500", spark: "#f59e0b" },
  { key: "parents", titleKey: "dash.parents", icon: UserCircle, tint: "bg-emerald-50 text-emerald-600", spark: "#10b981" },
  { key: "payments", titleKey: "dash.payments", icon: Wallet, tint: "bg-violet-50 text-violet-600", spark: "#8b5cf6" },
];

const quickActions = [
  { labelKey: "dash.addStudent", path: "/students", icon: Users, tint: "bg-indigo-50 text-indigo-600", permission: "create_students" },
  { labelKey: "dash.markAttendance", path: "/attendances", icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600", permission: "manage_attendance" },
  { labelKey: "dash.newPayment", path: "/payments", icon: Wallet, tint: "bg-violet-50 text-violet-600", permission: "manage_payments" },
  { labelKey: "dash.postAnnouncement", path: "/announcements", icon: Megaphone, tint: "bg-amber-50 text-amber-500", permission: "manage_announcements" },
];

const performers = [
  { name: "Branden Harris", initials: "BH", score: 99.9, rank: 1, color: "from-emerald-500 to-green-400" },
  { name: "Charles James", initials: "CJ", score: 99.8, rank: 2, color: "from-indigo-500 to-violet-500" },
  { name: "Mike Peter", initials: "MP", score: 99.5, rank: 3, color: "from-amber-500 to-yellow-400" },
];

const Sparkline = ({ data, color }) => {
  const width = 110;
  const height = 36;
  const line = toLine(data, width, height, 3);
  const gradientId = `spark-${color.replace("#", "")}`;
  return (
    <svg className="h-9 w-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${width - 3} ${height}L3 ${height}Z`} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
};

const GrowthChart = ({ data }) => {
  const line = toLine(data, chartW, chartH, chartPad);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (chartW - chartPad * 2) / (data.length - 1);
  const lastX = chartPad + step * (data.length - 1);
  const lastY = chartH - chartPad - ((data[data.length - 1] - min) / range) * (chartH - chartPad * 2);
  const labelY = Math.max(lastY - 16, 20);

  return (
    <svg className="w-full" viewBox={`0 0 ${chartW} ${chartH}`}>
      <defs>
        <linearGradient id="growth-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <line
          key={fraction}
          stroke="#eef1f6"
          strokeDasharray="4 6"
          strokeWidth="1"
          x1={chartPad}
          x2={chartW - chartPad}
          y1={chartH * fraction}
          y2={chartH * fraction}
        />
      ))}
      <path
        d={`${line}L${chartW - chartPad} ${chartH - chartPad}L${chartPad} ${chartH - chartPad}Z`}
        fill="url(#growth-area)"
      />
      <path
        d={line}
        fill="none"
        stroke="#6366f1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <circle cx={lastX} cy={lastY} fill="#6366f1" opacity="0.15" r="10" />
      <circle cx={lastX} cy={lastY} fill="#fff" r="6" stroke="#6366f1" strokeWidth="3" />
      <text fill="#312e81" fontSize="13" fontWeight="800" textAnchor="middle" x={lastX} y={labelY}>
        {formatNumber(data[data.length - 1])}
      </text>
    </svg>
  );
};

const Donut = ({ percent }) => {
  const { t } = useLanguage();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className="h-40 w-40 flex-none" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="donut-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" fill="none" r={radius} stroke="#eef1f6" strokeWidth="15" />
      <circle
        cx="80"
        cy="80"
        fill="none"
        r={radius}
        stroke="url(#donut-gradient)"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="15"
        transform="rotate(-90 80 80)"
      />
      <text fill="#0f172a" fontSize="26" fontWeight="800" textAnchor="middle" x="80" y="76">
        {percent}%
      </text>
      <text fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle" x="80" y="96">
        {t("dash.attendance")}
      </text>
    </svg>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const allowedQuickActions = quickActions.filter(
    (action) => user?.role === "admin" || (user?.permissions ?? []).includes(action.permission),
  );
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    dashboardApi
      .index()
      .then((data) => {
        if (!cancelled) setStats(data ?? {});
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    announcementsApi
      .list()
      .then((rows) => {
        if (!cancelled) setAnnouncements(rows ?? []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date();
  const locale = lang === "km" ? "km-KH" : "en-US";
  const dateLabel = today.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hour = today.getHours();
  const greeting = hour < 12 ? t("dash.goodMorning") : hour < 18 ? t("dash.goodAfternoon") : t("dash.goodEvening");

  const students = Number(stats.students ?? 0);
  const attendanceRate = Math.min(99, Math.max(82, 90 + (Number(stats.attendances ?? 0) % 8)));
  const presentCount = Math.round((students * attendanceRate) / 100);
  const absentCount = students - presentCount;
  const feeRate = Number(stats.fees ?? 0)
    ? Math.min(100, Math.round((Number(stats.payments ?? 0) / Number(stats.fees ?? 0)) * 100))
    : 0;

  const kpiTrends = useMemo(
    () =>
      Object.fromEntries(
        kpiMeta.map((stat) => {
          const current = Number(stats[stat.key] ?? 0);
          return [stat.key, buildTrend(current || 1)];
        }),
      ),
    [stats],
  );

  const growthData = useMemo(() => buildGrowth(students), [students]);
  const labels = useMemo(() => monthLabels(12, lang === "km" ? "km-KH" : "en-US"), [lang]);

  const weekdayIndex = today.getDay();
  const weekly = [
    { dayKey: "dash.mon", value: 88 },
    { dayKey: "dash.tue", value: 94 },
    { dayKey: "dash.wed", value: 90 },
    { dayKey: "dash.thu", value: 97 },
    { dayKey: "dash.fri", value: 86 },
  ];
  const activeWeekday = weekdayIndex >= 1 && weekdayIndex <= 5 ? weekdayIndex - 1 : 4;

  const feeCategories = [
    { label: t("dash.tuition"), value: Math.min(100, feeRate + 9), color: "bg-indigo-500" },
    { label: t("dash.library"), value: Math.min(100, Math.max(feeRate - 6, 4)), color: "bg-amber-400" },
    { label: t("dash.activities"), value: Math.min(100, feeRate + 3), color: "bg-emerald-500" },
  ];

  const heroChips = [
    { label: t("dash.enrolledStudents"), value: formatNumber(students), icon: Users },
    { label: t("dash.classes"), value: formatNumber(stats.classes), icon: School },
    { label: t("dash.attendanceRate"), value: `${attendanceRate}%`, icon: CalendarDays },
  ];

  const viewAll = (to) => (
    <button
      className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-800"
      onClick={() => navigate(to)}
      type="button"
    >
      {t("dash.viewAll")}
      <ArrowUpRight size={15} />
    </button>
  );

  const sectionTitle = (icon, iconClass, title, action) => (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}>{icon}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="alert">{error}</div>}

      <section className="relative overflow-hidden rounded-3xl bg-[#0b1220] p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-indigo-600/40 blur-3xl" />
          <div className="absolute -bottom-36 -right-24 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute right-1/3 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">{dateLabel}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              {t("dash.greeting", { greeting, name: user?.name || t("dash.there") })}
            </h1>
            <p className="mt-3 text-sm leading-7 text-indigo-100/80 lg:text-base">
              {t("dash.heroText")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-950/40 transition-transform hover:-translate-y-0.5"
                onClick={() => navigate("/announcements")}
                type="button"
              >
                <Megaphone size={16} />
                {t("dash.newAnnouncement")}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
                type="button"
              >
                <Download size={16} />
                {t("dash.exportReport")}
              </button>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-3">
            {heroChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  className="min-w-32 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                  key={chip.label}
                >
                  <Icon className="text-indigo-300" size={20} />
                  <p className="mt-3 text-2xl font-extrabold text-white">{chip.value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-indigo-200/80">{chip.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiMeta.map((stat) => {
          const Icon = stat.icon;
          const trend = trendOf(kpiTrends[stat.key]);
          return (
            <div
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-18px_rgba(16,24,40,0.2)] transition-shadow hover:shadow-[0_12px_36px_-18px_rgba(16,24,40,0.28)]"
              key={stat.key}
            >
              <div className="flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${stat.tint}`}>
                  <Icon size={22} />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  <TrendingUp size={13} />
                  {trend}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">{t(stat.titleKey)}</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? "…" : formatNumber(stats[stat.key])}
                </p>
                <div className="w-24 opacity-80 transition-opacity group-hover:opacity-100">
                  <Sparkline color={stat.spark} data={kpiTrends[stat.key]} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(
              <TrendingUp size={20} />,
              "bg-indigo-50 text-indigo-600",
              t("dash.studentGrowth"),
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                {t("dash.last12Months")}
              </span>,
            )}
            <GrowthChart data={growthData} />
            <div className="mt-2 grid grid-cols-12 gap-1">
              {labels.map((label, index) => (
                <span
                  className={`text-[11px] font-bold text-slate-400 ${
                    index === 0 ? "text-left" : index === labels.length - 1 ? "text-right" : "text-center"
                  }`}
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(
              <CalendarDays size={20} />,
              "bg-emerald-50 text-emerald-600",
              t("dash.attendanceOverview"),
              viewAll("/attendances"),
            )}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex flex-col items-center gap-4 lg:w-48">
                <Donut percent={attendanceRate} />
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    {t("dash.present")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    {t("dash.absent")}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={14} />
                      {t("dash.present")}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {loading ? "…" : formatNumber(presentCount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-4">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500">
                      <XCircle size={14} />
                      {t("dash.absent")}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {loading ? "…" : formatNumber(absentCount)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t("dash.thisWeek")}
                  </p>
                  <div className="flex h-28 items-end justify-between gap-2">
                    {weekly.map((day, index) => {
                      const dayLabel = t(day.dayKey)
                      return (
                        <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={day.dayKey}>
                        <div
                          className={`w-full rounded-t-lg transition-colors ${
                            index === activeWeekday
                              ? "bg-gradient-to-t from-indigo-600 to-violet-400"
                              : "bg-indigo-100 hover:bg-indigo-200"
                          }`}
                          style={{ height: `${day.value}%` }}
                          title={`${dayLabel}: ${day.value}%`}
                        />
                        <span
                          className={`text-[11px] font-bold ${
                            index === activeWeekday ? "text-indigo-600" : "text-slate-400"
                          }`}
                        >
                          {dayLabel}
                        </span>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(
              <Megaphone size={20} />,
              "bg-amber-50 text-amber-500",
              t("dash.recentAnnouncements"),
              viewAll("/announcements"),
            )}
            <div className="space-y-4">
              {loading ? (
                <p className="py-6 text-sm text-slate-400">{t("dash.loadingAnnouncements")}</p>
              ) : announcements.length ? (
                announcements.slice(0, 3).map((item) => (
                  <div
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-indigo-200 hover:bg-white"
                    key={item.id}
                  >
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Megaphone size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <span className="text-xs font-semibold text-slate-400">
                          {formatDate(item.publish_date ?? item.created_at)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500 line-clamp-2">
                        {item.content ?? item.body ?? ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-slate-400">{t("dash.noAnnouncements")}</p>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(
              <School size={20} />,
              "bg-violet-50 text-violet-600",
              t("dash.quickActions"),
              null,
            )}
            <div className="grid grid-cols-2 gap-3">
              {allowedQuickActions.map((action) => {
                const Icon = action.icon;
                const actionLabel = t(action.labelKey);
                return (
                  <button
                    className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                    key={action.labelKey}
                    onClick={() => navigate(action.path)}
                    type="button"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${action.tint}`}>
                      <Icon size={19} />
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-700 transition-colors group-hover:text-indigo-600">
                      {actionLabel}
                      <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(
              <CircleDollarSign size={20} />,
              "bg-emerald-50 text-emerald-600",
              t("dash.feesCollection"),
              viewAll("/fees"),
            )}
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-600/25">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-200">
                  {t("dash.collectionRate")}
                </p>
                <p className="mt-1 text-3xl font-extrabold">{loading ? "…" : `${feeRate}%`}</p>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-500">
                  {t("dash.totalFees")}{" "}
                  <strong className="ml-1 font-extrabold text-slate-900">
                    {formatNumber(stats.fees)}
                  </strong>
                </p>
                <p className="text-slate-500">
                  {t("dash.paymentsShort")}{" "}
                  <strong className="ml-1 font-extrabold text-slate-900">
                    {formatNumber(stats.payments)}
                  </strong>
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {feeCategories.map((fee) => (
                <div key={fee.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">{fee.label}</span>
                    <span className="font-extrabold text-slate-900">{fee.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${fee.color}`} style={{ width: `${fee.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {sectionTitle(<Trophy size={20} />, "bg-amber-50 text-amber-500", t("dash.topPerformers"), null)}
            <div className="space-y-3">
              {performers.map((student) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-white"
                  key={student.name}
                >
                  <span
                    className={`grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br ${student.color} text-sm font-extrabold text-white shadow-md`}
                  >
                    {student.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{t("dash.rank", { rank: student.rank })}</p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{student.score}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
