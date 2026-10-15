
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Ticket from "../models/Ticket.model.js";
import TicketMessage from "../models/TicketMessage.model.js";
import { generateTicketDraft } from "../services/aiService.js";

// GET /api/admin/tickets
export async function getAllTickets(req: Request, res: Response) {
  try {
    const {
      status,
      category,
      priority,
      from,
      to,
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    if (from || to) {
      const createdAt: Record<string, Date> = {};

      if (typeof from === "string") {
        const startDate = new Date(from);
        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }
        createdAt.$gte = startDate;
      }

      if (typeof to === "string") {
        const endDate = new Date(to);
        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }
        endDate.setHours(23, 59, 59, 999);
        createdAt.$lte = endDate;
      }

      filter.createdAt = createdAt;
    }

    const tickets = await Ticket.find(filter)
      .populate("author", "name email")
      .populate("book", "title isbn")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Get all tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tickets right now.",
    });
  }
}

// GET /api/admin/tickets/:ticketId
export async function getAdminTicketById(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const ticket = await Ticket.findById(ticketId)
      .populate("author", "name email phone")
      .populate("book", "title isbn genre status")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const messages = await TicketMessage.find({ ticket: ticketId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...ticket,
        messages,
      },
    });
  } catch (error) {
    console.error("Get admin ticket details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ticket details right now.",
    });
  }
}

// PATCH /api/admin/tickets/:ticketId
export async function updateTicket(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const {
      status,
      priority,
      category,
      assignedAdmin,
    } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    const allowedCategories = [
      "Royalty & Payments",
      "ISBN & Metadata Issues",
      "Printing & Quality",
      "Distribution & Availability",
      "Book Status & Production Updates",
      "General Inquiry",
    ];

    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket status.",
        });
      }

      updates.status = status;
      if (status === "Resolved") updates.resolvedAt = new Date();
      else updates.resolvedAt = null;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket priority.",
        });
      }

      updates.priority = priority;
      updates.priorityOverridden = true;
    }

    if (category !== undefined) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket category.",
        });
      }

      updates.category = category;
      updates.categoryOverridden = true;
    }

    if (assignedAdmin !== undefined) {
      if (
        assignedAdmin !== null &&
        (typeof assignedAdmin !== "string" || !assignedAdmin.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid admin assignment.",
        });
      }

      updates.assignedAdmin =
        typeof assignedAdmin === "string"
          ? assignedAdmin.trim()
          : null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      data: ticket,
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update ticket right now.",
    });
  }
}

// POST /api/admin/tickets/:ticketId/notes
export async function addInternalNote(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const { note } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (typeof note !== "string" || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Internal note is required.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          internalNotes: {
            adminId,
            note: note.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Internal note added.",
      data: ticket.internalNotes,
    });
  } catch (error) {
    console.error("Add internal note error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add the note right now.",
    });
  }
}

// POST /api/admin/tickets/:ticketId/reply
export async function sendTicketReply(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const adminId = req.user?.id;
 
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "A reply of up to 10,000 characters is required.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const reply = await TicketMessage.create({
      ticket: ticket._id,
      senderRole: "admin",
      senderAdminId: adminId,
      message: message.trim(),
      isInternal: false,
    });

    if (ticket.status === "Open") {
      ticket.status = "In Progress";
      await ticket.save();
    }

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully.",
      data: reply,
    });
  } catch (error) {
    console.error("Send ticket reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send the reply right now.",
    });
  }
}

export async function generateTicketAIDraft(
  req: Request,
  res: Response
) {
  try {
    const { ticketId } = req.params;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const ticket = await Ticket.findById(ticketId).populate(
      "book",
      "title status"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const book = ticket.book as unknown as
      | { title?: string; status?: string }
      | null;

    const draft = await generateTicketDraft({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      bookTitle: book?.title,
      bookStatus: book?.status,
    });

    if (!draft) {
      return res.status(503).json({
        success: false,
        message:
          "AI draft generation is temporarily unavailable. Please try again.",
      });
    }

    ticket.aiDraftResponse = draft;
    ticket.aiDraftGeneratedAt = new Date();
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "AI reply draft generated successfully.",
      data: {
        draft,
        generatedAt: ticket.aiDraftGeneratedAt,
      },
    });
  } catch (error) {
    console.error("Generate AI draft error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate an AI draft right now.",
    });
  }
}