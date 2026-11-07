import { useLanguage } from '../context/LanguageContext'

/**
 * Full-screen wait shown while a stored token is being verified against /api/me.
 *
 * Any screen that would decide where to navigate from the current session has to
 * render this instead of guessing: redirecting before the check settles either
 * signs a valid session out or lands the user on the home page of whatever
 * account localStorage happened to hold.
 */
const AuthPending = () => {
  const { t } = useLanguage()

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-slate-50"
    >
      <p className="text-sm font-semibold text-slate-400">{t('auth.restoring')}</p>
    </div>
  )
}

export default AuthPending
