const reports = [
  { title: 'Monthly Attendance', type: 'Attendance', updated: 'May 31, 2026' },
  { title: 'Midterm Score Summary', type: 'Scores', updated: 'May 28, 2026' },
  { title: 'Enrollment Overview', type: 'Students', updated: 'May 25, 2026' },
]

const Reports = () => {
  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <h2>Reports</h2>
          <p>Generate and review school performance reports.</p>
        </div>
        <button className="primary-button" type="button">Create Report</button>
      </div>

      <section className="panel">
        <div className="report-list">
          {reports.map((report) => (
            <article className="report-item" key={report.title}>
              <div>
                <h3>{report.title}</h3>
                <p>{report.type} report</p>
              </div>
              <span>{report.updated}</span>
              <button className="secondary-button" type="button">View</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Reports
