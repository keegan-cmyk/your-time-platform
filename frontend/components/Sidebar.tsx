import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1 style={{ marginBottom: 24, fontSize: 24 }}>Your Time</h1>

      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/workflows">My Workflows</Link>
        <Link href="/request">Request Workflow</Link>
        <Link href="/examples">Examples</Link>
        <Link href="/onboarding">Onboarding</Link>
        <Link href="/account">Account</Link>
      </nav>
    </div>
  );
}
