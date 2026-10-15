import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

ConnectDB()
app.use(cors());
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