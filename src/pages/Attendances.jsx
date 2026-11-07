import { CalendarCheck, CalendarDays, CheckCircle2, Clock, FileText, School, XCircle } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { attendancesApi, studentsApi, studentOptionLabel, toOptions } from "../services/schoolApi"
import { storageUrl } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

export default function Attendances() {
  const { t } = useLanguage()

  const statusLabel = (status) =>
    status === "Present" ? t("val.present") : status === "Late" ? t("val.late") : t("val.absent")

  const statusTone = (status) =>
    status === "Present" ? "badge--green" : status === "Late" ? "badge--orange" : "badge--gray"

  const cardTone = (status) =>
    status === "Present" ? "indigo" : status === "Late" ? "violet" : "slate"

  const studentName = (item) =>
    item.student?.first_name
      ? `${item.student.first_name} ${item.student.last_name ?? ""}`.trim()
      : "-"

  const studentInitials = (item) =>
    [item.student?.first_name?.[0], item.student?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || (item.student?.student_code ?? "S").slice(0, 2).toUpperCase()

  const statusOptions = [
    { value: "Present", label: t("val.present") },
    { value: "Absent", label: t("val.absent") },
    { value: "Late", label: t("val.late") },
    { value: "Excused", label: t("val.excused") },
  ]

  const stats = (items) => {
    const present = items.filter((item) => item.status === "Present").length
    const late = items.filter((item) => item.status === "Late").length
    const absent = items.filter((item) => item.status === "Absent" || item.status === "Excused").length
    const rate = items.length ? Math.round((present / items.length) * 100) : 0
    return [
      { key: "total", label: t("attendances.stat.total"), value: items.length, icon: CalendarCheck, tone: "indigo" },
      { key: "present", label: t("attendances.stat.present"), value: present, hint: `${rate}% ${t("attendances.stat.rate")}`, icon: CheckCircle2, tone: "violet" },
      { key: "late", label: t("attendances.stat.late"), value: late, icon: Clock, tone: "indigo" },
      { key: "absent", label: t("attendances.stat.absent"), value: absent, icon: XCircle, tone: "violet" },
    ]
  }

  return (
    <ResourcePage
      accent="indigo"
      api={attendancesApi}
      managePermission="manage_attendance"
      singular={t("lbl.attendance")}
      title={t("page.attendances")}
      description={t("attendances.desc")}
      defaultView="grid"
      stats={stats}
      filters={[{ key: "status", label: t("lbl.status"), options: statusOptions }]}
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span className={`badge ${statusTone(item.status)}`}>
              {statusLabel(item.status)}
            </span>
          }
          fields={[
            {
              key: "class",
              icon: <School size={13} />,
              label: t("lbl.class"),
              value: item.student?.class?.class_name ?? "-",
            },
            {
              key: "date",
              icon: <CalendarDays size={13} />,
              label: t("lbl.date"),
              value: item.date ?? "-",
            },
            {
              key: "note",
              icon: <FileText size={13} />,
              label: t("lbl.note"),
              value: item.note || "-",
            },
          ]}
          icon={
            item.student?.image ? (
              <img
                alt={studentName(item)}
                className="h-full w-full object-cover"
                src={storageUrl(item.student.image)}
              />
            ) : (
              <span className="text-lg font-extrabold">{studentInitials(item)}</span>
            )
          }
          subtitle={item.student?.class?.class_name ?? "-"}
          title={studentName(item)}
          tone={cardTone(item.status)}
        />
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "class", label: t("lbl.class"), render: (item) => item.student?.class?.class_name ?? "-" },
        { key: "date", label: t("lbl.date") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, studentOptionLabel)) },
        { name: "date", label: t("lbl.date"), type: "date", required: true },
        { name: "status", label: t("lbl.status"), type: "select", required: true, options: statusOptions },
        { name: "note", label: t("lbl.note"), type: "textarea" },
      ]}
      searchKeys={["student.first_name", "student.last_name", "date", "status"]}
    />
  )
}
