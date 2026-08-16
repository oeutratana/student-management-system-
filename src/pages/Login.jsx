import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, GraduationCap, Lock, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
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
          Technology School
        </div>

        <div className="login-brand__body">
          <h2>Run your school smoothly, all in one place.</h2>
          <p>
            Manage students, teachers, classes, attendance and fees from a single
            modern dashboard built for school administrators.
          </p>

          <div className="login-brand__points">
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Real-time attendance and academic tracking
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Fees and payment management made easy
            </span>
            <span className="login-brand__point">
              <CheckCircle2 size={18} />
              Secure role-based access for your staff
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
            <h1>Welcome back</h1>
            <p className="login-form__subtitle">Sign in to your administrator account.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <label htmlFor="email">Email</label>
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

          <label htmlFor="password">Password</label>
          <div className="login-form__field">
            <Lock size={16} />
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </div>

          <button disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="form-note">Use your school administrator account to continue.</p>
        </form>
      </section>
    </main>
  )
}

export default Login
