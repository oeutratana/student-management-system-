import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AlertCircle, CheckCircle2, GraduationCap, Lock, Mail } from "lucide-react"
import { authApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""
  const { t } = useLanguage()
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    const data = new FormData(event.currentTarget)
    const password = String(data.get("password") ?? "")
    const confirmation = String(data.get("password_confirmation") ?? "")

    if (password !== confirmation) {
      setError(t("auth.passwordMismatch"))
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({
        token,
        email: String(data.get("email") ?? "").trim().toLowerCase(),
        password,
        password_confirmation: confirmation,
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statusPanel = (title, message, icon, tone = "success") => (
    <div className="login-form">
      <div className="login-form__title">
        <span className={`auth-status auth-status--${tone}`}>{icon}</span>
        <h1>{title}</h1>
        <p className="login-form__subtitle">{message}</p>
      </div>

      <Link className="login-form__google" to="/login">
        {t("auth.backToLogin")}
      </Link>

      {!done && (
        <p className="form-note">
          <Link to="/forgot-password">{t("auth.requestNewLink")}</Link>
        </p>
      )}
    </div>
  )

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand__top">
          <span className="login-brand__logo">
            <GraduationCap size={24} />
          </span>
          {t("brand.name")}
        </div>

        <div className="login-brand__body">
          <h2>{t("auth.hero1")}</h2>
          <p>{t("auth.hero1Text")}</p>

          <div className="login-brand__points">
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p1")}
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p2")}
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p3")}
            </span>
          </div>
        </div>

        <p className="login-brand__bottom">
          {t("auth.footer", { year: new Date().getFullYear() })}
        </p>
      </section>

      <section className="login-panel">
        {done
          ? statusPanel(
              t("auth.resetSuccessTitle"),
              t("auth.resetSuccess"),
              <CheckCircle2 size={22} />,
            )
          : !token
            ? statusPanel(
                t("auth.resetTitle"),
                t("auth.resetInvalidLink"),
                <AlertCircle size={22} />,
                "error",
              )
            : (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-form__title">
                  <h1>{t("auth.resetTitle")}</h1>
                  <p className="login-form__subtitle">{t("auth.resetSub")}</p>
                </div>

                {error && <div className="alert">{error}</div>}

                <label htmlFor="email">{t("lbl.email")}</label>
                <div className="login-form__field">
                  <Mail size={16} />
                  <input
                    autoComplete="email"
                    autoCapitalize="none"
                    defaultValue={email}
                    id="email"
                    name="email"
                    placeholder="admin@example.com"
                    required
                    spellCheck={false}
                    type="email"
                  />
                </div>

                <label htmlFor="password">{t("auth.newPassword")}</label>
                <div className="login-form__field">
                  <Lock size={16} />
                  <input
                    autoComplete="new-password"
                    id="password"
                    minLength={6}
                    name="password"
                    placeholder={t("auth.newPassword")}
                    required
                    type="password"
                  />
                </div>

                <label htmlFor="password_confirmation">{t("lbl.confirmPassword")}</label>
                <div className="login-form__field">
                  <Lock size={16} />
                  <input
                    autoComplete="new-password"
                    id="password_confirmation"
                    minLength={6}
                    name="password_confirmation"
                    placeholder={t("lbl.confirmPassword")}
                    required
                    type="password"
                  />
                </div>

                <button disabled={loading} type="submit">
                  {loading ? t("auth.resetting") : t("auth.resetButton")}
                </button>

                <p className="form-note">
                  <Link to="/login">{t("auth.backToLogin")}</Link>
                </p>
              </form>
            )}
      </section>
    </main>
  )
}

export default ResetPassword
