"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RequestWorkflow() {
  const params = useSearchParams();
  const template = params.get("template") || "";

  const [business, setBusiness] = useState("");
  const [details, setDetails] = useState("");

  function submit() {
    alert("Workflow request submitted. Your team will review it.");
  }

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Request Workflow" />
        <div style={{ padding: 40 }}>
          <h2>Request This Workflow</h2>
          {template && <p>Template Selected: <strong>{template}</strong></p>}

          <div style={{ marginTop: 20 }}>
            <label>Business Type</label>
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              style={{ display: "block", width: "100%", padding: 12, marginTop: 8 }}
              placeholder="e.g., Real Estate, Roofing, Coaching"
            />

            <label style={{ marginTop: 20 }}>Workflow Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ display: "block", width: "100%", padding: 12, marginTop: 8, height: 160 }}
              placeholder="Explain what automation you want…"
            />

            <button
              onClick={submit}
              style={{ marginTop: 20, padding: "12px 20px", background: "#2563eb", color: "white", borderRadius: 6 }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
