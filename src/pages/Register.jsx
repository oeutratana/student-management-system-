import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CheckCircle2, GraduationCap, Lock, Mail, UserRound } from "lucide-react"
import { authApi } from "../services/schoolApi"

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await authApi.register(form)
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
          Technology School
        </div>

        <div className="login-brand__body">
          <h2>Create your school workspace first.</h2>
          <p>
            Register an administrator account, then sign in to manage students,
            teachers, classes, attendance and payments.
          </p>

          <div className="login-brand__points">
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Start with a secure administrator profile
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Connect staff, students and class records
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Sign in after registration to open the dashboard
            </span>
          </div>
        </div>

        <p className="login-brand__bottom">
          © {new Date().getFullYear()} Technology School. Admin tools for school operations.
        </p>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__title">
            <h1>Register</h1>
            <p className="login-form__subtitle">Create your administrator account first.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <label htmlFor="name">Name</label>
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

          <label htmlFor="email">Email</label>
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

          <label htmlFor="password">Password</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="Password"
              required
              type="password"
              value={form.password}
            />
          </div>

          <label htmlFor="password_confirmation">Confirm Password</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="new-password"
              id="password_confirmation"
              name="password_confirmation"
              onChange={handleChange}
              placeholder="Confirm password"
              required
              type="password"
              value={form.password_confirmation}
            />
          </div>

          <button disabled={loading} type="submit">
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="form-note">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Register
