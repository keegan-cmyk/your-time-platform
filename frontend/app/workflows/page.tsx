"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import useSWR from "swr";
import { api, authHeader } from "../../lib/api";

async function fetchWorkflows() {
  const headers = await authHeader();
  const res = await api.get("/api/workflows", { headers });
  return res.data;
}

export default function Workflows() {
  const { data, error } = useSWR("workflows", fetchWorkflows);

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Workflows" />

        <div style={{ padding: 40 }}>
          <h2>Your Workflows</h2>

          {!data && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>Failed to load workflows.</p>}

          {data?.length === 0 && <p>No workflows yet.</p>}

          <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
            {data?.map((w) => (
              <div
                key={w.id}
                style={{
                  background: "white",
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              >
                <h3>{w.name}</h3>
                <p>{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
