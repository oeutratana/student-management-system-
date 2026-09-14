import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CheckCircle2, GraduationCap, Lock, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login({ email, password })
      navigate("/dashboard")
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
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__title">
            <h1>{t("auth.welcomeBack")}</h1>
            <p className="login-form__subtitle">{t("auth.signInSub")}</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <label htmlFor="email">{t("lbl.email")}</label>
          <div className="login-form__field">
            <Mail size={16} />
            <input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <label htmlFor="password">{t("lbl.password")}</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("lbl.password")}
              required
              type="password"
              value={password}
            />
          </div>

          <button disabled={loading} type="submit">
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>

          <p className="form-note">
            {t("auth.needAccount")} <Link to="/register">{t("auth.register")}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
