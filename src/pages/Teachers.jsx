import ResourcePage from "../components/ResourcePage"
import { teachersApi, departmentsApi, usersApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Teachers() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={teachersApi}
      managePermission="manage_teachers"
      singular={t("lbl.teacher")}
      title={t("page.teachers")}
      description={t("teachers.desc")}
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
        { key: "teacher_code", label: t("lbl.code") },
        { key: "name", label: t("lbl.name"), render: (item) => `${item.first_name} ${item.last_name}` },
        { key: "department", label: t("lbl.department"), render: (item) => item.department?.name ?? "-" },
        { key: "gender", label: t("lbl.gender") },
        { key: "email", label: t("lbl.email") },
        { key: "phone", label: t("lbl.phone") },
      ]}
      fields={[
        { name: "department_id", label: t("lbl.department"), type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "teacher_code", label: t("lbl.teacherCode"), required: true },
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
        { name: "user_id", label: t("lbl.userAccount"), type: "select", loadOptions: () => usersApi.list().then((rows) => toOptions(rows, "name")) },
      ]}
      searchKeys={["first_name", "last_name", "teacher_code", "department.name", "email"]}
    />
  )
}