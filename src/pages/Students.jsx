import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BookOpen, CheckCircle2, Eye, RefreshCw, School, Send, UserRound, X } from "lucide-react"
import ResourcePage from "../components/ResourcePage"
import Modal from "../components/Modal"
import SetupLinkDisplay from "../components/SetupLinkDisplay"
import { studentsApi, classesApi, toOptions } from "../services/schoolApi"
import { storageUrl } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

// A student may not have a name yet: the admin only picks the class and the
// student fills in their own details through the setup link.
const studentName = (student) =>
  [student?.first_name, student?.last_name].filter(Boolean).join(" ")

const studentInitials = (student) => {
  const name = studentName(student)

  if (name) {
    return [student.first_name?.[0], student.last_name?.[0]].filter(Boolean).join("").toUpperCase()
  }

  return (student?.student_code ?? "S").slice(0, 2).toUpperCase()
}

const studentCourses = (student) => [
  ...new Set(
    (student?.enrollments ?? [])
      .map((enrollment) => enrollment.course?.course_name)
      .filter(Boolean),
  ),
]

const studentTeacher = (student) => student?.class?.teacher?.name ?? ""

const formatDate = (value) => {
  if (!value) {
    return ""
  }

  // Built from the parts instead of parsed: a plain YYYY-MM-DD from Laravel is
  // UTC midnight, which toLocaleDateString would shift by a day west of Greenwich.
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number)
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default function Students() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const classFilter = searchParams.get("class") ?? ""
  const initialFilters = useMemo(
    () => (classFilter ? { class_id: classFilter } : {}),
    [classFilter],
  )
  const courseLabel = (student) => studentCourses(student).join(", ") || t("student.noCourse")
  const [created, setCreated] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [resend, setResend] = useState(null)
  const [resendError, setResendError] = useState("")
  const [resending, setResending] = useState(false)

  const studentLabel = (student) => studentName(student) || student?.student_code || "-"

  const handleCreated = (result) => {
    setResend(null)
    setCreated(result)
  }

  const handleOpenCreate = () => {
    setCreated(null)
    setViewing(null)
    setResend(null)
    setResendError("")
  }

  const handleResend = async (item) => {
    setResendError("")
    setResending(true)
    try {
      const result = await studentsApi.resendSetupLink(item.id)
      setCreated(null)
      setResend({ student: item, setup_link: result.setup_link })
    } catch (err) {
      setResendError(err.message)
    } finally {
      setResending(false)
    }
  }

  // Kept referentially stable so ResourcePage's option loading does not restart
  // on every render.
  const classField = useMemo(
    () => ({
      name: "class_id",
      label: t("lbl.class"),
      type: "select",
      required: true,
      loadOptions: () => classesApi.list().then((rows) => toOptions(rows, "class_name")),
    }),
    [t],
  )

  // Creating a student only asks for a class; everything else is written by the
  // student through their setup link.
  const createFields = useMemo(() => [classField], [classField])

  const editFields = useMemo(
    () => [
      classField,
      { name: "student_code", label: t("lbl.studentCode"), required: true },
      { name: "first_name", label: t("lbl.firstName"), required: true },
      { name: "last_name", label: t("lbl.lastName"), required: true },
      {
        name: "gender",
        label: t("lbl.gender"),
        type: "select",
        required: true,
        options: [
          { value: "Male", label: t("val.male") },
          { value: "Female", label: t("val.female") },
        ],
      },
      { name: "dob", label: t("lbl.dob"), type: "date", required: true },
      { name: "email", label: t("lbl.email"), type: "email", required: true },
      { name: "phone", label: t("lbl.phone") },
      { name: "address", label: t("lbl.address"), type: "textarea" },
      { name: "image", label: t("lbl.image") },
    ],
    [classField, t],
  )

  const filters = useMemo(
    () => [
      // Reuses the class options already fetched for the form, so filtering
      // costs no extra request. The option values are class ids, so the match
      // is on class_id rather than the displayed name.
      { key: "class_id", label: t("lbl.class"), optionsFrom: "class_id" },
      {
        key: "gender",
        label: t("lbl.gender"),
        options: [
          { value: "Male", label: t("val.male") },
          { value: "Female", label: t("val.female") },
        ],
      },
      {
        key: "setup_completed",
        label: t("lbl.setupStatus"),
        options: [
          { value: "done", label: t("student.setupDone") },
          { value: "pending", label: t("student.setupPending") },
        ],
        match: (student, value) => Boolean(student.setup_completed) === (value === "done"),
      },
    ],
    [t],
  )

  return (
    <>
      {resend && (
        <section className="rounded-3xl border border-indigo-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_44px_-28px_rgba(79,70,229,0.4)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                <Send size={19} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  {t("student.resendTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {t("student.resendHint", { name: studentLabel(resend.student) })}
                </p>
              </div>
            </div>
            <button
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setResend(null)}
              title={t("modal.close")}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <SetupLinkDisplay link={resend.setup_link} />
            <p className="mt-3 text-xs font-semibold text-slate-400">{t("setpw.linksExpire")}</p>
          </div>
        </section>
      )}

      <ResourcePage
        api={studentsApi}
        managePermission="manage_students"
        createPermission="create_students"
        singular={t("lbl.student")}
        title={t("page.students")}
        description={t("students.desc")}
        onCreated={handleCreated}
        onOpenCreate={handleOpenCreate}
        viewAction={(item) => [
          {
            key: "view",
            label: t("res.view"),
            icon: <Eye size={16} />,
            onSelect: () => setViewing(item),
          },
        ]}
        rowActions={(item) =>
          item.setup_completed
            ? []
            : [
                {
                  key: "resend",
                  label: t("student.resendAction"),
                  icon: resending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />,
                  disabled: resending,
                  onSelect: () => handleResend(item),
                },
              ]
        }
        filters={filters}
        initialFilters={initialFilters}
        defaultView="grid"
        columns={[
          {
            key: "student_code",
            label: t("lbl.studentCode"),
            render: (item) => (
              <span className="font-extrabold text-slate-900">{item.student_code}</span>
            ),
          },
          {
            key: "name",
            label: t("lbl.studentName"),
            render: (item) => (
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-white">
                  {item.image ? (
                    <img
                      alt={studentLabel(item)}
                      className="h-full w-full object-cover"
                      src={storageUrl(item.image)}
                    />
                  ) : (
                    studentInitials(item)
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{studentLabel(item)}</p>
                  {item.email && <p className="truncate text-xs font-medium text-slate-400">{item.email}</p>}
                </div>
              </div>
            ),
          },
          { key: "class", label: t("lbl.class"), render: (item) => item.class?.class_name ?? "-" },
          { key: "course", label: t("lbl.course"), render: (item) => courseLabel(item) },
          { key: "teacher", label: t("lbl.teacher"), render: (item) => studentTeacher(item) || "-" },
        ]}
        gridCard={(item, { actions }) => (
          <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_44px_-32px_rgba(16,24,40,0.3)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_50px_-30px_rgba(79,70,229,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-extrabold text-white shadow-lg shadow-indigo-600/20">
                {item.image ? (
                  <img
                    alt={studentLabel(item)}
                    className="h-full w-full object-cover"
                    src={storageUrl(item.image)}
                  />
                ) : (
                  studentInitials(item)
                )}
              </span>
              {actions}
            </div>

            <div className="mt-4 min-w-0">
              <h3 className="truncate text-base font-extrabold tracking-tight text-slate-900">
                {studentName(item) || t("student.awaitingDetails")}
              </h3>
              <p className="mt-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {item.student_code}
              </p>
            </div>

            <dl className="mt-4 grid gap-2.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <School size={13} />
                  {t("lbl.class")}
                </dt>
                <dd className="max-w-[62%] truncate text-right font-bold text-slate-700">
                  {item.class?.class_name ?? "-"}
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
                  <UserRound size={13} />
                  {t("lbl.teacher")}
                </dt>
                <dd className="max-w-[62%] truncate text-right font-bold text-slate-700">
                  {studentTeacher(item) || "-"}
                </dd>
              </div>
            </dl>

            <div className="mt-auto pt-5">
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20"
                onClick={() => setViewing(item)}
                type="button"
              >
                <Eye size={16} />
                {t("student.viewDetails")}
              </button>
            </div>
          </article>
        )}
        createFields={createFields}
        formNote={t("student.createNote")}
        fields={editFields}
        searchKeys={[
          "first_name",
          "last_name",
          "student_code",
          "email",
          (item) => item.class?.class_name ?? "",
          (item) => studentTeacher(item),
          (item) => studentCourses(item).join(" "),
        ]}
      />

      {/* Read-only profile sheet. Every optional field is shown as a fact, so a
          half-finished setup reads as "not provided yet" rather than a blank. */}
      <Modal
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-lg font-extrabold text-slate-500">
            {viewing?.image ? (
              <img
                alt={studentLabel(viewing)}
                className="h-full w-full object-cover"
                src={storageUrl(viewing.image)}
              />
            ) : (
              studentLabel(viewing).charAt(0)
            )}
          </span>
        }
        onClose={() => setViewing(null)}
        open={Boolean(viewing)}
        size="max-w-2xl"
        subtitle={studentName(viewing) ? undefined : t("student.awaitingDetails")}
        title={studentLabel(viewing)}
      >
        {viewing && (
          <>
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.studentCode")}
                </span>
                <p className="mt-0.5 font-extrabold text-slate-900">{viewing.student_code}</p>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.class")}
                </span>
                <p className="mt-0.5 font-extrabold text-slate-900">
                  {viewing.class?.class_name ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.joined")}
                </span>
                <p className="mt-0.5 font-extrabold text-slate-900">
                  {formatDate(viewing.created_at) || "-"}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                { label: t("lbl.firstName"), value: viewing.first_name },
                { label: t("lbl.lastName"), value: viewing.last_name },
                { label: t("lbl.gender"), value: viewing.gender },
                { label: t("lbl.dob"), value: formatDate(viewing.dob) },
                { label: t("lbl.email"), value: viewing.email },
                { label: t("lbl.phone"), value: viewing.phone },
              ].map((field) => (
                <div key={field.label}>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-800">
                    {field.value || (
                      <span className="font-semibold text-slate-400">{t("lbl.notProvided")}</span>
                    )}
                  </dd>
                </div>
              ))}

              <div className="sm:col-span-2">
                <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.address")}
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-800">
                  {viewing.address || (
                    <span className="font-semibold text-slate-400">{t("lbl.notProvided")}</span>
                  )}
                </dd>
              </div>

              {viewing.guardians && viewing.guardians.length > 0 && (
                <div className="sm:col-span-2 mt-2 border-t border-slate-100 pt-3">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {t("parents.guardians")}
                  </dt>
                  <dd className="mt-2 grid gap-2 sm:grid-cols-2">
                    {viewing.guardians.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-xs font-extrabold text-slate-900">{g.name}</p>
                          {g.phone && <p className="truncate text-[11px] font-semibold text-slate-500">{g.phone}</p>}
                        </div>
                        <span className="flex-none rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          {g.relation}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </>
        )}
      </Modal>

      {/* Creating a student hands back a one-time setup link, so the QR and the
          link are surfaced immediately instead of a dismissible banner. */}
      <Modal
        footer={
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            onClick={() => setCreated(null)}
            type="button"
          >
            {t("modal.done")}
          </button>
        }
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-600/25">
            <CheckCircle2 size={20} />
          </span>
        }
        onClose={() => setCreated(null)}
        open={Boolean(created)}
        size="max-w-2xl"
        subtitle={t("student.createdHint")}
        title={t("student.createdTitle")}
      >
        {created && (
          <>
            {/* <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-3">
              <div>
                <span className="text-[13px] font-bold text-slate-600">{t("lbl.class")}</span>
                <p className="mt-0.5 font-extrabold text-slate-900">
                  {created.student?.class?.class_name ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-[13px] font-bold text-slate-600">{t("lbl.studentCode")}</span>
                <p className="mt-0.5 font-extrabold text-slate-900">{created.student?.student_code}</p>
              </div>
              <div>
                <span className="text-[13px] font-bold text-slate-600">{t("lbl.student")}</span>
                <p className="mt-0.5 font-extrabold text-slate-900">
                  {studentName(created.student) || t("student.awaitingDetails")}
                </p>
              </div>
            </div> */}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <SetupLinkDisplay
                alwaysShowQr
                fileName={`setup-qr-${created.student?.student_code ?? "student"}.png`}
                link={created.setup_link}
              />
              <p className="mt-3 text-xs font-semibold text-slate-400">{t("setpw.linksExpire")}</p>
            </div>
          </>
        )}
      </Modal>

      {resendError && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-rose-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-rose-700">{resendError}</p>
            <button
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              onClick={() => setResendError("")}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}