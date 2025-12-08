
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Backend API is running" });
});

app.get("/api/health", (_, res) => {
  res.json({
    status: "ok",
    backend: true,
    supabase_connected: Boolean(process.env.SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
});

app.post("/api/workflow-request", authenticate, (req, res) => {
  console.log("Workflow Request:", req.body);
  res.json({ success: true });
});

app.listen(4000, () => console.log("API running on port 4000"));
