import ResourcePage from "../components/ResourcePage"
import { usersApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Users() {
  const { t } = useLanguage()

  const roleLabel = (role) =>
    role === "admin" ? t("val.admin") : role === "teacher" ? t("lbl.teacher") : t("lbl.student")

  return (
    <ResourcePage
      api={usersApi}
      managePermission="manage_users"
      singular={t("lbl.user")}
      title={t("page.users")}
      description={t("users.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "name", label: t("lbl.name") },
        { key: "email", label: t("lbl.email") },
        { key: "role", label: t("lbl.role"), render: (item) => <span className={`badge ${item.role === "admin" ? "badge--blue" : "badge--green"}`}>{roleLabel(item.role)}</span> },
      ]}
      fields={[
        { name: "name", label: t("lbl.name"), required: true },
        { name: "email", label: t("lbl.email"), type: "email", required: true },
        { name: "password", label: t("lbl.password"), type: "password", required: true },
        { name: "role", label: t("lbl.role"), type: "select", required: true, options: [
          { value: "admin", label: t("val.admin") },
          { value: "teacher", label: t("lbl.teacher") },
          { value: "student", label: t("lbl.student") },
        ] },
      ]}
      searchKeys={["name", "email", "role"]}
    />
  )
}