"use client";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";

export default function AccountPage() {
  const [email, setEmail] = useState("");

  async function load() {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    setEmail(user?.email || "");
  }

  load();

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Account" />
        <div style={{ padding: 40 }}>
          <h2>Account Details</h2>
          <p>Email: {email}</p>
        </div>
      </div>
    </>
  );
}
