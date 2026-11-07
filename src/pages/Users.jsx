import { useState } from "react"
import { CheckCircle2, Mail, RefreshCw, Send, ShieldCheck, UserRound, X } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import SetupLinkDisplay from "../components/SetupLinkDisplay"
import { usersApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Users() {
  const { t } = useLanguage()
  const [created, setCreated] = useState(null)
  const [resend, setResend] = useState(null)
  const [resendError, setResendError] = useState("")
  const [resending, setResending] = useState(false)

  const roleLabel = (role) =>
    role === "admin" ? t("val.admin") : role === "teacher" ? t("lbl.teacher") : t("lbl.student")

  const handleCreated = (result) => {
    setResend(null)
    setCreated(result)
  }

  const handleOpenCreate = () => {
    setCreated(null)
    setResend(null)
    setResendError("")
  }

  const handleResend = async (item) => {
    setResendError("")
    setResending(true)
    try {
      const result = await usersApi.resendSetupLink(item.id)
      setCreated(null)
      setResend({ user: item, setup_link: result.setup_link })
    } catch (err) {
      setResendError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      {created && (
        <section className="rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_44px_-28px_rgba(16,185,129,0.4)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-600/25">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-emerald-700">
                  {t("users.createdTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">{t("users.createdHint")}</p>
              </div>
            </div>
            <button
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setCreated(null)}
              title="Close"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-2">
            <div>
              <span className="text-[13px] font-bold text-slate-600">{t("lbl.name")}</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{created.user?.name}</p>
            </div>
            <div>
              <span className="text-[13px] font-bold text-slate-600">{t("lbl.email")}</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{created.user?.email}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <SetupLinkDisplay link={created.setup_link} />
            <p className="mt-3 text-xs font-semibold text-slate-400">{t("setpw.linksExpire")}</p>
          </div>
        </section>
      )}

      {resend && (
        <section className="rounded-3xl border border-indigo-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_44px_-28px_rgba(79,70,229,0.4)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                <Send size={19} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  {t("users.resendTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {t("users.resendHint", { name: resend.user?.name })}
                </p>
              </div>
            </div>
            <button
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setResend(null)}
              title="Close"
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
        api={usersApi}
        managePermission="manage_users"
        singular={t("lbl.user")}
        title={t("page.users")}
        description={t("users.desc")}
        defaultView="grid"
        onCreated={handleCreated}
        onOpenCreate={handleOpenCreate}
        formNote={t("users.formNote")}
        rowActions={(item) => [
          {
            key: "resend",
            label: t("users.resendAction"),
            icon: resending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />,
            disabled: resending,
            onSelect: () => handleResend(item),
          },
        ]}
        gridCard={(item, { actions }) => (
          <EntityCard
            actions={actions}
            badge={
              <span
                className={`badge ${item.role === "admin" ? "badge--blue" : "badge--green"}`}
              >
                {roleLabel(item.role)}
              </span>
            }
            fields={[
              {
                key: "email",
                icon: <Mail size={13} />,
                label: t("lbl.email"),
                value: item.email ?? "-",
              },
            ]}
            icon={
              item.role === "admin" ? <ShieldCheck size={24} /> : <UserRound size={24} />
            }
            subtitle={item.email ?? "-"}
            title={item.name}
            tone={item.role === "admin" ? "indigo" : "emerald"}
          />
        )}
        columns={[
          { key: "id", label: t("lbl.id") },
          { key: "name", label: t("lbl.name") },
          { key: "email", label: t("lbl.email") },
          {
            key: "role",
            label: t("lbl.role"),
            render: (item) => (
              <span className={`badge ${item.role === "admin" ? "badge--blue" : "badge--green"}`}>
                {roleLabel(item.role)}
              </span>
            ),
          },
        ]}
        fields={[
          { name: "name", label: t("lbl.name"), required: true },
          { name: "email", label: t("lbl.email"), type: "email", required: true },
          {
            name: "role",
            label: t("lbl.role"),
            type: "select",
            required: true,
            options: [
              { value: "admin", label: t("val.admin") },
              { value: "teacher", label: t("lbl.teacher") },
              { value: "student", label: t("lbl.student") },
            ],
          },
        ]}
        searchKeys={["name", "email", "role"]}
      />

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