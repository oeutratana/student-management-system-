import { BarChart3, ClipboardList, FileText, Plus, Users } from "lucide-react"

const reports = [
  { title: 'Monthly Attendance', type: 'Attendance', updated: 'May 31, 2026', icon: ClipboardList },
  { title: 'Midterm Score Summary', type: 'Scores', updated: 'May 28, 2026', icon: BarChart3 },
  { title: 'Enrollment Overview', type: 'Students', updated: 'May 25, 2026', icon: Users },
]

const Reports = () => {
  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div>
          <h2>Reports</h2>
          <p>Generate and review school performance reports.</p>
        </div>
        <button className="primary-button icon-button" type="button">
          <Plus size={18} />
          Create Report
        </button>
      </div>

      <section className="panel">
        <div className="report-list">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <article className="report-item" key={report.title}>
                <div className="report-item__main">
                  <span className="report-item__icon">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3>{report.title}</h3>
                    <p>{report.type} report</p>
                  </div>
                </div>
                <div className="report-item__meta">
                  <span>Updated</span>
                  <small>{report.updated}</small>
                </div>
                <button className="secondary-button" type="button">
                  <FileText size={16} />
                  View
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Reports
