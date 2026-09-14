import ResourcePage from "../components/ResourcePage"
import { coursesApi, departmentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Courses() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={coursesApi}
      managePermission="manage_courses"
      singular={t("lbl.course")}
      title={t("page.courses")}
      description={t("courses.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "course_code", label: t("lbl.code") },
        { key: "course_name", label: t("lbl.course") },
        { key: "department", label: t("lbl.department"), render: (item) => item.department?.name ?? "-" },
        { key: "credit", label: t("lbl.credits") },
      ]}
      fields={[
        { name: "department_id", label: t("lbl.department"), type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "course_code", label: t("lbl.courseCode"), required: true },
        { name: "course_name", label: t("lbl.courseName"), required: true },
        { name: "credit", label: t("lbl.credits"), type: "number" },
        { name: "description", label: t("lbl.description"), type: "textarea" },
      ]}
      searchKeys={["course_code", "course_name", "department.name"]}
    />
  )
}