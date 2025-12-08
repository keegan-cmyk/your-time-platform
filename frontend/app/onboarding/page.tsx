import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function Onboarding() {
  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Welcome to Your Time" />
        <div style={{ padding: 40 }}>
          <h2>Get Started</h2>
          <p>Follow this quick setup checklist to begin using automation:</p>

          <ul style={{ marginTop: 20, lineHeight: 2 }}>
            <li>Create your first workflow request</li>
            <li>Visit the Workflow Marketplace</li>
            <li>Connect your CRM (coming soon)</li>
            <li>Review example workflows</li>
            <li>Schedule a workflow planning call</li>
          </ul>
        </div>
      </div>
    </>
  );
}
