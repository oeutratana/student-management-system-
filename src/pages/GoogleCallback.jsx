import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import AuthPending from "../components/AuthPending"
import { homePathFor } from "../rolePaths"

/**
 * The backend redirects here after Google has authenticated the user and has
 * issued a Sanctum token. The token rides in the URL fragment rather than the
 * query string, so it is never sent to a server or a proxy log.
 */
const readCallbackParams = () => {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""))

  return {
    token: params.get("token"),
    error: params.get("error"),
  }
}

const GoogleCallback = () => {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const { t } = useLanguage()
  // The fragment is read once, before the effect, so a missing token can be
  // reported through the initial state instead of a state update inside the
  // effect (which would cascade an extra render).
  const [params] = useState(readCallbackParams)
  const [error, setError] = useState(() =>
    params.token ? "" : params.error || t("auth.googleFailed"),
  )
  const startedRef = useRef(false)

  useEffect(() => {
    // StrictMode runs effects twice in development. The token is single-use
    // from the app's point of view, so only the first run may consume it.
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    // Remove the token from the address bar and history before it can be
    // bookmarked, copied or carried into a later request.
    window.history.replaceState(null, "", window.location.pathname)

    if (!params.token) {
      return
    }

    loginWithToken(params.token)
      .then((authUser) => {
        navigate(homePathFor(authUser), { replace: true })
      })
      .catch((err) => {
        setError(err?.message || t("auth.googleFailed"))
      })
  }, [loginWithToken, navigate, t, params])

  if (!error) {
    return <AuthPending />
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
        </div>

        <p className="login-brand__bottom">
          {t("auth.footer", { year: new Date().getFullYear() })}
        </p>
      </section>

      <section className="login-panel">
        <div className="login-form">
          <div className="login-form__title">
            <h1>{t("auth.googleFailedTitle")}</h1>
            <p className="login-form__subtitle">{error}</p>
          </div>

          <Link className="login-form__google" to="/login">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </section>
    </main>
  )
}

export default GoogleCallback
