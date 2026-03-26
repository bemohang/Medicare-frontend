export default function StatsCard({ value, label, color = "teal" }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
