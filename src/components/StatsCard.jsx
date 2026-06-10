const StatsCard = ({ label, value, note }) => {
  return (
    <article className="stats-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  )
}

export default StatsCard
