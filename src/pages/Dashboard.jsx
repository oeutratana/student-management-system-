import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Megaphone,
  Plus,
  Receipt,
  School,
  TrendingUp,
  UserCircle,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { announcementsApi, dashboardApi } from "../services/schoolApi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { isAdmin } from "../rolePaths";

// Numbers follow the browser locale so they match every other page in the app.
const numberFormat = new Intl.NumberFormat();

const formatNumber = (value) => numberFormat.format(Number(value ?? 0));

/**
 * Ratios are only meaningful when the denominator exists. Returning null lets
 * the UI show a dash instead of a misleading 0 or Infinity.
 */
const ratio = (numerator, denominator, digits = 1) => {
  const bottom = Number(denominator ?? 0);
  if (!bottom) return null;
  return Number((Number(numerator ?? 0) / bottom).toFixed(digits));
};

const percent = (numerator, denominator) => {
  const value = ratio(numerator, denominator, 2);
  return value === null ? null : Math.min(100, Math.max(0, Math.round(value * 100)));
};

const formatDate = (value, locale) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
};

// The school operates on Cambodia time (UTC+7, no DST), so the greeting and the
// date beside it must not follow whatever timezone the browser happens to be in.
const SCHOOL_TIME_ZONE = "Asia/Phnom_Penh";

const hourInZone = (date) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: SCHOOL_TIME_ZONE,
    }).format(date),
  );

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
};

const useCountUp = (target, { duration = 1100, enabled = true } = {}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled]);

  return enabled ? value : target;
};

const Counter = ({ value, duration = 1100 }) => {
  const reduced = usePrefersReducedMotion();
  const current = useCountUp(Number(value ?? 0), { duration, enabled: !reduced });
  return <>{formatNumber(Math.round(current))}</>;
};

const Panel = ({ icon: Icon, tone = "indigo", title, action, children, className = "", delay = 0 }) => (
  <section className={`dash-panel ${className}`} style={{ "--dash-delay": `${delay}ms` }}>
    <header className="dash-panel__head">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`dash-panel__icon dash-tone-${tone}`}>
          <Icon size={18} />
        </span>
        <h2 className="truncate text-[15px] font-bold text-slate-900">{title}</h2>
      </div>
      {action}
    </header>
    {children}
  </section>
);

const ViewAll = ({ label, onClick }) => (
  <button className="dash-link group" onClick={onClick} type="button">
    {label}
    <ArrowUpRight size={14} className="dash-link__arrow" />
  </button>
);

/** Horizontal magnitude bar. `value` is always a real count from the API. */
const Rail = ({ value, max, tone = "indigo", label }) => {
  const width = max > 0 ? Math.max(value > 0 ? 2 : 0, (value / max) * 100) : 0;
  return (
    <div className="dash-rail" role="img" aria-label={label}>
      <span className={`dash-rail__fill dash-tone-bg-${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
};

const Ring = ({ value, caption, captionValue, tone = "indigo" }) => {
  const reduced = usePrefersReducedMotion();
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const current = useCountUp(value, { duration: 1200, enabled: !reduced });

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg className="-rotate-90" height={size} width={size} aria-hidden="true">
        <circle
          className="dash-ring__track"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className={`dash-ring__value dash-ring__value--${tone}`}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - current / 100)}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
          {captionValue}
        </span>
        <span className="mt-1.5 max-w-[80%] text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {caption}
        </span>
      </div>
    </div>
  );
};

const StatRow = ({ icon: Icon, tone, label, value, hint }) => (
  <div className="dash-stat-row">
    <span className={`dash-stat-row__icon dash-tone-${tone}`}>
      <Icon size={16} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-600">{label}</p>
      {hint && <p className="truncate text-xs font-medium text-slate-400">{hint}</p>}
    </div>
    <span className="text-base font-extrabold tabular-nums text-slate-900">{value}</span>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  // Normalised once from the authenticated user, never from a display label.
  const admin = isAdmin(user);
  const locale = lang === "km" ? "km-KH" : "en-US";

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

  const quickActions = useMemo(
    () =>
      [
        { labelKey: "dash.addStudent", path: "/students", icon: Users, tone: "indigo", permission: "create_students" },
        { labelKey: "dash.markAttendance", path: "/attendances", icon: CalendarCheck, tone: "emerald", permission: "manage_attendance" },
        { labelKey: "dash.newPayment", path: "/payments", icon: Wallet, tone: "violet", permission: "manage_payments" },
        { labelKey: "dash.postAnnouncement", path: "/announcements", icon: Megaphone, tone: "amber", permission: "manage_announcements" },
      ].filter((action) => admin || (user?.permissions ?? []).includes(action.permission)),
    [admin, user],
  );

  const today = new Date();
  const dateLabel = today.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SCHOOL_TIME_ZONE,
  });
  const hour = hourInZone(today);
  const greeting = hour < 12 ? t("dash.goodMorning") : hour < 18 ? t("dash.goodAfternoon") : t("dash.goodEvening");

  const students = Number(stats.students ?? 0);
  const teachers = Number(stats.teachers ?? 0);
  const parents = Number(stats.parents ?? 0);
  const users = Number(stats.users ?? 0);
  const departments = Number(stats.departments ?? 0);
  const classes = Number(stats.classes ?? 0);
  const courses = Number(stats.courses ?? 0);
  const enrollments = Number(stats.enrollments ?? 0);
  const attendances = Number(stats.attendances ?? 0);
  const exams = Number(stats.exams ?? 0);
  const fees = Number(stats.fees ?? 0);
  const payments = Number(stats.payments ?? 0);
  const announcementTotal = Number(stats.announcements ?? 0);

  const peopleTotal = students + teachers + parents;

  const headline = useMemo(
    () => [
      {
        key: "students",
        labelKey: "page.students",
        icon: Users,
        tone: "indigo",
        value: students,
        hintKey: "dash.perClass",
        hint: ratio(students, classes, 1),
      },
      {
        key: "teachers",
        labelKey: "page.teachers",
        icon: ClipboardCheck,
        tone: "amber",
        value: teachers,
        hintKey: "dash.studentsPerTeacher",
        hint: ratio(students, teachers, 1),
      },
      {
        key: "parents",
        labelKey: "page.parents",
        icon: UserCircle,
        tone: "emerald",
        value: parents,
        hintKey: "dash.parentsPerStudent",
        hint: ratio(parents, students, 2),
      },
      {
        key: "users",
        labelKey: "page.users",
        icon: Layers,
        tone: "violet",
        value: users,
        hintKey: "dash.activeAccounts",
        hint: null,
      },
    ],
    [students, teachers, parents, users, classes],
  );

  const records = useMemo(
    () => [
      { key: "attendances", labelKey: "page.attendances", icon: CalendarCheck, tone: "emerald", value: attendances },
      { key: "enrollments", labelKey: "page.enrollments", icon: GraduationCap, tone: "indigo", value: enrollments },
      { key: "exams", labelKey: "page.exams", icon: FileSpreadsheet, tone: "amber", value: exams },
      { key: "fees", labelKey: "page.fees", icon: Receipt, tone: "violet", value: fees },
      { key: "payments", labelKey: "page.payments", icon: CircleDollarSign, tone: "sky", value: payments },
      { key: "announcements", labelKey: "page.announcements", icon: Bell, tone: "rose", value: announcementTotal },
    ],
    [attendances, enrollments, exams, fees, payments, announcementTotal],
  );

  const recordMax = Math.max(...records.map((item) => item.value), 0);
  const recordTotal = records.reduce((sum, item) => sum + item.value, 0);

  const academics = useMemo(
    () => [
      { key: "departments", labelKey: "page.departments", value: departments },
      { key: "courses", labelKey: "page.courses", value: courses },
      { key: "classes", labelKey: "page.classes", value: classes },
      { key: "exams", labelKey: "page.exams", value: exams },
    ],
    [departments, courses, classes, exams],
  );
  const academicMax = Math.max(...academics.map((item) => item.value), 0);

  const coverage = percent(payments, fees);
  const unpaidRecords = Math.max(fees - payments, 0);
  const attendanceShare = percent(attendances, recordTotal);
  const perStudent = ratio(attendances, students, 1);
  const perEnrollment = ratio(attendances, enrollments, 1);

  const ratioHint = (value, key) =>
    value === null || value === undefined
      ? t("dash.notAvailable")
      : t(key, { value: formatNumber(value) });

  const showRatio = (value) => (value === null ? t("dash.notAvailable") : formatNumber(value));

  const visibleAnnouncements = announcements.slice(0, 6);

  return (
    <div className="dash-root">
      {error && <div className="alert">{error}</div>}

      <header className="dash-masthead">
        <div className="dash-masthead__glow" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="dash-masthead__eyebrow">
              <span className="dash-masthead__dot" />
              {dateLabel}
            </p>
            <h1 className="dash-masthead__title">
              {t("dash.greeting", { greeting, name: user?.name || t("dash.there") })}
            </h1>
            <p className="dash-masthead__text">{t("dash.heroText")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button className="dash-btn dash-btn--primary" onClick={() => navigate("/announcements")} type="button">
              <Plus size={16} />
              {t("dash.newAnnouncement")}
            </button>
            <button className="dash-btn dash-btn--ghost" onClick={() => navigate("/reports")} type="button">
              <Download size={16} />
              {t("dash.exportReport")}
            </button>
          </div>
        </div>

        </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {headline.map((item, index) => {
          const Icon = item.icon;
          const share = item.key === "users" ? null : percent(item.value, peopleTotal);
          return (
            <article
              className="dash-card dash-enter"
              key={item.key}
              style={{ "--dash-delay": `${index * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`dash-kpi__icon dash-tone-${item.tone}`}>
                  <Icon size={20} />
                </span>
                {share !== null && <span className="dash-kpi__share">{share}%</span>}
              </div>
              <p className="mt-4 text-[13px] font-semibold text-slate-500">{t(item.labelKey)}</p>
              <p className="dash-kpi__value">
                {loading ? "…" : <Counter value={item.value} />}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {item.hint === null || item.hint === undefined
                  ? t("dash.activeAccounts")
                  : ratioHint(item.hint, item.hintKey)}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel
          className="xl:col-span-8"
          delay={60}
          icon={TrendingUp}
          title={t("dash.recordsOverview")}
          tone="indigo"
          action={
            <span className="dash-chip">
              {loading ? "…" : `${formatNumber(recordTotal)} ${t("dash.recordsTotal")}`}
            </span>
          }
        >
          <div className="dash-chart">
            {records.map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="dash-chart__row" key={item.key} style={{ "--dash-delay": `${140 + index * 60}ms` }}>
                  <span className={`dash-chart__icon dash-tone-${item.tone}`}>
                    <Icon size={15} />
                  </span>
                  <span className="dash-chart__label">{t(item.labelKey)}</span>
                  <Rail
                    label={`${t(item.labelKey)}: ${formatNumber(item.value)}`}
                    max={recordMax}
                    tone={item.tone}
                    value={item.value}
                  />
                  <span className="dash-chart__value">
                    {loading ? "…" : <Counter duration={900} value={item.value} />}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs font-medium text-slate-400">{t("dash.recordsHint")}</p>
        </Panel>

        <Panel
          className="xl:col-span-4"
          delay={120}
          icon={Zap}
          title={t("dash.quickActions")}
          tone="violet"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  className="dash-action"
                  key={action.labelKey}
                  onClick={() => navigate(action.path)}
                  type="button"
                >
                  <span className={`dash-action__icon dash-tone-${action.tone}`}>
                    <Icon size={17} />
                  </span>
                  <span className="dash-action__label">{t(action.labelKey)}</span>
                  <ArrowUpRight size={14} className="dash-action__arrow" />
                </button>
              );
            })}
          </div>
          {!quickActions.length && (
            <p className="py-6 text-center text-sm text-slate-400">{t("dash.noQuickActions")}</p>
          )}
        </Panel>

        <Panel
          className="xl:col-span-4"
          delay={180}
          icon={CalendarCheck}
          title={t("dash.attendanceOverview")}
          tone="emerald"
          action={<ViewAll label={t("dash.viewAll")} onClick={() => navigate("/attendances")} />}
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <Ring
              caption={t("dash.ofAllRecords")}
              captionValue={attendanceShare === null ? "—" : `${attendanceShare}%`}
              tone="emerald"
              value={attendanceShare ?? 0}
            />
            <div className="w-full min-w-0 flex-1 space-y-2.5 sm:w-auto">
              <StatRow
                hint={t("dash.totalLogged")}
                icon={CalendarCheck}
                label={t("dash.attendanceRecords")}
                tone="emerald"
                value={loading ? "…" : <Counter value={attendances} />}
              />
              <StatRow
                hint={t("dash.acrossStudents")}
                icon={Users}
                label={t("dash.recordsPerStudent")}
                tone="indigo"
                value={loading ? "…" : showRatio(perStudent)}
              />
              <StatRow
                hint={t("dash.acrossEnrollments")}
                icon={GraduationCap}
                label={t("dash.recordsPerEnrollment")}
                tone="violet"
                value={loading ? "…" : showRatio(perEnrollment)}
              />
            </div>
          </div>
        </Panel>

        <Panel
          className="xl:col-span-4"
          delay={240}
          icon={CircleDollarSign}
          title={t("dash.feeCoverage")}
          tone="violet"
          action={<ViewAll label={t("dash.viewAll")} onClick={() => navigate("/fees")} />}
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <Ring
              caption={t("dash.coverage")}
              captionValue={coverage === null ? "—" : `${coverage}%`}
              tone="violet"
              value={coverage ?? 0}
            />
            <div className="w-full min-w-0 flex-1 space-y-2.5 sm:w-auto">
              <StatRow
                icon={Receipt}
                label={t("dash.feeRecords")}
                tone="indigo"
                value={loading ? "…" : <Counter value={fees} />}
              />
              <StatRow
                icon={Wallet}
                label={t("dash.paymentRecords")}
                tone="emerald"
                value={loading ? "…" : <Counter value={payments} />}
              />
              <StatRow
                icon={CircleDollarSign}
                label={t("dash.awaitingPayment")}
                tone="rose"
                value={loading ? "…" : <Counter value={unpaidRecords} />}
              />
            </div>
          </div>
          <p className="mt-5 text-xs font-medium text-slate-400">{t("dash.feeCoverageHint")}</p>
        </Panel>

        <Panel
          className="xl:col-span-4"
          delay={300}
          icon={School}
          title={t("dash.academicFootprint")}
          tone="amber"
        >
          <div className="space-y-3.5">
            {academics.map((item, index) => (
              <div key={item.key} style={{ "--dash-delay": `${320 + index * 60}ms` }} className="dash-enter">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-semibold text-slate-600">{t(item.labelKey)}</span>
                  <span className="text-sm font-extrabold tabular-nums text-slate-900">
                    {loading ? "…" : <Counter duration={900} value={item.value} />}
                  </span>
                </div>
                <Rail
                  label={`${t(item.labelKey)}: ${formatNumber(item.value)}`}
                  max={academicMax}
                  tone="amber"
                  value={item.value}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        delay={340}
        icon={Megaphone}
        title={t("dash.recentAnnouncements")}
        tone="rose"
        action={<ViewAll label={t("dash.viewAll")} onClick={() => navigate("/announcements")} />}
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div className="h-24 animate-pulse rounded-xl bg-slate-100" key={index} />
            ))}
          </div>
        ) : visibleAnnouncements.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleAnnouncements.map((item) => (
              <article className="dash-note" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{item.title}</h3>
                  <time className="flex-none text-[11px] font-semibold text-slate-400">
                    {formatDate(item.publish_date ?? item.created_at, locale) ?? ""}
                  </time>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-slate-500">
                  {item.content ?? item.body ?? ""}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <Megaphone size={22} />
            <p>{t("dash.noAnnouncements")}</p>
          </div>
        )}
      </Panel>

      <p className="pb-2 text-center text-xs font-medium text-slate-400">
        {t("dash.dataSource", { people: formatNumber(peopleTotal) })}
      </p>
    </div>
  );
}