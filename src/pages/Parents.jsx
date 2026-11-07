import { useMemo, useState } from "react"
import { Eye, HeartHandshake, MapPin, Phone, User, Users } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import Modal from "../components/Modal"
import { parentsApi, studentOptionLabel, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const studentName = (student) =>
  [student?.first_name, student?.last_name].filter(Boolean).join(" ")

const formatDate = (value) => {
  if (!value) return ""
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number)
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default function Parents() {
  const { t } = useLanguage()
  const [viewing, setViewing] = useState(null)

  const relationLabel = (relation) => {
    if (relation === "Father") return t("val.father")
    if (relation === "Mother") return t("val.mother")
    if (relation === "Guardian") return t("val.guardian")
    return relation || "-"
  }

  const relationTone = (relation) => {
    if (relation === "Father") {
      return {
        badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10",
        dot: "bg-blue-600",
      }
    }
    if (relation === "Mother") {
      return {
        badge: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10",
        dot: "bg-purple-600",
      }
    }
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10",
      dot: "bg-emerald-600",
    }
  }

  const relationOptions = useMemo(
    () => [
      { value: "Father", label: t("val.father") },
      { value: "Mother", label: t("val.mother") },
      { value: "Guardian", label: t("val.guardian") },
    ],
    [t],
  )

  const filters = useMemo(
    () => [
      {
        key: "relation",
        label: t("lbl.relation"),
        options: relationOptions,
      },
    ],
    [relationOptions, t],
  )

  const renderRelationBadge = (relation) => {
    const tone = relationTone(relation)
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
        {relationLabel(relation)}
      </span>
    )
  }

  return (
    <>
      <ResourcePage
        api={parentsApi}
        managePermission="manage_parents"
        singular={t("lbl.parent")}
        title={t("page.parents")}
        description={t("parents.desc")}
        defaultView="grid"
        filters={filters}
        gridCard={(item, { actions }) => (
          <EntityCard
            actions={actions}
            badge={renderRelationBadge(item.relation)}
            fields={[
              {
                key: "student",
                icon: <Users size={13} />,
                label: t("lbl.student"),
                value: studentName(item.student) || item.student?.student_code || "-",
              },
              {
                key: "phone",
                icon: <Phone size={13} />,
                label: t("lbl.phone"),
                value: item.phone || "-",
              },
              {
                key: "address",
                icon: <MapPin size={13} />,
                label: t("lbl.address"),
                value: item.address || "-",
              },
            ]}
            icon={<HeartHandshake size={24} />}
            subtitle={item.phone || t("lbl.notProvided")}
            title={item.name}
            tone="indigo"
          />
        )}
        columns={[
          { key: "id", label: t("lbl.id") },
          {
            key: "name",
            label: t("lbl.name"),
            render: (item) => (
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-sm">
                  {(item.name || "P").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 leading-tight">{item.name}</p>
                </div>
              </div>
            ),
          },
          {
            key: "relation",
            label: t("lbl.relation"),
            render: (item) => renderRelationBadge(item.relation),
          },
          {
            key: "student",
            label: t("lbl.student"),
            render: (item) => {
              const name = studentName(item.student)
              if (!name && !item.student?.student_code) {
                return <span className="text-xs font-medium text-slate-400">-</span>
              }
              return (
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 leading-tight">
                    {name || item.student?.student_code}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {item.student?.student_code && (
                      <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-bold font-mono text-indigo-700">
                        {item.student.student_code}
                      </span>
                    )}
                    {item.student?.class?.class_name && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
                        {item.student.class.class_name}
                      </span>
                    )}
                  </div>
                </div>
              )
            },
          },
          { key: "phone", label: t("lbl.phone") },
          { key: "address", label: t("lbl.address") },
        ]}
        fields={[
          {
            name: "student_id",
            label: t("lbl.student"),
            type: "select",
            required: true,
            loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, studentOptionLabel)),
          },
          { name: "name", label: t("lbl.name"), required: true },
          {
            name: "relation",
            label: t("lbl.relation"),
            type: "select",
            required: true,
            options: relationOptions,
          },
          { name: "phone", label: t("lbl.phone") },
          { name: "address", label: t("lbl.address"), type: "textarea" },
        ]}
        searchKeys={[
          "name",
          "relation",
          "phone",
          "address",
          "student.first_name",
          "student.last_name",
          "student.student_code",
        ]}
        viewAction={(item) => [
          {
            key: "view",
            label: t("res.view"),
            icon: <Eye size={16} />,
            onSelect: () => setViewing(item),
          },
        ]}
      />

      {/* Read-only Parent & Student Relationship Details Modal */}
      <Modal
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <HeartHandshake size={20} />
          </span>
        }
        onClose={() => setViewing(null)}
        open={Boolean(viewing)}
        size="max-w-2xl"
        subtitle={viewing ? `${relationLabel(viewing.relation)} • ${viewing.name}` : undefined}
        title={t("parents.viewTitle")}
      >
        {viewing && (
          <div className="flex flex-col gap-5">
            {/* Parent Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
                    <User size={16} />
                  </span>
                  <h3 className="font-extrabold text-slate-900">{t("parents.parentInfo")}</h3>
                </div>
                {renderRelationBadge(viewing.relation)}
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {t("lbl.name")}
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-800">{viewing.name}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {t("lbl.relation")}
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-800">
                    {relationLabel(viewing.relation)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {t("lbl.phone")}
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-800">
                    {viewing.phone || <span className="font-semibold text-slate-400">{t("lbl.notProvided")}</span>}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    {t("lbl.address")}
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-800">
                    {viewing.address || <span className="font-semibold text-slate-400">{t("lbl.notProvided")}</span>}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Linked Student Section */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex items-center gap-2.5 border-b border-indigo-100/80 pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
                  <Users size={16} />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900">{t("parents.studentInfo")}</h3>
                  <p className="text-xs text-slate-500">{t("parents.linkedStudent")}</p>
                </div>
              </div>

              {viewing.student ? (
                <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.student")}
                    </dt>
                    <dd className="mt-0.5 text-sm font-extrabold text-slate-900">
                      {studentName(viewing.student) || viewing.student.student_code}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.studentCode")}
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-indigo-700">
                      {viewing.student.student_code || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.class")}
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {viewing.student.class?.class_name || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.gender")}
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {viewing.student.gender || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.dob")}
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {formatDate(viewing.student.dob) || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      {t("lbl.phone")}
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {viewing.student.phone || "-"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-400">{t("parents.noStudent")}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}