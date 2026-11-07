import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, GraduationCap, Mail, Phone, UserCircle } from "lucide-react";
import { studentPortalApi } from "../services/schoolApi";
import { storageUrl } from "../services/apiClient";
import { useLanguage } from "../context/LanguageContext";

const Detail = ({ icon: Icon, label, value }) => (
  <div className="dash-stat-row">
    <span className="dash-stat-row__icon dash-tone-violet">
      <Icon size={16} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-700">{value || "-"}</p>
    </div>
  </div>
);

export default function StudentClass() {
  const { t } = useLanguage();

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    studentPortalApi
      .class()
      .then((data) => {
        if (!cancelled) setPayload(data ?? null);
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

  const schoolClass = payload?.class ?? null;
  const teacher = schoolClass?.teacher ?? null;
  const teacherName = teacher?.name
    ?? [teacher?.teacher_profile?.first_name, teacher?.teacher_profile?.last_name].filter(Boolean).join(" ");

  return (
    <div className="dash-root">
      {error && <div className="alert">{error}</div>}

      <header className="dash-masthead">
        <div className="dash-masthead__glow" aria-hidden="true" />
        <div className="relative z-10 min-w-0">
          <p className="dash-masthead__eyebrow">
            <span className="dash-masthead__dot" />
            {t("page.myClass")}
          </p>
          <h1 className="dash-masthead__title">{schoolClass?.class_name ?? t("page.myClass")}</h1>
          <p className="dash-masthead__text">{t("student.class.desc")}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <Detail icon={BookOpen} label={t("lbl.department")} value={schoolClass?.department?.name} />
            <Detail icon={CalendarDays} label={t("lbl.academicYear")} value={schoolClass?.academic_year} />
            <Detail icon={CalendarDays} label={t("lbl.semester")} value={schoolClass?.semester} />
          </div>
        </section>

        <section className="dash-panel dash-enter">
          <header className="dash-panel__head">
            <div className="flex min-w-0 items-center gap-3">
              <span className="dash-panel__icon dash-tone-indigo overflow-hidden">
                {teacher?.teacher_profile?.image ? (
                  <img
                    alt={teacherName}
                    className="h-full w-full object-cover"
                    src={storageUrl(teacher.teacher_profile.image)}
                  />
                ) : (
                  <UserCircle size={18} />
                )}
              </span>
              <h2 className="truncate text-[15px] font-bold text-slate-900">{t("lbl.teacher")}</h2>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-1.5">
            <Detail icon={UserCircle} label={t("lbl.teacher")} value={teacherName} />
            <Detail icon={Mail} label={t("lbl.email")} value={teacher?.email ?? teacher?.teacher_profile?.email} />
            <Detail icon={Phone} label={t("lbl.phone")} value={teacher?.teacher_profile?.phone} />
          </div>
        </section>
      </div>

      {loading && <p className="text-sm font-medium text-slate-400">{t("res.loading")}</p>}
    </div>
  );
}
