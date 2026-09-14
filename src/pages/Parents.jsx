import ResourcePage from "../components/ResourcePage"
import { parentsApi, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Parents() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={parentsApi}
      managePermission="manage_parents"
      singular={t("lbl.parent")}
      title={t("page.parents")}
      description={t("parents.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "name", label: t("lbl.name") },
        { key: "phone", label: t("lbl.phone") },
        { key: "address", label: t("lbl.address") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "name", label: t("lbl.name"), required: true },
        { name: "relation", label: t("lbl.relation"), type: "select", required: true, options: [
          { value: "Father", label: t("val.father") },
          { value: "Mother", label: t("val.mother") },
          { value: "Guardian", label: t("val.guardian") },
        ] },
        { name: "phone", label: t("lbl.phone") },
        { name: "address", label: t("lbl.address"), type: "textarea" },
      ]}
      searchKeys={["name", "relation", "student.first_name", "student.last_name"]}
    />
  )
}