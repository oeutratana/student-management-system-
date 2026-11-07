import { Award, BookOpen, CalendarDays, ClipboardList, Scale } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { examsApi, coursesApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const toPercent = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0
}

export default function Exams() {
  const { t } = useLanguage()

  const stats = (items) => {
    const marks = items.reduce((sum, item) => sum + (Number(item.total_marks) || 0), 0)
    const weights = items.map((item) => Number(item.weight)).filter((value) => Number.isFinite(value) && value > 0)
    const averageWeight = weights.length
      ? (weights.reduce((sum, value) => sum + value, 0) / weights.length).toFixed(1)
      : "-"
    const courses = new Set(items.map((item) => item.course?.id).filter(Boolean)).size
    return [
      { key: "total", label: t("exams.stat.total"), value: items.length, icon: ClipboardList, tone: "indigo" },
      { key: "marks", label: t("exams.stat.marks"), value: marks, icon: Award, tone: "violet" },
      { key: "weight", label: t("exams.stat.averageWeight"), value: averageWeight, icon: Scale, tone: "indigo" },
      { key: "courses", label: t("exams.stat.courses"), value: courses, icon: BookOpen, tone: "violet" },
    ]
  }

  return (
    <ResourcePage
      accent="indigo"
      api={examsApi}
      managePermission="manage_exams"
      singular={t("lbl.exam")}
      title={t("page.exams")}
      description={t("exams.desc")}
      defaultView="grid"
      stats={stats}
      filters={[{ key: "course.id", label: t("lbl.course"), optionsFrom: "course_id" }]}
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            item.weight ? (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {t("lbl.weight")}: {item.weight}
              </span>
            ) : null
          }
          fields={[
            {
              key: "date",
              icon: <CalendarDays size={13} />,
              label: t("lbl.date"),
              value: item.exam_date ?? "-",
            },
            {
              key: "marks",
              icon: <Award size={13} />,
              label: t("lbl.totalMarks"),
              value: item.total_marks ?? "-",
            },
          ]}
          icon={<ClipboardList size={24} />}
          subtitle={item.course?.course_name ?? "-"}
          title={item.exam_name}
          tone="indigo"
        >
          {item.weight ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Scale size={12} />
                  {t("lbl.weight")}
                </span>
                <span className="text-slate-700">{item.weight}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${toPercent(item.weight)}%` }}
                />
              </div>
            </div>
          ) : null}
        </EntityCard>
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "exam_name", label: t("lbl.exam") },
        { key: "course", label: t("lbl.course"), render: (item) => item.course?.course_name ?? "-" },
        { key: "exam_date", label: t("lbl.date") },
        { key: "total_marks", label: t("lbl.totalMarks") },
        { key: "weight", label: t("lbl.weight") },
      ]}
      fields={[
        { name: "exam_name", label: t("lbl.examName"), required: true },
        { name: "course_id", label: t("lbl.course"), type: "select", required: true, loadOptions: () => coursesApi.list().then((rows) => toOptions(rows, "course_name")) },
        { name: "exam_date", label: t("lbl.examDate"), type: "date", required: true },
        { name: "total_marks", label: t("lbl.totalMarks"), type: "number", required: true },
        { name: "weight", label: t("lbl.weight"), type: "number" },
      ]}
      searchKeys={["exam_name", "course.course_name"]}
    />
  )
}
