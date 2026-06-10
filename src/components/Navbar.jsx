const Navbar = ({ activePage }) => {
  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Student Management System</p>
        <h1>{activePage}</h1>
      </div>
      <div className="navbar__profile" aria-label="Signed in user">
        <span>Admin</span>
        <div className="avatar">A</div>
      </div>
    </header>
  )
}

export default Navbar
