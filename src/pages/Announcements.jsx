import { CalendarDays, Megaphone } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { announcementsApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Announcements() {
  const { t } = useLanguage()

  const audienceLabel = (audience) =>
    audience === "Students" ? t("page.students")
      : audience === "Teachers" ? t("page.teachers")
      : audience === "Parents" ? t("page.parents")
      : t("val.all")

  return (
    <ResourcePage
      api={announcementsApi}
      managePermission="manage_announcements"
      singular={t("lbl.announcement")}
      title={t("page.announcements")}
      description={t("announcements.desc")}
      defaultView="grid"
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {audienceLabel(item.target_audience)}
            </span>
          }
          fields={[
            {
              key: "publish_date",
              icon: <CalendarDays size={13} />,
              label: t("lbl.publishDate"),
              value: item.publish_date ?? "-",
            },
          ]}
          icon={<Megaphone size={24} />}
          title={item.title}
          tone="indigo"
        >
          {item.body && (
            <p className="mt-4 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
              {item.body}
            </p>
          )}
        </EntityCard>
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "title", label: t("lbl.title") },
        { key: "target_audience", label: t("lbl.audience"), render: (item) => audienceLabel(item.target_audience) },
        { key: "publish_date", label: t("lbl.publishDate") },
      ]}
      fields={[
        { name: "title", label: t("lbl.title"), required: true },
        { name: "body", label: t("lbl.content"), type: "textarea", required: true },
        { name: "target_audience", label: t("lbl.audience"), type: "select", required: true, options: [
          { value: "All", label: t("val.all") },
          { value: "Students", label: t("page.students") },
          { value: "Teachers", label: t("page.teachers") },
          { value: "Parents", label: t("page.parents") },
        ] },
        { name: "publish_date", label: t("lbl.publishDate"), type: "date", required: true },
      ]}
      searchKeys={["title", "body", "target_audience"]}
    />
  )
}