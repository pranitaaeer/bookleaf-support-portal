import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import ConnectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

ConnectDB()

const allowedOrigins = [
  "http://localhost:5173",
  "https://bookleaf-support-portal-sigma.vercel.app",
  "https://bookleaf-support-portal-git-main-pranitaaeers-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "BookLeaf Support Portal API is running",
  });
});

import authRouter from "./routes/auth.Route.js"
import bookRouter from "./routes/book.Route.js"
import ticketRouter from "./routes/ticket.Route.js"
import adminRoutes from "./routes/admin.Route.js";

app.use("/api/auth",authRouter)
app.use("/api/book",bookRouter)
app.use("/api/ticket",ticketRouter)
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});