import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  Cake,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  ImagePlus,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react"
import { accountSetupApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const MIN_PASSWORD_LENGTH = 6
const INVALID_TOKEN_STATUSES = [404, 409, 410]
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TODAY = new Date().toISOString().slice(0, 10)

const primaryButton = "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"

// Length plus character-class variety, capped at four segments. Only ever shown
// next to the field, never enforced beyond the backend minimum.
const passwordStrength = (value) => {
  if (!value) return 0

  let score = 0
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1
  if (value.length >= 10) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) || /[^\w\s]/.test(value)) score += 1
  return score
}

const STRENGTH_KEYS = ["setup.pwEmpty", "setup.pwWeak", "setup.pwFair", "setup.pwGood", "setup.pwStrong"]

const fieldErrors = (err) => {
  const errors = err?.errors
  if (!errors || typeof errors !== "object") {
    return {}
  }
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      (Array.isArray(messages) ? messages : [messages]).filter(Boolean)[0] || "",
    ]),
  )
}

const emptyProfile = () => ({
  first_name: "",
  last_name: "",
  gender: "",
  dob: "",
  phone: "",
  email: "",
  address: "",
})

/** Slim brand bar only - this page is a single-purpose form, not a marketing page. */
function Shell({ children }) {
  const { t } = useLanguage()

  return (
    <main className="setup-page">
      <header className="setup-brand">
        <span className="setup-brand__logo">
          <GraduationCap size={20} />
        </span>
        <span className="setup-brand__name">{t("brand.name")}</span>
      </header>
      {children}
    </main>
  )
}

/** Centred card stage for the compact states (checking, errors, password-only). */
function Stage({ as: Tag = "div", children }) {
  return <Tag className="setup-stage login-form">{children}</Tag>
}

/** One labelled control with inline validation, used across the setup cards. */
function Field({ id, label, icon, error, required = false, full = false, children }) {
  return (
    <label className={`setup-field${full ? " setup-field--full" : ""}`} htmlFor={id}>
      <span className="setup-field__label">
        {label}
        {required && (
          <span aria-hidden="true" className="setup-req">
            *
          </span>
        )}
      </span>
      <span className={`setup-control${error ? " setup-control--invalid" : ""}`}>
        {icon}
        {children}
      </span>
      {error && (
        <span className="setup-field__error" role="alert">
          <AlertCircle size={13} />
          {error}
        </span>
      )}
    </label>
  )
}

function SectionCard({ icon, tone = "indigo", title, hint, children }) {
  return (
    <section className="setup-card">
      <header className="setup-card__head">
        <span className={`setup-card__icon setup-card__icon--${tone}`}>{icon}</span>
        <div>
          <h2 className="setup-card__title">{title}</h2>
          <p className="setup-card__hint">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

export default function SetPassword() {
  const [searchParams] = useSearchParams()
  const { token: pathToken } = useParams()
  const token = searchParams.get("token") ?? pathToken
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [context, setContext] = useState(null)
  const [profile, setProfile] = useState(emptyProfile)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // "checking" | "valid" | "invalid" | "unverified" - seeded from the token so
  // the effect never has to set state synchronously. "unverified" means the
  // link could not be checked at all (offline/5xx), which is retryable.
  const [status, setStatus] = useState(() => (token ? "checking" : "invalid"))
  const [checkedToken, setCheckedToken] = useState(token)
  const [attempt, setAttempt] = useState(0)

  const previewRef = useRef(null)

  // Swapping links must not carry the previous student's typing - or a photo they
  // picked - over to the new account. Done during render (React's documented
  // "adjust state when props change" pattern) so the stale form is never painted.
  if (checkedToken !== token) {
    setCheckedToken(token)
    setContext(null)
    setStatus(token ? "checking" : "invalid")
    setProfile(emptyProfile())
    setImage(null)
    setImagePreview(null)
    setPassword("")
    setConfirmation("")
    setRevealed(false)
    setErrors({})
    setServerError("")
  }

  // Both roles write their own profile and password; the department/class and the
  // codes stay read-only because they are chosen by the school, not the account.
  const isStudent = context?.role === "student"
  const isTeacher = context?.role === "teacher"
  const writesProfile = isStudent || isTeacher

  useEffect(() => {
    if (!token) {
      return
    }

    let isMounted = true

    accountSetupApi
      .validate(token)
      .then((res) => {
        if (!isMounted) return
        if (res && res.valid === false) {
          setStatus("invalid")
          return
        }
        setContext({ role: res?.role ?? null, student: res?.student ?? null, teacher: res?.teacher ?? null })
        setStatus("valid")
      })
      .catch((err) => {
        if (!isMounted) return
        // A spent/expired link is a dead end. Anything else (offline, 5xx) is not,
        // so offer a retry instead of guessing the role and rendering a form the
        // student cannot actually submit.
        setStatus(INVALID_TOKEN_STATUSES.includes(err.status) ? "invalid" : "unverified")
      })

    return () => {
      isMounted = false
    }
  }, [token, attempt])

  // Release the preview object URL when the link changes or the page unmounts, so
  // the previous student's photo is neither leaked nor shown on the next link.
  useEffect(
    () => () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
    },
    [token],
  )

  const updateProfile = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
    }

    if (file) {
      previewRef.current = URL.createObjectURL(file)
      setImagePreview(previewRef.current)
    } else {
      previewRef.current = null
      setImagePreview(null)
    }

    setImage(file)
  }

  const validate = () => {
    const next = {}

    if (writesProfile) {
      const required = [
        ["first_name", "setup.firstNameRequired"],
        ["last_name", "setup.lastNameRequired"],
        ["gender", "setup.genderRequired"],
        ["dob", "setup.dobRequired"],
      ]

      required.forEach(([field, key]) => {
        if (!String(profile[field] ?? "").trim()) {
          next[field] = t(key)
        }
      })

      const email = profile.email.trim()
      if (!email) {
        next.email = t("setup.emailRequired")
      } else if (!EMAIL_PATTERN.test(email)) {
        next.email = t("setup.emailInvalid")
      }

      if (profile.dob && profile.dob > TODAY) {
        next.dob = t("setup.dobFuture")
      }
    }

    if (!password) {
      next.password = t("setpw.passwordRequired")
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = t("setpw.passwordMin")
    }

    if (!confirmation) {
      next.confirmation = t("setpw.confirmRequired")
    } else if (password !== confirmation) {
      next.confirmation = t("setpw.passwordMismatch")
    }

    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    setServerError("")

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const credentials = {
        token,
        password,
        password_confirmation: confirmation,
      }

      if (writesProfile) {
        // Both roles upload a photo with their details, so this stays multipart.
        await accountSetupApi.setPasswordWithProfile({
          ...credentials,
          ...profile,
          image,
        })
      } else {
        await accountSetupApi.setPassword(credentials)
      }

      setSuccess(true)
    } catch (err) {
      if (INVALID_TOKEN_STATUSES.includes(err.status)) {
        setStatus("invalid")
      } else if (err.status === 422) {
        setErrors(fieldErrors(err))
        setServerError(err.message || "")
      } else {
        setServerError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Shell>
        <Stage>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-600/25">
            <CheckCircle2 size={30} />
          </span>
          <h1 className="mt-5 text-center">
            {writesProfile ? t("setpw.completeTitle") : t("setpw.successTitle")}
          </h1>
          <p className="login-form__subtitle text-center">
            {writesProfile
              ? isTeacher
                ? t("setpw.teacherCompleteReady")
                : t("setpw.studentCompleteReady")
              : t("setpw.successReady")}
          </p>
          <button className={primaryButton} type="button" onClick={() => navigate("/login")}>
            {t("setpw.goToLogin")}
          </button>
        </Stage>
      </Shell>
    )
  }

  if (status === "checking") {
    return (
      <Shell>
        <Stage>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Loader2 className="animate-spin" size={28} />
          </span>
          <h1 className="mt-5 text-center">{t("setpw.checkingLink")}</h1>
        </Stage>
      </Shell>
    )
  }

  if (status === "invalid" && !loading) {
    return (
      <Shell>
        <Stage>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-600/25">
            <ShieldAlert size={30} />
          </span>
          <h1 className="mt-5 text-center">{t("setpw.errorInvalidToken")}</h1>
          <p className="login-form__subtitle text-center">{t("setpw.errorContact")}</p>
          <button className={primaryButton} type="button" onClick={() => navigate("/login")}>
            {t("setpw.goToLogin")}
          </button>
        </Stage>
      </Shell>
    )
  }

  if (status === "unverified") {
    return (
      <Shell>
        <Stage>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-600/25">
            <ShieldAlert size={30} />
          </span>
          <h1 className="mt-5 text-center">{t("setpw.errorVerifyTitle")}</h1>
          <p className="login-form__subtitle text-center">{t("setpw.errorVerifyText")}</p>
          <button
            className={primaryButton}
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t("setpw.retry")}
          </button>
        </Stage>
      </Shell>
    )
  }

  if (!writesProfile) {
    return (
      <Shell>
        <form className="setup-stage login-form" onSubmit={handleSubmit}>
          <div className="login-form__title">
            <h1>{t("setpw.title")}</h1>
            <p className="login-form__subtitle">{t("setpw.subtitle")}</p>
          </div>

          {serverError && <div className="alert">{serverError}</div>}

          <label htmlFor="password">{t("setpw.newLabel")}</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("setpw.placeholder")}
              required
              type="password"
              value={password}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs font-bold text-rose-600">{errors.password}</p>
          )}

          <label htmlFor="password_confirmation">{t("setpw.confirmLabel")}</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password_confirmation"
              name="password_confirmation"
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={t("setpw.confirmPlaceholder")}
              required
              type="password"
              value={confirmation}
            />
          </div>
          {errors.confirmation && (
            <p className="mt-1 text-xs font-bold text-rose-600">{errors.confirmation}</p>
          )}

          <button disabled={loading} type="submit">
            {loading ? t("setpw.submitting") : t("setpw.submit")}
          </button>

          <p className="form-note">
            <Link to="/login">{t("auth.login")}</Link>
          </p>
        </form>
      </Shell>
    )
  }

  // The school owns these two: a teacher sees their department, a student their
  // class. Neither can be edited here.
  const assignedRow = isTeacher
    ? [
        [t("lbl.department"), context?.teacher?.department_name],
        [t("lbl.teacherCode"), context?.teacher?.teacher_code],
      ]
    : [
        [t("lbl.class"), context?.student?.class_name],
        [t("lbl.studentCode"), context?.student?.student_code],
      ]

  const strength = passwordStrength(password)
  const passwordType = revealed ? "text" : "password"

  return (
    <Shell>
      <form className="setup-form" noValidate onSubmit={handleSubmit}>
        <header className="setup-head">
          <span className="setup-head__icon">
            <Sparkles size={22} />
          </span>
          <div>
            <h1>{isTeacher ? t("setup.teacherTitle") : t("setup.title")}</h1>
            <p>{isTeacher ? t("setup.teacherSubtitle") : t("setup.subtitle")}</p>
          </div>
        </header>

        {serverError && <div className="alert">{serverError}</div>}

        <div className="setup-layout">
          <aside className="setup-aside">
            <section className="setup-card">
              <span className="setup-tag">
                <BadgeCheck size={14} />
                {t("setup.tagAssigned")}
              </span>

              <div className="setup-meta">
                {assignedRow.map(([label, value]) => (
                  <div className="setup-meta__row" key={label}>
                    <span className="setup-meta__label">{label}</span>
                    <span className="setup-meta__value">{value || "-"}</span>
                  </div>
                ))}
              </div>

              <p className="setup-note">
                <ShieldCheck size={14} />
                {isTeacher ? t("setup.teacherLockedHint") : t("setup.lockedHint")}
              </p>
            </section>

            <section className="setup-card">
              <div className="setup-photo">
                <span className="setup-photo__preview">
                  {imagePreview ? (
                    <img alt={t("setup.photoPreview")} src={imagePreview} />
                  ) : (
                    <UserRound size={30} />
                  )}
                  <span className="setup-photo__badge">
                    <Camera size={14} />
                  </span>
                </span>

                <div className="setup-photo__meta">
                  <span className="setup-field__label">{t("setup.photo")}</span>
                  <p className="setup-photo__name">{image?.name ?? t("setup.photoNone")}</p>
                  <label className="setup-upload">
                    <ImagePlus size={15} />
                    {image ? t("setup.photoChange") : t("setup.photoChoose")}
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      name="image"
                      onChange={handleImageChange}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              {errors.image && (
                <p className="setup-field__error" role="alert">
                  <AlertCircle size={13} />
                  {errors.image}
                </p>
              )}

              <p className="setup-note">{t("setup.photoHint")}</p>
            </section>
          </aside>

          <div className="setup-body">
            <SectionCard
              hint={t("setup.sectionIdentityHint")}
              icon={<IdCard size={17} />}
              title={t("setup.sectionIdentity")}
            >
              <div className="setup-grid">
                <Field
                  error={errors.first_name}
                  icon={<UserRound size={16} />}
                  id="first_name"
                  label={t("lbl.firstName")}
                  required
                >
                  <input
                    autoComplete="given-name"
                    id="first_name"
                    name="first_name"
                    onChange={updateProfile("first_name")}
                    required
                    value={profile.first_name}
                  />
                </Field>

                <Field
                  error={errors.last_name}
                  icon={<UserRound size={16} />}
                  id="last_name"
                  label={t("lbl.lastName")}
                  required
                >
                  <input
                    autoComplete="family-name"
                    id="last_name"
                    name="last_name"
                    onChange={updateProfile("last_name")}
                    required
                    value={profile.last_name}
                  />
                </Field>

                <Field
                  error={errors.gender}
                  icon={<Users size={16} />}
                  id="gender"
                  label={t("lbl.gender")}
                  required
                >
                  <select
                    id="gender"
                    name="gender"
                    onChange={updateProfile("gender")}
                    required
                    value={profile.gender}
                  >
                    <option value="">{t("setup.chooseGender")}</option>
                    <option value="Male">{t("val.male")}</option>
                    <option value="Female">{t("val.female")}</option>
                  </select>
                </Field>

                <Field
                  error={errors.dob}
                  icon={<Cake size={16} />}
                  id="dob"
                  label={t("lbl.dob")}
                  required
                >
                  <input
                    id="dob"
                    max={TODAY}
                    name="dob"
                    onChange={updateProfile("dob")}
                    required
                    type="date"
                    value={profile.dob}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              hint={t("setup.sectionContactHint")}
              icon={<AtSign size={17} />}
              title={t("setup.sectionContact")}
              tone="emerald"
            >
              <div className="setup-grid">
                <Field
                  error={errors.email}
                  icon={<AtSign size={16} />}
                  id="email"
                  label={t("lbl.email")}
                  required
                >
                  <input
                    autoComplete="email"
                    id="email"
                    name="email"
                    onChange={updateProfile("email")}
                    required
                    type="email"
                    value={profile.email}
                  />
                </Field>

                <Field
                  error={errors.phone}
                  icon={<Phone size={16} />}
                  id="phone"
                  label={t("lbl.phone")}
                >
                  <input
                    autoComplete="tel"
                    id="phone"
                    name="phone"
                    onChange={updateProfile("phone")}
                    type="tel"
                    value={profile.phone}
                  />
                </Field>

                <Field full id="address" icon={<MapPin size={16} />} label={t("lbl.address")}>
                  <textarea
                    id="address"
                    name="address"
                    onChange={updateProfile("address")}
                    rows={2}
                    value={profile.address}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              hint={t("setup.sectionSecurityHint")}
              icon={<Lock size={17} />}
              title={t("setup.sectionSecurity")}
              tone="amber"
            >
              <div className="setup-grid">
                <Field
                  error={errors.password}
                  icon={<Lock size={16} />}
                  id="password"
                  label={t("setpw.newLabel")}
                  required
                >
                  <input
                    autoComplete="new-password"
                    id="password"
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("setpw.placeholder")}
                    required
                    type={passwordType}
                    value={password}
                  />
                  <button
                    aria-label={revealed ? t("setup.pwHide") : t("setup.pwShow")}
                    aria-pressed={revealed}
                    className="setup-pw"
                    onClick={() => setRevealed((value) => !value)}
                    type="button"
                  >
                    {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>

                <Field
                  error={errors.confirmation}
                  icon={<Lock size={16} />}
                  id="password_confirmation"
                  label={t("setpw.confirmLabel")}
                  required
                >
                  <input
                    autoComplete="new-password"
                    id="password_confirmation"
                    name="password_confirmation"
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder={t("setpw.confirmPlaceholder")}
                    required
                    type={passwordType}
                    value={confirmation}
                  />
                </Field>
              </div>

              <div className="setup-meter">
                <span className="setup-meter__bars">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      className={`setup-meter__bar${strength >= step ? ` setup-meter__bar--on-${strength}` : ""}`}
                      key={step}
                    />
                  ))}
                </span>
                <span className="setup-meter__text">{t(STRENGTH_KEYS[strength])}</span>
              </div>

              {confirmation && (
                <p
                  className={`setup-match ${
                    password === confirmation ? "setup-match--ok" : "setup-match--no"
                  }`}
                >
                  {password === confirmation ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {password === confirmation ? t("setup.pwMatch") : t("setpw.passwordMismatch")}
                </p>
              )}
            </SectionCard>
          </div>
        </div>

        <div className="setup-actions">
          <button className="setup-submit" disabled={loading} type="submit">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {t("setpw.submitting")}
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                {t("setup.submit")}
              </>
            )}
          </button>

          <p className="form-note">
            <Link to="/login">{t("auth.login")}</Link>
          </p>
        </div>
      </form>
    </Shell>
  )
}