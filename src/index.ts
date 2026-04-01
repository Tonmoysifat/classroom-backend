import express from "express";
import type {Request, Response} from "express";
import subjectsRouter from './routes/subjects'
import cors from "cors";

// Create Express app
const app = express();

if (!process.env.FRONTEND_URL) throw new Error('FRONTEND_URL is not set in .env file');


app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}))
// Middleware to parse JSON
app.use(express.json());

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

