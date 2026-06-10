const Settings = () => {
  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <h2>Settings</h2>
          <p>Update school profile, academic year, and account preferences.</p>
        </div>
        <button className="primary-button" type="button">Save Changes</button>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h2>School Profile</h2>
          <div className="form-grid">
            <label>
              School Name
              <input defaultValue="Bright Future High School" />
            </label>
            <label>
              Academic Year
              <input defaultValue="2026" />
            </label>
            <label>
              Email
              <input defaultValue="admin@brightfuture.edu" type="email" />
            </label>
            <label>
              Phone
              <input defaultValue="+855 12 345 678" />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2>Preferences</h2>
          <div className="setting-list">
            <label className="setting-row">
              <span>
                Email Notifications
                <small>Send daily summaries to administrators.</small>
              </span>
              <input defaultChecked type="checkbox" />
            </label>
            <label className="setting-row">
              <span>
                Attendance Alerts
                <small>Flag repeated absences automatically.</small>
              </span>
              <input defaultChecked type="checkbox" />
            </label>
            <label className="setting-row">
              <span>
                Score Review
                <small>Show students below class target.</small>
              </span>
              <input type="checkbox" />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
