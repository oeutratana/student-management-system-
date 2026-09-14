import ResourcePage from "../components/ResourcePage"
import { examsApi, coursesApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Exams() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={examsApi}
      managePermission="manage_exams"
      singular={t("lbl.exam")}
      title={t("page.exams")}
      description={t("exams.desc")}
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