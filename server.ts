import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "SafeGuard Fraud Engine" });
  });

  // Mock scoring endpoint
  app.post("/api/score", (req, res) => {
    const { transactions } = req.body;
    
    // Simple deterministic logic mixed with randomness for the demo
    const results = transactions.map((tx: any) => {
      let score = 0;
      if (tx.Amount > 1000) score += 0.4;
      if (tx.Amount > 5000) score += 0.5;
      
      // Random variance
      score += Math.random() * 0.2;
      score = Math.min(score, 0.999);

      return {
        id: tx.id || Math.random().toString(36).substr(2, 9),
        prob: score,
        decision: score > 0.5 ? "REVIEW" : "ALLOW",
        timestamp: new Date().toISOString()
      };
    });

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
