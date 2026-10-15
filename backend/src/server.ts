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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});