import ResourcePage from "../components/ResourcePage"
import { studentsApi, classesApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Students() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={studentsApi}
      managePermission="manage_students"
      createPermission="create_students"
      singular={t("lbl.student")}
      title={t("page.students")}
      description={t("students.desc")}
      columns={[
        { key: "image", label: t("lbl.photo"), render: (item) =>
          item.image ? (
            <img
              src={item.image}
              alt={`${item.first_name} ${item.last_name}`}
              className="h-10 w-10 flex-none rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="avatar">
              {`${item.first_name ?? ""}`.charAt(0)}
              {`${item.last_name ?? ""}`.charAt(0)}
            </span>
          ),
        },
        { key: "id", label: t("lbl.id") },
        { key: "student_code", label: t("lbl.code") },
        { key: "name", label: t("lbl.name"), render: (item) => `${item.first_name} ${item.last_name}` },
        { key: "gender", label: t("lbl.gender") },
        { key: "class", label: t("lbl.class"), render: (item) => item.class?.class_name ?? "-" },
        { key: "email", label: t("lbl.email") },
        { key: "phone", label: t("lbl.phone") },
      ]}
      fields={[
        { name: "class_id", label: t("lbl.class"), type: "select", required: true, loadOptions: () => classesApi.list().then((rows) => toOptions(rows, "class_name")) },
        { name: "student_code", label: t("lbl.studentCode"), required: true },
        { name: "first_name", label: t("lbl.firstName"), required: true },
        { name: "last_name", label: t("lbl.lastName"), required: true },
        { name: "gender", label: t("lbl.gender"), type: "select", required: true, options: [
          { value: "Male", label: t("val.male") },
          { value: "Female", label: t("val.female") },
        ] },
        { name: "dob", label: t("lbl.dob"), type: "date", required: true },
        { name: "email", label: t("lbl.email"), type: "email", required: true },
        { name: "phone", label: t("lbl.phone") },
        { name: "address", label: t("lbl.address"), type: "textarea" },
        { name: "image", label: t("lbl.image") },
      ]}
      searchKeys={["first_name", "last_name", "student_code", "email"]}
    />
  )
}