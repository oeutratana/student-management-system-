const attendanceData = [
  { day: 'Mon', value: 92 },
  { day: 'Tue', value: 88 },
  { day: 'Wed', value: 95 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 94 },
]

const AttendanceChartWidget = () => {
  return (
    <div className="attendance-chart" aria-label="Weekly attendance chart">
      {attendanceData.map((item) => (
        <div className="attendance-chart__bar" key={item.day}>
          <span style={{ height: `${item.value}%` }} />
          <small>{item.day}</small>
        </div>
      ))}
    </div>
  )
}

export default AttendanceChartWidget
