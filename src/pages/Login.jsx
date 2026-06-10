const Login = () => {
  return (
    <main className="login-page">
      <form className="login-form">
        <div>
          <p className="eyebrow">Student Management System</p>
          <h1>Welcome back</h1>
        </div>
        <label>
          Email
          <input placeholder="admin@example.com" type="email" />
        </label>
        <label>
          Password
          <input placeholder="Password" type="password" />
        </label>
        <button type="button">Sign in</button>
        <p className="form-note">Use your school administrator account to continue.</p>
      </form>
    </main>
  )
}

export default Login
