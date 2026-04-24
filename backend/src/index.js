import cors from "cors";
import express from "express";

import { getIdentity } from "./config.js";
import { processHierarchyEntries } from "./hierarchy.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/bfhl", (req, res) => {
  const { data } = req.body ?? {};

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "Request body must include a data array.",
    });
  }

  const processed = processHierarchyEntries(data);

  return res.json({
    ...getIdentity(),
    ...processed,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Something went wrong while processing the request.",
  });
});

app.listen(port, () => {
  console.log(`SRM assignment API running on http://localhost:${port}`);
});

