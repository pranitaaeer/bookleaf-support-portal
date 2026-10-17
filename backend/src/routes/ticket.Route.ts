
import express from "express";
import {
  createTicket,
  getMyTickets,
  getMyTicketById,
} from "../controllers/ticket.Controller.js";
import { authenticate } from "../middleware/auth.Middleware.js";
import upload from "../middleware/multer.Middleware.js";

const router = express.Router();

router.post("/", authenticate, upload.single("attachment"),createTicket);
router.get("/my-tickets", authenticate, getMyTickets);
router.get("/:ticketId", authenticate, getMyTicketById);

export default router;
