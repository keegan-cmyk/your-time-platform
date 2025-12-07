import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Dashboard" />
        <div style={{ padding: 40 }}>
          <h1>Welcome to Your Time</h1>
          <p>Your automation control center.</p>
        </div>
      </div>
    </>
  );
}
