
import express from "express";
import {
  getAllTickets,
  getAdminTicketById,
  updateTicket,
  addInternalNote,
  sendTicketReply,
  getAdminTicketMessages,
  getAdminTicketNotes,
} from "../controllers/admin.Controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.Middleware.js";
import { generateTicketAIDraft } from "../controllers/admin.Controller.js";

const router = express.Router();

// Every route in this file requires an admin account.
router.use(authenticate, authorize("admin"));

router.get("/tickets", getAllTickets);
router.get("/tickets/:ticketId", getAdminTicketById);
router.get("/tickets/:ticketId/messages",getAdminTicketMessages);
router.get("/tickets/:ticketId/notes",getAdminTicketNotes);
router.patch("/tickets/:ticketId", updateTicket);
router.post("/tickets/:ticketId/notes", addInternalNote);
router.post("/tickets/:ticketId/reply", sendTicketReply);
router.post("/tickets/:ticketId/ai-draft",generateTicketAIDraft);
export default router;
