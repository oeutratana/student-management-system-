import ResourcePage from "../components/ResourcePage"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentAnnouncements() {
  const { t } = useLanguage()

  const audienceLabel = (audience) =>
    audience === "Students" ? t("page.students")
      : audience === "Teachers" ? t("page.teachers")
      : audience === "Parents" ? t("page.parents")
      : t("val.all")

  return (
    <ResourcePage
      api={studentPortalApi.announcements}
      managePermission="manage_announcements"
      singular={t("lbl.announcement")}
      title={t("page.announcements")}
      description={t("student.announcements.desc")}
      emptyMessage={t("student.emptyAnnouncements")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "title", label: t("lbl.title") },
        {
          key: "body",
          label: t("lbl.content"),
          render: (item) => (
            <span className="line-clamp-2 max-w-xl">{item.body ?? "-"}</span>
          ),
        },
        { key: "target_audience", label: t("lbl.audience"), render: (item) => audienceLabel(item.target_audience) },
        { key: "publish_date", label: t("lbl.publishDate") },
      ]}
      fields={[]}
      searchKeys={["title", "body", "target_audience"]}
    />
  )
}
