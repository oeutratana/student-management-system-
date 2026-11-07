import { useNavigate } from "react-router-dom"
import { BookOpen, School, UserRound, Users } from "lucide-react"
import ResourcePage from "../components/ResourcePage"
import { classesApi, departmentsApi, teachersApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const classCourses = (item) => [
  ...new Set(
    (item?.students ?? [])
      .flatMap((student) => (student.enrollments ?? []).map((enrollment) => enrollment.course?.course_name))
      .filter(Boolean),
  ),
]

const teacherName = (item) => item?.teacher?.name ?? item?.teacher?.email ?? ""

export default function Classes() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const viewStudents = (item) => navigate(`/students?class=${item.id}`)
  const courseLabel = (item) => classCourses(item).join(", ") || t("student.noCourse")

  return (
    <ResourcePage
      api={classesApi}
      managePermission="manage_classes"
      singular={t("lbl.class")}
      title={t("page.classes")}
      description={t("classes.desc")}
      defaultView="grid"
      viewAction={(item) => [
        {
          key: "students",
          label: t("classes.viewStudents"),
          icon: <Users size={16} />,
          onSelect: () => viewStudents(item),
        },
      ]}
      columns={[
        { key: "class_name", label: t("lbl.class") },
        {
          key: "teacher",
          label: t("lbl.teacher"),
          render: (item) => teacherName(item) || "-",
        },
        { key: "course", label: t("lbl.course"), render: (item) => courseLabel(item) },
        {
          key: "students",
          label: t("classes.studentsCount"),
          render: (item) => (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              <Users size={13} />
              {item.students?.length ?? 0}
            </span>
          ),
        },
      ]}
      gridCard={(item, { actions }) => (
        <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_44px_-32px_rgba(16,24,40,0.3)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_50px_-30px_rgba(79,70,229,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
              <School size={24} />
            </span>
            {actions}
          </div>

          <div className="mt-4 min-w-0">
            <h3 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
              {item.class_name}
            </h3>
            <p className="mt-1 truncate text-xs font-semibold text-slate-400">
              {item.department?.name ?? "-"}
              {item.academic_year ? ` · ${item.academic_year}` : ""}
              {item.semester ? ` · ${item.semester}` : ""}
            </p>
          </div>

          <dl className="mt-4 grid gap-2.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <UserRound size={13} />
                {t("lbl.teacher")}
              </dt>
              <dd className="max-w-[62%] truncate text-right font-bold text-slate-700">
                {teacherName(item) || "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <BookOpen size={13} />
                {t("lbl.course")}
              </dt>
              <dd className="max-w-[62%] truncate text-right font-bold text-slate-700">
                {courseLabel(item)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Users size={13} />
                {t("classes.studentsCount")}
              </dt>
              <dd className="text-right font-extrabold text-slate-900">
                {item.students?.length ?? 0}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-5">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => viewStudents(item)}
              type="button"
            >
              <Users size={16} />
              {t("classes.viewStudents")}
            </button>
          </div>
        </article>
      )}
      fields={[
        { name: "department_id", label: t("lbl.department"), type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "teacher_id", label: t("lbl.teacher"), type: "select", required: true, loadOptions: () => teachersApi.list().then((rows) => rows.filter((teacher) => teacher.user_id).map((teacher) => ({ value: teacher.user_id, label: `${teacher.first_name} ${teacher.last_name}` }))) },
        { name: "class_name", label: t("lbl.className"), required: true },
        { name: "academic_year", label: t("lbl.academicYear"), required: true },
        { name: "semester", label: t("lbl.semester"), required: true },
      ]}
      searchKeys={[
        "class_name",
        "department.name",
        "academic_year",
        (item) => teacherName(item),
        (item) => classCourses(item).join(" "),
      ]}
    />
  )
}
