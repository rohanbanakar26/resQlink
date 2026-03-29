function StatusPill({ status }) {
  return <span className={`status-pill ${String(status).toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>;
}

export default StatusPill;
