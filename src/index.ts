import express from "express";
import type { Request, Response } from "express";

// Create Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Classroom backend" });
});

// Port configuration (default 8000)
const port = Number(process.env.PORT) || 8000;

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

