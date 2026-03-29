function EmergencyFAB({ busy, onPress }) {
  return (
    <button className={`emergency-fab ${busy ? "busy" : ""}`} disabled={busy} onClick={onPress} type="button">
      {busy ? "Sending..." : "🚨 Report Emergency"}
    </button>
  );
}

export default EmergencyFAB;
