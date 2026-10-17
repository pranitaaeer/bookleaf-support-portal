import type { Request, Response } from "express";
import mongoose from "mongoose";
import Book from "../models/Book.model.js";
import Ticket from "../models/Ticket.model.js";
import TicketMessage from "../models/TicketMessage.model.js";
import { classifyTicket } from "../services/aiService.js";
import Author from "../models/Author.model.js";
import { UTFile } from "uploadthing/server";
import { utapi } from "../services/uploadthing.js";

// POST /api/tickets
export async function createTicket(req: Request, res: Response) {
  let uploadedAttachmentKey: string | null = null;

  try {
    const authorId = req.user?.id;
    const { bookId, subject, description } = req.body;
    const file = req.file;

    // 1. Authentication
    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const author = await Author.findById(authorId);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: `Author ${authorId} not found.`,
      });
    }

    // 2. Validate subject and description
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

    if (
      subject.trim().length > 200 ||
      description.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject or description exceeds the allowed length.",
      });
    }

    // 3. Validate book ownership
    let validBookObjectId = null;

    if (bookId !== undefined && bookId !== null && bookId !== "") {
      if (typeof bookId !== "string" || !bookId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID.",
        });
      }

      // Example: BK015 is the business ID, not MongoDB _id.
      const book = await Book.findOne({
        bookId: bookId.trim(),
        author: author._id,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found in your account.",
        });
      }

      validBookObjectId = book._id;
    }

    // 4. Upload attachment to UploadThing
    let uploadedAttachment: {
      name: string;
      key: string;
      url: string;
      size: number;
      mimeType: string;
    } | null = null;

    if (file) {
      const utFile = new UTFile(
        [new Uint8Array(file.buffer)],
        file.originalname,
        { type: file.mimetype }
      );

      const uploadResult = await utapi.uploadFiles(utFile);

      const result = Array.isArray(uploadResult)
        ? uploadResult[0]
        : uploadResult;

      if (result.error || !result.data) {
        console.error(
          "UploadThing upload failed:",
          result.error
        );

        return res.status(502).json({
          success: false,
          message: "Attachment upload failed. Please try again.",
        });
      }

      uploadedAttachmentKey = result.data.key;

      uploadedAttachment = {
        name: result.data.name,
        key: result.data.key,
        url: result.data.url,
        size: result.data.size,
        mimeType: file.mimetype,
      };
    }

    // 5. AI classification
    const aiResult = await classifyTicket(
      subject.trim(),
      description.trim()
    );

    // 6. Create ticket in MongoDB
    const ticket = await Ticket.create({
      author: author._id,
      book: validBookObjectId,
      subject: subject.trim(),
      description: description.trim(),

      attachmentName: uploadedAttachment?.name,
      attachmentUrl: uploadedAttachment?.url,
      attachmentKey: uploadedAttachment?.key,
      attachmentMimeType: uploadedAttachment?.mimeType,
      attachmentSize: uploadedAttachment?.size,

      category: aiResult?.category ?? "General Inquiry",
      aiSuggestedCategory: aiResult?.category ?? null,
      categoryOverridden: false,

      priority: aiResult?.priority ?? "Medium",
      aiSuggestedPriority: aiResult?.priority ?? null,
      priorityOverridden: false,

      status: "Open",
    });

    // Ticket is saved; no upload cleanup is needed.
    uploadedAttachmentKey = null;

    return res.status(201).json({
      success: true,
      message: aiResult
        ? "Ticket created and classified by AI."
        : "Ticket created. AI classification is temporarily unavailable.",
      data: ticket,
      ai: {
        available: Boolean(aiResult),
        reason: aiResult?.reason ?? null,
      },
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    // Clean up the uploaded file if ticket creation failed.
    if (uploadedAttachmentKey) {
      try {
        await utapi.deleteFiles(uploadedAttachmentKey);
      } catch (cleanupError) {
        console.error(
          "UploadThing cleanup failed:",
          cleanupError
        );
      }
    }

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
        "subject description category priority status createdAt updatedAt book",
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
// export async function getMyTicketById(req: Request, res: Response) {
//   try {
//     const authorId = req.user?.id;
//     const { ticketId } = req.params;

//     if (!authorId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required.",
//       });
//     }

//     if (!mongoose.isValidObjectId(ticketId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ticket ID.",
//       });
//     }

//     // Author can access only their own ticket.
//     const ticket = await Ticket.findOne({
//       _id: ticketId,
//       author: authorId,
//     })
//       .populate("book", "title isbn")
//       .lean();

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found.",
//       });
//     }

//     // Never expose internal admin notes/messages to authors.
//     const messages = await TicketMessage.find({
//       ticket: ticketId,
//       isInternal: false,
//     })
//       .select("senderRole message createdAt editedAt")
//       .sort({ createdAt: 1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       data: {
//         ...ticket,
//         messages,
//       },
//     });
//   } catch (error) {
//     console.error("Get ticket details error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch ticket details right now.",
//     });
//   }
// }

// GET /api/tickets/:ticketId

export async function getMyTicketById(req: Request, res: Response) {
  try {
    const authorId = req.user?.id;
    const ticketId = req.params.ticketId;
 
    
    // 👇 YE BHI ADD KAREIN
    const directTicket = await Ticket.findById(ticketId);
    
    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Check valid ObjectId
    if (typeof ticketId !== "string" || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    // Author can access only their own ticket.
    // Hum explicitly ObjectId use kar rahe hain taaki matching fail na ho.
    const ticket = await Ticket.findOne({
      _id: new mongoose.Types.ObjectId(ticketId),
      author: new mongoose.Types.ObjectId(authorId),
    })
      .populate("book", "title isbn")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or you don't have access.",
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
