import AgentAPI from "apminsight";
AgentAPI.config();


import express from "express";
import type {Request, Response} from "express";
import subjectsRouter from './routes/subjects.js'
import cors from "cors";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";

// Create Express app
const app = express();

if (!process.env.FRONTEND_URL) throw new Error('FRONTEND_URL is not set in .env file');


app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

// Middleware to parse JSON
app.use(express.json());
app.use(securityMiddleware)

app.use("/api/subjects", subjectsRouter);
// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({message: "Hello from Classroom backend"});
});

// Port configuration (default 8000)
const port = Number(process.env.PORT) || 8000;

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

