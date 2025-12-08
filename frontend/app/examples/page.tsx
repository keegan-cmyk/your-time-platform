import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const examples = [
  { name: "Lead Intake + Qualification", industry: "Contractors" },
  { name: "5-Step Follow-Up Drip", industry: "Coaching" },
  { name: "Missed Call Text-Back", industry: "All Businesses" },
  { name: "Automated Review Request", industry: "Local Service" },
  { name: "Content Calendar Generator", industry: "Creators" }
];

export default function Examples() {
  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Example Workflows" />
        <div style={{ padding: 40 }}>
          <h2>See What's Possible</h2>
          <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
            {examples.map((w) => (
              <div key={w.name} style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #ddd" }}>
                <h3>{w.name}</h3>
                <p>{w.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
