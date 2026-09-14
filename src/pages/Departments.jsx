import ResourcePage from "../components/ResourcePage"
import { departmentsApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Departments() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={departmentsApi}
      managePermission="manage_departments"
      singular={t("lbl.department")}
      title={t("page.departments")}
      description={t("departments.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "name", label: t("lbl.department") },
        { key: "description", label: t("lbl.description") },
        { key: "classes", label: t("page.classes"), render: (item) => item.classes?.length ?? 0 },
        { key: "courses", label: t("page.courses"), render: (item) => item.courses?.length ?? 0 },
      ]}
      fields={[
        { name: "name", label: t("lbl.name"), required: true },
        { name: "description", label: t("lbl.description"), type: "textarea" },
      ]}
      searchKeys={["name", "description"]}
    />
  )
}