import { Building2, Hash } from "lucide-react"
import EntityCard from "../components/EntityCard"
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
      defaultView="grid"
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          fields={[
            {
              key: "id",
              icon: <Hash size={13} />,
              label: t("lbl.id"),
              value: `#${item.id}`,
            },
          ]}
          icon={<Building2 size={24} />}
          title={item.name}
          tone="slate"
        >
          {item.description && (
            <p className="mt-4 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
              {item.description}
            </p>
          )}
        </EntityCard>
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "name", label: t("lbl.name") },
        { key: "description", label: t("lbl.description") },
      ]}
      fields={[
        { name: "name", label: t("lbl.name"), required: true },
        { name: "description", label: t("lbl.description"), type: "textarea" },
      ]}
      searchKeys={["name", "description"]}
    />
  )
}