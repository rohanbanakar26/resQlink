function StatusPill({ value }) {
  return <span className={`status-pill status-${value}`}>{value}</span>;
}

export default StatusPill;
