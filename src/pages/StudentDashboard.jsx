import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Receipt,
  UserCircle,
  Wallet,
} from "lucide-react";
import { studentPortalApi } from "../services/schoolApi";
import { storageUrl } from "../services/apiClient";
import { useLanguage } from "../context/LanguageContext";

const numberFormat = new Intl.NumberFormat();

const formatNumber = (value) => numberFormat.format(Number(value ?? 0));

const formatMoney = (value) =>
  `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The school operates on Cambodia time (UTC+7, no DST), so the greeting must not
// follow whatever timezone the browser happens to be in.
const SCHOOL_TIME_ZONE = "Asia/Phnom_Penh";

const hourInZone = (date) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: SCHOOL_TIME_ZONE,
    }).format(date),
  );

/**
 * Ratios are only meaningful when the denominator exists, otherwise the card
 * shows a dash instead of a misleading 0.
 */
const percent = (numerator, denominator) => {
  const bottom = Number(denominator ?? 0);
  if (!bottom) return null;
  return Math.min(100, Math.max(0, Math.round((Number(numerator ?? 0) / bottom) * 100)));
};

const StatCard = ({ icon: Icon, tone, label, value, hint }) => (
  <article className="dash-card dash-enter">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-2 text-[26px] font-extrabold leading-none tracking-tight text-slate-900">{value}</p>
        {hint && <p className="mt-2 truncate text-xs font-medium text-slate-500">{hint}</p>}
      </div>
      <span className={`dash-panel__icon dash-tone-${tone}`}>
        <Icon size={18} />
      </span>
    </div>
  </article>
);

const PortalLink = ({ icon: Icon, tone, label, description, onClick }) => (
  <button className="dash-stat-row w-full text-left" onClick={onClick} type="button">
    <span className={`dash-stat-row__icon dash-tone-${tone}`}>
      <Icon size={16} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-600">{label}</p>
      <p className="truncate text-xs font-medium text-slate-400">{description}</p>
    </div>
    <ArrowUpRight size={16} className="dash-link__arrow" />
  </button>
);

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    studentPortalApi
      .dashboard()
      .then((payload) => {
        if (!cancelled) setData(payload ?? {});
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const student = data?.student ?? {};

  const cards = useMemo(() => {
    const grades = data?.grades ?? {};
    const attendance = data?.attendance ?? {};
    const fees = data?.fees ?? {};
    const payments = data?.payments ?? {};
    const averageGrade = grades.average === null || grades.average === undefined ? null : Number(grades.average);
    const attendanceRate = attendance.rate ?? percent(attendance.present, attendance.total);

    return [
      {
        key: "courses",
        label: t("student.stat.courses"),
        value: formatNumber(data?.courses ?? 0),
        icon: BookOpen,
        tone: "indigo",
        hint: student.class_name ? t("lbl.class") + ": " + student.class_name : null,
      },
      {
        key: "grades",
        label: t("student.stat.averageGrade"),
        value: averageGrade === null ? "-" : formatNumber(Number(averageGrade.toFixed(1))),
        icon: ClipboardList,
        tone: "violet",
        hint: t("lbl.grade"),
      },
      {
        key: "attendance",
        label: t("student.stat.attendanceRate"),
        value: attendanceRate === null ? "-" : `${attendanceRate}%`,
        icon: CalendarCheck,
        tone: "emerald",
        hint: `${formatNumber(attendance.present ?? 0)} / ${formatNumber(attendance.total ?? 0)}`,
      },
      {
        key: "fees",
        label: t("student.stat.unpaidFees"),
        value: formatMoney(fees.amount ?? 0),
        icon: Receipt,
        tone: "amber",
        hint: `${formatNumber(fees.unpaid ?? 0)} / ${formatNumber(fees.total ?? 0)}`,
      },
      {
        key: "payments",
        label: t("student.stat.payments"),
        value: formatMoney(payments.amount ?? 0),
        icon: CircleDollarSign,
        tone: "sky",
        hint: formatNumber(payments.total ?? 0),
      },
      {
        key: "announcements",
        label: t("student.stat.announcements"),
        value: formatNumber(data?.announcements ?? 0),
        icon: Megaphone,
        tone: "rose",
        hint: t("page.announcements"),
      },
    ];
  }, [t, data, student.class_name]);

  const links = useMemo(
    () => [
      { key: "profile", label: t("page.myProfile"), description: t("student.profile.desc"), icon: UserCircle, tone: "indigo", path: "/student/profile" },
      { key: "class", label: t("page.myClass"), description: t("student.class.desc"), icon: GraduationCap, tone: "violet", path: "/student/class" },
      { key: "courses", label: t("page.myCourses"), description: t("student.courses.desc"), icon: BookOpen, tone: "sky", path: "/student/courses" },
      { key: "grades", label: t("page.myGrades"), description: t("student.grades.desc"), icon: ClipboardList, tone: "amber", path: "/student/grades" },
      { key: "attendance", label: t("page.myAttendance"), description: t("student.attendance.desc"), icon: CalendarCheck, tone: "emerald", path: "/student/attendance" },
      { key: "fees", label: t("page.myFees"), description: t("student.fees.desc"), icon: Wallet, tone: "rose", path: "/student/fees" },
      { key: "payments", label: t("page.myPayments"), description: t("student.payments.desc"), icon: CircleDollarSign, tone: "violet", path: "/student/payments" },
      { key: "announcements", label: t("page.announcements"), description: t("student.announcements.desc"), icon: Bell, tone: "indigo", path: "/student/announcements" },
    ],
    [t],
  );

  const studentName = [student.first_name, student.last_name].filter(Boolean).join(" ");
  const hour = hourInZone(new Date());
  const greeting = hour < 12 ? t("dash.goodMorning") : hour < 18 ? t("dash.goodAfternoon") : t("dash.goodEvening");

  return (
    <div className="dash-root">
      {error && <div className="alert">{error}</div>}

      <header className="dash-masthead">
        <div className="dash-masthead__glow" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur">
              {student.image ? (
                <img
                  alt={studentName}
                  className="h-full w-full object-cover"
                  src={storageUrl(student.image)}
                />
              ) : (
                <UserCircle size={30} />
              )}
            </span>
            <div className="min-w-0">
              <p className="dash-masthead__eyebrow">
                <span className="dash-masthead__dot" />
                {t("brand.subtitleStudent")}
              </p>
              <h1 className="dash-masthead__title">
                {t("dash.greeting", { greeting, name: studentName || t("dash.there") })}
              </h1>
              <p className="dash-masthead__text">{t("student.dashboard.desc")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button className="dash-btn dash-btn--primary" onClick={() => navigate("/student/announcements")} type="button">
              <Megaphone size={16} />
              {t("page.announcements")}
            </button>
            <button className="dash-btn dash-btn--ghost" onClick={() => navigate("/student/profile")} type="button">
              <UserCircle size={16} />
              {t("page.myProfile")}
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.key} style={{ "--dash-delay": `${index * 70}ms` }}>
              <StatCard icon={Icon} tone={item.tone} label={item.label} value={item.value} hint={item.hint} />
            </div>
          );
        })}
      </div>

      <section className="dash-panel dash-enter">
        <header className="dash-panel__head">
          <div className="flex min-w-0 items-center gap-3">
            <span className="dash-panel__icon dash-tone-indigo">
              <GraduationCap size={18} />
            </span>
            <h2 className="truncate text-[15px] font-bold text-slate-900">{t("student.portalLinks")}</h2>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <PortalLink
                key={link.key}
                icon={Icon}
                tone={link.tone}
                label={link.label}
                description={link.description}
                onClick={() => navigate(link.path)}
              />
            );
          })}
        </div>
      </section>

      {loading && <p className="text-sm font-medium text-slate-400">{t("res.loading")}</p>}
    </div>
  );
}
