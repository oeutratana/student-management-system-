import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CheckCircle2, GraduationCap, Lock, Mail, UserRound } from "lucide-react"
import { authApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    // The role is not sent: the server decides it. The first account of a
    // fresh installation becomes the administrator, any later one a student.
    const data = {
      ...Object.fromEntries(new FormData(event.currentTarget)),
    }

    if (data.password !== data.password_confirmation) {
      setError(t("auth.passwordMismatch"))
      return
    }

    setLoading(true)
    try {
      await authApi.register(data)
      navigate("/login")
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
          <h2>{t("auth.hero2")}</h2>
          <p>{t("auth.hero2Text")}</p>

          <div className="login-brand__points">
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p4")}
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p5")}
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              {t("auth.p6")}
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
            <h1>{t("auth.registerTitle")}</h1>
            <p className="login-form__subtitle">{t("auth.registerSub")}</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <label htmlFor="name">{t("lbl.name")}</label>
          <div className="login-form__field">
            <UserRound size={16} />
            <input
              autoComplete="name"
              id="name"
              name="name"
              onChange={handleChange}
              placeholder="School Admin"
              required
              type="text"
              value={form.name}
            />
          </div>

          <label htmlFor="email">{t("lbl.email")}</label>
          <div className="login-form__field">
            <Mail size={16} />
            <input
              autoComplete="email"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              type="email"
              value={form.email}
            />
          </div>

          <label htmlFor="password">{t("lbl.password")}</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder={t("lbl.password")}
              required
              type="password"
              value={form.password}
            />
          </div>

          <label htmlFor="password_confirmation">{t("lbl.confirmPassword")}</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password_confirmation"
              name="password_confirmation"
              onChange={handleChange}
              placeholder={t("lbl.confirmPassword")}
              required
              type="password"
              value={form.password_confirmation}
            />
          </div>

          <button disabled={loading} type="submit">
            {loading ? t("auth.creating") : t("auth.register")}
          </button>

          <p className="form-note">
            {t("auth.already")} <Link to="/login">{t("auth.login")}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Register
