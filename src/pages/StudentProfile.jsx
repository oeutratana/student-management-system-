import { useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { studentPortalApi } from "../services/schoolApi";
import { storageUrl } from "../services/apiClient";
import { useLanguage } from "../context/LanguageContext";

const formatDate = (value, locale) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
};

const Detail = ({ icon: Icon, label, value }) => (
  <div className="dash-stat-row">
    <span className="dash-stat-row__icon dash-tone-indigo">
      <Icon size={16} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-700">{value || "-"}</p>
    </div>
  </div>
);

export default function StudentProfile() {
  const { lang, t } = useLanguage();
  const locale = lang === "km" ? "km-KH" : "en-US";

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    studentPortalApi
      .profile()
      .then((payload) => {
        if (!cancelled) setStudent(payload ?? null);
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

  if (!loading && !student) {
    return (
      <div className="dash-root">
        <div className="alert">{error || t("student.noProfile")}</div>
      </div>
    );
  }

  const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(" ");
  const schoolClass = student?.class ?? null;
  const teacher = schoolClass?.teacher ?? null;
  const teacherName = teacher?.name
    ?? [teacher?.teacher_profile?.first_name, teacher?.teacher_profile?.last_name].filter(Boolean).join(" ");

  return (
    <div className="dash-root">
      {error && <div className="alert">{error}</div>}

      <header className="dash-masthead">
        <div className="dash-masthead__glow" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-4">
          <span className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur">
            {student?.image ? (
              <img
                alt={fullName || t("page.myProfile")}
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
              {t("page.myProfile")}
            </p>
            <h1 className="dash-masthead__title">{fullName || t("page.myProfile")}</h1>
            <p className="dash-masthead__text">{t("student.profile.desc")}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="dash-panel dash-enter">
          <header className="dash-panel__head">
            <div className="flex min-w-0 items-center gap-3">
              <span className="dash-panel__icon dash-tone-indigo">
                <UserCircle size={18} />
              </span>
              <h2 className="truncate text-[15px] font-bold text-slate-900">{t("lbl.student")}</h2>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-1.5">
            <Detail icon={UserCircle} label={t("lbl.name")} value={fullName} />
            <Detail icon={GraduationCap} label={t("lbl.studentCode")} value={student?.student_code} />
            <Detail icon={CalendarDays} label={t("lbl.dob")} value={formatDate(student?.dob, locale)} />
            <Detail icon={UserCircle} label={t("lbl.gender")} value={student?.gender} />
            <Detail icon={Mail} label={t("lbl.email")} value={student?.email} />
            <Detail icon={Phone} label={t("lbl.phone")} value={student?.phone} />
            <Detail icon={MapPin} label={t("lbl.address")} value={student?.address} />
          </div>
        </section>

        <section className="dash-panel dash-enter">
          <header className="dash-panel__head">
            <div className="flex min-w-0 items-center gap-3">
              <span className="dash-panel__icon dash-tone-violet">
                <GraduationCap size={18} />
              </span>
              <h2 className="truncate text-[15px] font-bold text-slate-900">{t("page.myClass")}</h2>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-1.5">
            <Detail icon={GraduationCap} label={t("lbl.class")} value={schoolClass?.class_name} />
            <Detail icon={GraduationCap} label={t("lbl.department")} value={schoolClass?.department?.name} />
            <Detail icon={UserCircle} label={t("lbl.teacher")} value={teacherName} />
            <Detail icon={CalendarDays} label={t("lbl.academicYear")} value={schoolClass?.academic_year} />
            <Detail icon={CalendarDays} label={t("lbl.semester")} value={schoolClass?.semester} />
          </div>
        </section>
      </div>

      {loading && <p className="text-sm font-medium text-slate-400">{t("res.loading")}</p>}
    </div>
  );
}
