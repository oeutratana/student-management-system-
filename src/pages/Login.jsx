import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, GraduationCap, Lock, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import AuthPending from "../components/AuthPending"
import { API_BASE_URL } from "../services/apiClient"
import { canAccessPath, homePathFor } from "../rolePaths"

// A redirect that was requested before the session was resolved survives a full
// page reload as a query parameter (see the 401 handling in apiClient), while an
// in-app redirect carries it on the location state.
const intendedPath = (state, params) => {
  const candidates = [state?.from, params.get("from")]
  return candidates.find((path) => typeof path === "string" && path.startsWith("/") && !path.startsWith("//"))
}

// Route access is a property of the path alone; a query string must not make a
// permitted destination look forbidden.
const mayOpen = (user, path) => canAccessPath(user, path.split(/[?#]/)[0])

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { authInitializing, isAuthenticated, login, user } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // A session that is still valid must not be shown the form again, which is
  // where the api client lands after it has cleared an expired session. The
  // check waits for /api/me so a stale storage user cannot bounce the visitor
  // back into the app under the wrong account.
  if (authInitializing) {
    return <AuthPending />
  }

  if (isAuthenticated) {
    const from = intendedPath(location.state, searchParams)
    return <Navigate replace to={from && mayOpen(user, from) ? from : homePathFor(user)} />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      // Read the live input values on submit. Browser password managers can
      // autofill a controlled input without firing React's change handler, in
      // which case state may not match what is visible in the form.
      const formData = new FormData(event.currentTarget)
      const submittedEmail = String(formData.get("email") ?? "").trim().toLowerCase()
      const submittedPassword = String(formData.get("password") ?? "")

      // The user returned by login() is the account the server authenticated, so
      // the destination is derived from it rather than from the form.
      const authUser = await login({ email: submittedEmail, password: submittedPassword })
      const from = intendedPath(location.state, searchParams)
      navigate(from && mayOpen(authUser, from) ? from : homePathFor(authUser))
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
              autoCapitalize="none"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              spellCheck={false}
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
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("lbl.password")}
              required
              type="password"
              value={password}
            />
          </div>

          <p className="login-form__forgot">
            <Link to="/forgot-password">{t("auth.forgotPassword")}</Link>
          </p>

          <button disabled={loading} type="submit">
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>

          <div className="login-form__divider">{t("auth.or")}</div>

          {/* A full page navigation: the backend redirects to Google, and the
              callback then returns to /auth/google/callback with a token. */}
          <a className="login-form__google" href={`${API_BASE_URL}/auth/google/redirect`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.googleContinue")}
          </a>

          <p className="form-note">
            {t("auth.needAccount")} <Link to="/register">{t("auth.register")}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
