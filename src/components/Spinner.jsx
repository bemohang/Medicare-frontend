export default function Spinner({ fullPage = false, text = "Loading..." }) {
  if (fullPage) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--off-white)", gap: 16, zIndex: 999,
      }}>
        <div className="spinner" />
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{text}</p>
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
