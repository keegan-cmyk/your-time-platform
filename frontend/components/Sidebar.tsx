import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1 style={{ marginBottom: 24, fontSize: 24 }}>Your Time</h1>

      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/workflows">Workflows</Link>
        <Link href="/account">Account</Link>
      </nav>
    </div>
  );
}
