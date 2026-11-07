import { Award, BookOpen, Building2 } from "lucide-react"
import EntityCard from "../components/EntityCard"
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
      defaultView="grid"
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {item.course_code}
            </span>
          }
          fields={[
            {
              key: "department",
              icon: <Building2 size={13} />,
              label: t("lbl.department"),
              value: item.department?.name ?? "-",
            },
            {
              key: "credit",
              icon: <Award size={13} />,
              label: t("lbl.credits"),
              value: item.credit ?? "-",
            },
          ]}
          icon={<BookOpen size={24} />}
          subtitle={item.department?.name ?? "-"}
          title={item.course_name}
          tone="emerald"
        >
          {item.description && (
            <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
              {item.description}
            </p>
          )}
        </EntityCard>
      )}
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