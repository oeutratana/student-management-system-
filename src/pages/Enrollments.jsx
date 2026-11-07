import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  Trophy,
} from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { coursesApi, enrollmentsApi, studentOptionLabel, studentsApi, toOptions } from "../services/schoolApi"
import { storageUrl } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

const studentName = (item) => `${item.student?.first_name ?? ""} ${item.student?.last_name ?? ""}`.trim() || "-"

const studentInitials = (item) =>
  [item.student?.first_name?.[0], item.student?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || (item.student?.student_code ?? "S").slice(0, 2).toUpperCase()

export default function Enrollments() {
  const { t } = useLanguage()

  const statusLabel = (status) =>
    status === "Active" ? t("val.active") : status === "Completed" ? t("val.completed") : t("val.dropped")

  const statusTone = (status) =>
    status === "Active" ? "indigo" : status === "Completed" ? "violet" : "slate"

  const statusFilter = [
    { value: "Active", label: t("val.active") },
    { value: "Completed", label: t("val.completed") },
    { value: "Dropped", label: t("val.dropped") },
  ]

  const stats = (items) => {
    const active = items.filter((item) => item.status === "Active").length
    const completed = items.filter((item) => item.status === "Completed").length
    const courses = new Set(items.map((item) => item.course?.id).filter(Boolean)).size
    return [
      { key: "total", label: t("enrollments.stat.total"), value: items.length, icon: GraduationCap, tone: "indigo" },
      { key: "active", label: t("enrollments.stat.active"), value: active, icon: CheckCircle2, tone: "violet" },
      { key: "completed", label: t("enrollments.stat.completed"), value: completed, icon: Trophy, tone: "indigo" },
      { key: "courses", label: t("enrollments.stat.courses"), value: courses, icon: BookOpen, tone: "violet" },
    ]
  }

  return (
    <ResourcePage
      accent="indigo"
      api={enrollmentsApi}
      managePermission="manage_enrollments"
      singular={t("lbl.enrollment")}
      title={t("page.enrollments")}
      description={t("enrollments.desc")}
      defaultView="grid"
      stats={stats}
      filters={[{ key: "status", label: t("lbl.status"), options: statusFilter }]}
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span
              className={`badge ${
                item.status === "Active"
                  ? "badge--green"
                  : item.status === "Completed"
                    ? "badge--blue"
                    : "badge--gray"
              }`}
            >
              {statusLabel(item.status)}
            </span>
          }
          fields={[
            {
              key: "course",
              icon: <BookOpen size={13} />,
              label: t("lbl.course"),
              value: item.course?.course_name ?? "-",
            },
            {
              key: "semester",
              icon: <CalendarDays size={13} />,
              label: t("lbl.semester"),
              value: item.semester ?? "-",
            },
            {
              key: "year",
              icon: <CalendarRange size={13} />,
              label: t("lbl.academicYear"),
              value: item.academic_year ?? "-",
            },
          ]}
          icon={
            item.student?.image ? (
              <img
                alt={studentName(item)}
                className="h-full w-full object-cover"
                src={storageUrl(item.student.image)}
              />
            ) : (
              <span className="text-lg font-extrabold">{studentInitials(item)}</span>
            )
          }
          subtitle={item.course?.course_name ?? "-"}
          title={studentName(item)}
          tone={statusTone(item.status)}
        />
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: studentName },
        { key: "course", label: t("lbl.course"), render: (item) => item.course?.course_name ?? "-" },
        { key: "semester", label: t("lbl.semester") },
        { key: "academic_year", label: t("lbl.academicYear") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${item.status === "Active" ? "badge--green" : item.status === "Completed" ? "badge--blue" : "badge--gray"}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, studentOptionLabel)) },
        { name: "course_id", label: t("lbl.course"), type: "select", required: true, loadOptions: () => coursesApi.list().then((rows) => toOptions(rows, "course_name")) },
        { name: "semester", label: t("lbl.semester"), required: true },
        { name: "academic_year", label: t("lbl.academicYear"), required: true },
        { name: "status", label: t("lbl.status"), type: "select", required: true, options: statusFilter },
      ]}
      searchKeys={["student.first_name", "student.last_name", "course.course_name", "academic_year"]}
    />
  )
}
