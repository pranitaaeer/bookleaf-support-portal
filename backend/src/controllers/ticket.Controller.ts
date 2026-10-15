
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Book from "../models/Book.model.js";
import Ticket from "../models/Ticket.model.js";
import TicketMessage from "../models/TicketMessage.model.js";

// POST /api/tickets
export async function createTicket(req: Request, res: Response) {
  try {
    const authorId = req.user?.id;
    const { bookId, subject, description, attachmentName } = req.body;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required.",
      });
    }

    if (subject.trim().length > 200 || description.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Subject or description exceeds the allowed length.",
      });
    }

    let validBookId: mongoose.Types.ObjectId | null = null;

    if (bookId) {
      if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID.",
        });
      }

      const book = await Book.findOne({
        _id: bookId,
        author: authorId,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found in your account.",
        });
      }

      validBookId = book._id;
    }

    const ticket = await Ticket.create({
      author: authorId,
      book: validBookId,
      subject: subject.trim(),
      description: description.trim(),
      attachmentName:
        typeof attachmentName === "string"
          ? attachmentName.trim()
          : undefined,
      category: "General Inquiry",
      priority: "Medium",
      status: "Open",
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      data: ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the ticket right now.",
    });
  }
}

// GET /api/tickets/my-tickets
export async function getMyTickets(req: Request, res: Response) {
  try {
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const tickets = await Ticket.find({ author: authorId })
      .populate("book", "title isbn")
      .select(
        "subject description category priority status createdAt updatedAt book"
      )
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Get author tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tickets right now.",
    });
  }
}

// GET /api/tickets/:ticketId
export async function getMyTicketById(req: Request, res: Response) {
  try {
    const authorId = req.user?.id;
    const { ticketId } = req.params;

    if (!authorId) {
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

    // Author can access only their own ticket.
    const ticket = await Ticket.findOne({
      _id: ticketId,
      author: authorId,
    })
      .populate("book", "title isbn")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    // Never expose internal admin notes/messages to authors.
    const messages = await TicketMessage.find({
      ticket: ticketId,
      isInternal: false,
    })
      .select("senderRole message createdAt editedAt")
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
    console.error("Get ticket details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch ticket details right now.",
    });
  }
}
