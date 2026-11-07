import { Award, CheckCircle2, Percent, Star, TrendingUp } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { gradesApi, enrollmentsApi, toOptions } from "../services/schoolApi"
import { storageUrl } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

const enrollmentLabel = (item) => {
  const student = `${item.student?.first_name ?? ""} ${item.student?.last_name ?? ""}`.trim()
  const course = item.course?.course_name ?? ""
  return [student, course].filter(Boolean).join(" - ")
}

const gradeBadge = (grade) => {
  const tone = grade === "A" || grade === "B" || grade === "C" ? "badge--blue" : "badge--gray"
  return <span className={`badge ${tone}`}>{grade}</span>
}

const gradeTone = (grade) =>
  grade === "A" || grade === "B" ? "indigo"
    : grade === "C" ? "violet"
    : "slate"

const enrollmentStudent = (item) =>
  [item.enrollment?.student?.first_name, item.enrollment?.student?.last_name]
    .filter(Boolean)
    .join(" ") || "-"

const enrollmentInitials = (item) =>
  [item.enrollment?.student?.first_name?.[0], item.enrollment?.student?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "S"

const toPercent = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0
}

const isBlank = (value) => value === "" || value === null || value === undefined

const roundScore = (value) => Math.round((Number(value) || 0) * 100) / 100

const totalOf = (form) => {
  if (isBlank(form.assignment) && isBlank(form.midterm) && isBlank(form.final)) {
    return ""
  }

  return roundScore(
    (Number(form.assignment) || 0) + (Number(form.midterm) || 0) + (Number(form.final) || 0),
  )
}

const letterGradeOf = (total) => {
  if (isBlank(total)) {
    return ""
  }

  const value = Number(total)

  if (!Number.isFinite(value)) {
    return ""
  }

  if (value >= 90) return "A"
  if (value >= 80) return "B"
  if (value >= 70) return "C"
  if (value >= 60) return "D"
  if (value >= 50) return "E"
  return "F"
}

export default function Grades() {
  const { t } = useLanguage()

  const gradeOptions = ["A", "B", "C", "D", "E", "F"].map((value) => ({ value, label: value }))

  const stats = (items) => {
    const totals = items.map((item) => Number(item.total)).filter((value) => Number.isFinite(value))
    const average = totals.length ? (totals.reduce((sum, value) => sum + value, 0) / totals.length).toFixed(1) : "-"
    const passing = items.filter((item) => ["A", "B", "C"].includes(item.grade)).length
    const top = ["A", "B", "C", "D", "E"].find((grade) => items.some((item) => item.grade === grade)) ?? "-"
    return [
      { key: "records", label: t("grades.stat.records"), value: items.length, icon: Award, tone: "indigo" },
      { key: "average", label: t("grades.stat.average"), value: average, icon: TrendingUp, tone: "violet" },
      { key: "passing", label: t("grades.stat.passing"), value: passing, icon: CheckCircle2, tone: "indigo" },
      { key: "top", label: t("grades.stat.top"), value: top, icon: Star, tone: "violet" },
    ]
  }

  return (
    <ResourcePage
      accent="indigo"
      api={gradesApi}
      managePermission="manage_grades"
      singular={t("lbl.grade")}
      title={t("page.grades")}
      description={t("grades.desc")}
      defaultView="grid"
      stats={stats}
      filters={[{ key: "grade", label: t("lbl.grade"), options: gradeOptions }]}
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={gradeBadge(item.grade)}
          fields={[
            {
              key: "total",
              icon: <Percent size={13} />,
              label: t("lbl.total"),
              value: item.total ?? "-",
            },
          ]}
          icon={
            item.enrollment?.student?.image ? (
              <img
                alt={enrollmentStudent(item)}
                className="h-full w-full object-cover"
                src={storageUrl(item.enrollment.student.image)}
              />
            ) : (
              <span className="text-lg font-extrabold">{enrollmentInitials(item)}</span>
            )
          }
          subtitle={item.enrollment?.course?.course_name ?? "-"}
          title={enrollmentStudent(item)}
          tone={gradeTone(item.grade)}
        >
          <div className="mt-4 grid gap-2.5 border-t border-slate-100 pt-4">
            {[
              { key: "assignment", label: t("lbl.assignment"), value: item.assignment, tone: "from-indigo-500 to-violet-500" },
              { key: "midterm", label: t("lbl.midterm"), value: item.midterm, tone: "from-violet-500 to-purple-500" },
              { key: "final", label: t("lbl.final"), value: item.final, tone: "from-indigo-600 to-violet-600" },
            ].map((row) => (
              <div key={row.key}>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-700">{row.value ?? "-"}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${row.tone}`}
                    style={{ width: `${toPercent(row.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </EntityCard>
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "enrollment", label: t("lbl.studentCourse"), render: (item) => enrollmentLabel(item.enrollment) },
        { key: "assignment", label: t("lbl.assignment") },
        { key: "midterm", label: t("lbl.midterm") },
        { key: "final", label: t("lbl.final") },
        { key: "total", label: t("lbl.total") },
        { key: "grade", label: t("lbl.grade"), render: (item) => gradeBadge(item.grade) },
      ]}
      fields={[
        { name: "enrollment_id", label: t("lbl.enrollment"), type: "select", required: true, loadOptions: () => enrollmentsApi.list().then((rows) => toOptions(rows, enrollmentLabel)) },
        { name: "assignment", label: t("lbl.assignment"), type: "number", required: true, min: 0, max: 20, step: "0.01" },
        { name: "midterm", label: t("lbl.midterm"), type: "number", required: true, min: 0, max: 30, step: "0.01" },
        { name: "final", label: t("lbl.final"), type: "number", required: true, min: 0, max: 50, step: "0.01" },
        { name: "total", label: t("lbl.total"), type: "number", readOnly: true, compute: totalOf },
        { name: "grade", label: t("lbl.grade"), readOnly: true, compute: (form) => letterGradeOf(form.total) },
      ]}
      searchKeys={["enrollment.student.first_name", "enrollment.student.last_name", "enrollment.course.course_name"]}
    />
  )
}
