import ResourcePage from "../components/ResourcePage"
import { classesApi, departmentsApi, usersApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Classes() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={classesApi}
      managePermission="manage_classes"
      singular={t("lbl.class")}
      title={t("page.classes")}
      description={t("classes.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "class_name", label: t("lbl.class") },
        { key: "department", label: t("lbl.department"), render: (item) => item.department?.name ?? "-" },
        { key: "teacher", label: t("lbl.teacher"), render: (item) => item.teacher?.name ?? "-" },
        { key: "academic_year", label: t("lbl.academicYear") },
        { key: "semester", label: t("lbl.semester") },
        { key: "students", label: t("page.students"), render: (item) => item.students?.length ?? 0 },
      ]}
      fields={[
        { name: "department_id", label: t("lbl.department"), type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "teacher_id", label: t("lbl.teacher"), type: "select", required: true, loadOptions: () => usersApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "class_name", label: t("lbl.className"), required: true },
        { name: "academic_year", label: t("lbl.academicYear"), required: true },
        { name: "semester", label: t("lbl.semester"), required: true },
      ]}
      searchKeys={["class_name", "department.name", "teacher.name", "academic_year"]}
    />
  )
}