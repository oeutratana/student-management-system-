import { useMemo, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Send,
  UserRound,
  X,
} from "lucide-react"
import EntityCard from "../components/EntityCard"
import Modal from "../components/Modal"
import ResourcePage from "../components/ResourcePage"
import SetupLinkDisplay from "../components/SetupLinkDisplay"
import { teachersApi, departmentsApi, toOptions } from "../services/schoolApi"
import { storageUrl } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

// A teacher may not have a name yet: the admin only picks the department and the
// teacher fills in their own details through the setup link.
const teacherName = (teacher) =>
  [teacher?.first_name, teacher?.last_name].filter(Boolean).join(" ")

const formatDate = (value) => {
  if (!value) {
    return ""
  }

  // Built from the parts instead of parsed: a plain YYYY-MM-DD from Laravel is
  // UTC midnight, which toLocaleDateString would shift by a day west of Greenwich.
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number)
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)

  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default function Teachers() {
  const { t } = useLanguage()
  const [created, setCreated] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [resend, setResend] = useState(null)
  const [resendError, setResendError] = useState("")
  const [resending, setResending] = useState(false)

  const teacherLabel = (teacher) => teacherName(teacher) || teacher?.teacher_code || "-"

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
      const result = await teachersApi.resendSetupLink(item.id)
      setCreated(null)
      setResend({ teacher: item, ...result })
    } catch (err) {
      setResendError(err.message)
    } finally {
      setResending(false)
    }
  }

  // Kept referentially stable so ResourcePage's option loading does not restart
  // on every render.
  const departmentField = useMemo(
    () => ({
      name: "department_id",
      label: t("lbl.department"),
      type: "select",
      required: true,
      loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")),
    }),
    [t],
  )

  // Creating a teacher only asks for a department; everything else is written by
  // the teacher through their setup link.
  const createFields = useMemo(() => [departmentField], [departmentField])

  // Editing an existing teacher exposes the whole profile. teacher_code is left
  // out on purpose: it is system-owned and a submitted value is ignored anyway.
  const editFields = useMemo(
    () => [
      departmentField,
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
    [departmentField, t],
  )

  const filters = useMemo(
    () => [
      // Reuses the department options already fetched for the form, so filtering
      // costs no extra request. The option values are department ids, so the
      // match is on department_id rather than the displayed name.
      { key: "department_id", label: t("lbl.department"), optionsFrom: "department_id" },
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
          { value: "done", label: t("teacher.setupDone") },
          { value: "pending", label: t("teacher.setupPending") },
        ],
        match: (teacher, value) => Boolean(teacher.setup_completed) === (value === "done"),
      },
    ],
    [t],
  )

  return (
    <>
      {/* Creating a teacher hands back a one-time setup link, so the QR and the
          link are surfaced in a popup instead of a dismissible banner. */}
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
        subtitle={t("teacher.createdHint")}
        title={t("teacher.createdTitle")}
      >
        {created && (
          <>
            <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-2">
              <div>
                <span className="text-[13px] font-bold text-slate-600">{t("lbl.department")}</span>
                <p className="mt-0.5 font-extrabold text-slate-900">{created.teacher.department_name || "-"}</p>
              </div>
              <div>
                <span className="text-[13px] font-bold text-slate-600">{t("lbl.teacherCode")}</span>
                <p className="mt-0.5 font-extrabold text-slate-900">{created.teacher.teacher_code || "-"}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <SetupLinkDisplay alwaysShowQr fileName={`teacher-${created.teacher.teacher_code}-setup-qr.png`} link={created.setup?.url ?? created.setup_link} />
              <p className="mt-3 text-xs font-semibold text-slate-400">{t("setpw.linksExpire")}</p>
            </div>
          </>
        )}
      </Modal>

      {/* Resending mints a fresh link, so the refreshed QR and link pop up too. */}
      <Modal
        footer={
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            onClick={() => setResend(null)}
            type="button"
          >
            {t("modal.done")}
          </button>
        }
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <Send size={19} />
          </span>
        }
        onClose={() => setResend(null)}
        open={Boolean(resend)}
        size="max-w-2xl"
        subtitle={t("teacher.resendHint", { name: teacherLabel(resend?.teacher) })}
        title={t("teacher.resendTitle")}
      >
        {resend && (
          <div className="border-t border-slate-100 pt-5">
            <SetupLinkDisplay alwaysShowQr fileName={`teacher-${resend.teacher.id}-setup-qr.png`} link={resend.setup?.url ?? resend.setup_link} />
            <p className="mt-3 text-xs font-semibold text-slate-400">{t("setpw.linksExpire")}</p>
          </div>
        )}
      </Modal>

      <ResourcePage
        api={teachersApi}
        managePermission="manage_teachers"
        singular={t("lbl.teacher")}
        title={t("page.teachers")}
        description={t("teachers.desc")}
        defaultView="grid"
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
                  label: t("teacher.resendAction"),
                  icon: resending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />,
                  disabled: resending,
                  onSelect: () => handleResend(item),
                },
              ]
        }
        filters={filters}
        gridCard={(item, { actions }) => (
          <EntityCard
            actions={actions}
            badge={
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-inset ${
                  item.setup_completed
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-700/10"
                    : "bg-amber-50 text-amber-700 ring-amber-700/10"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    item.setup_completed ? "bg-emerald-600" : "bg-amber-500"
                  }`}
                />
                {item.setup_completed ? t("teacher.setupDone") : t("teacher.setupPending")}
              </span>
            }
            fields={[
              {
                key: "code",
                icon: <BadgeCheck size={13} />,
                label: t("lbl.teacherCode"),
                value: item.teacher_code ?? "-",
              },
              {
                key: "department",
                icon: <Building2 size={13} />,
                label: t("lbl.department"),
                value: item.department?.name ?? "-",
              },
              {
                key: "email",
                icon: <Mail size={13} />,
                label: t("lbl.email"),
                value: item.email ?? "-",
              },
              {
                key: "phone",
                icon: <Phone size={13} />,
                label: t("lbl.phone"),
                value: item.phone ?? "-",
              },
            ]}
            icon={
              item.image ? (
                <img
                  alt={teacherLabel(item)}
                  className="h-full w-full object-cover"
                  src={storageUrl(item.image)}
                />
              ) : (
                <span className="text-lg font-extrabold">{teacherName(item).charAt(0) || <UserRound size={22} />}</span>
              )
            }
            subtitle={item.department?.name ?? t("teacher.awaitingDetails")}
            title={teacherLabel(item)}
            tone="indigo"
          />
        )}
        columns={[
          { key: "image", label: t("lbl.photo"), render: (item) =>
            item.image ? (
              <img
                src={storageUrl(item.image)}
                alt={teacherLabel(item)}
                className="h-10 w-10 flex-none rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span className="avatar">
                {teacherName(item).charAt(0)}
                {(item.last_name ?? "").charAt(0)}
              </span>
            ),
          },
          { key: "id", label: t("lbl.id") },
          { key: "teacher_code", label: t("lbl.code") },
          { key: "name", label: t("lbl.name"), render: (item) => teacherLabel(item) },
          { key: "department", label: t("lbl.department"), render: (item) => item.department?.name ?? "-" },
          { key: "gender", label: t("lbl.gender") },
          { key: "email", label: t("lbl.email") },
          { key: "phone", label: t("lbl.phone") },
        ]}
        createFields={createFields}
        formNote={t("teacher.createNote")}
        fields={editFields}
        searchKeys={["first_name", "last_name", "teacher_code", "email", "department.name"]}
      />

      {/* Read-only profile sheet. Every optional field is shown as a fact, so a
          half-finished setup reads as "not provided yet" rather than a blank. */}
      <Modal
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-lg font-extrabold text-slate-500">
            {viewing?.image ? (
              <img
                alt={teacherLabel(viewing)}
                className="h-full w-full object-cover"
                src={storageUrl(viewing.image)}
              />
            ) : (
              teacherLabel(viewing).charAt(0)
            )}
          </span>
        }
        onClose={() => setViewing(null)}
        open={Boolean(viewing)}
        size="max-w-2xl"
        subtitle={teacherName(viewing) ? teacherName(viewing) : t("teacher.awaitingDetails")}
        title={viewing?.teacher_code ?? t("lbl.teacher")}
      >
        {viewing && (
          <>
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.teacherCode")}
                </span>
                <p className="mt-0.5 font-extrabold text-slate-900">{viewing.teacher_code}</p>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  {t("lbl.department")}
                </span>
                <p className="mt-0.5 font-extrabold text-slate-900">
                  {viewing.department?.name ?? "-"}
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
            </dl>
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