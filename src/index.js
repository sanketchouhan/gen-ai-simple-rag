import express from "express";
import { query } from "./rag/query.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/query", async (req, res) => {
  const userQuery = req.body?.q;
  if (typeof userQuery !== "string" || !userQuery.trim()) {
    res.status(400).json({ error: "Provide a non-empty q field in the JSON body." });
    return;
  }

  try {
    const answer = await query(userQuery.trim());
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Query endpoint failed:", error);
    res.status(500).json({ error: "Unable to process the query." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
