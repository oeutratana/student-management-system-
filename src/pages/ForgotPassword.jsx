import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, GraduationCap, Mail } from "lucide-react"
import { authApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const ForgotPassword = () => {
  const { t } = useLanguage()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = new FormData(event.currentTarget)
      await authApi.forgotPassword({
        email: String(data.get("email") ?? "").trim().toLowerCase(),
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        {sent ? (
          <div className="login-form">
            <div className="login-form__title">
              <span className="auth-status auth-status--success">
                <CheckCircle2 size={22} />
              </span>
              <h1>{t("auth.resetLinkSentTitle")}</h1>
              <p className="login-form__subtitle">{t("auth.resetLinkSent")}</p>
            </div>

            <Link className="login-form__google" to="/login">
              {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__title">
              <h1>{t("auth.forgotTitle")}</h1>
              <p className="login-form__subtitle">{t("auth.forgotSub")}</p>
            </div>

            {error && <div className="alert">{error}</div>}

            <label htmlFor="email">{t("lbl.email")}</label>
            <div className="login-form__field">
              <Mail size={16} />
              <input
                autoComplete="email"
                autoCapitalize="none"
                id="email"
                name="email"
                placeholder="admin@example.com"
                required
                spellCheck={false}
                type="email"
              />
            </div>

            <button disabled={loading} type="submit">
              {loading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
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

export default ForgotPassword
