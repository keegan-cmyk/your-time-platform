"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const templates = [
  { name: "Lead Qualification Bot", description: "Qualifies inbound leads automatically." },
  { name: "Appointment Setter Bot", description: "Books calls based on customer availability." },
  { name: "Content Generator", description: "Creates posts, emails, and follow-ups." },
  { name: "Customer Follow-Up Engine", description: "Sends automated follow-up sequences." },
  { name: "YouTube Auto Engagement", description: "Responds to comments and increases retention." }
];

export default function Marketplace() {
  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Workflow Marketplace" />
        <div style={{ padding: 40 }}>
          <h2>Available Workflow Templates</h2>
          <p>Select a workflow to request installation or customization.</p>

          <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
            {templates.map((t) => (
              <div key={t.name} style={{ background: "white", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <a
                  href={`/request?template=${encodeURIComponent(t.name)}`}
                  style={{ marginTop: 10, display: "inline-block", color: "#2563eb" }}
                >
                  Request This Workflow →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
