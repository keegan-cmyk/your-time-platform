"use client";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import { api, authHeader } from "../../../lib/api";

export default function WorkflowEditor({ params }: { params: { id: string } }) {
  const { id } = params;
  const [workflow, setWorkflow] = useState(null);

  async function load() {
    const headers = await authHeader();
    const res = await api.get(`/api/workflows`, { headers });
    const wf = res.data.find((w) => w.id === id);
    setWorkflow(wf);
  }

  useEffect(() => {
    load();
  }, []);

  if (!workflow) return <p>Loading...</p>;

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title={workflow.name} />
        <div style={{ padding: 40 }}>
          <h2>Edit Workflow</h2>
          <pre>{JSON.stringify(workflow.json, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
