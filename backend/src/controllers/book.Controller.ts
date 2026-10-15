
import type { Request, Response } from "express";
import Book from "../models/Book.model.js";
import mongoose from "mongoose";

// GET /api/books/my-books
export async function getMyBooks(req: Request, res: Response) {
  try {
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const books = await Book.find({ author: authorId })
      .select(
        "title isbn genre publicationDate status mrp totalCopiesSold totalRoyaltyEarned royaltyPaid royaltyPending distributionDetails"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Get author books error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch books right now.",
    });
  }
}

// GET /api/books/:bookId
export async function getBookById(req: Request, res: Response) {
  try {
    // const authorId = req.user?.id;
    const authorId = req.user?.id;
    const { bookId } = req.params;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

   if (typeof bookId !== "string" || !bookId.trim()) {
  return res.status(400).json({
    success: false,
    message: "A valid book ID is required.",
  });
}

    const query = mongoose.isValidObjectId(bookId)
      ? { _id: bookId, author: authorId }
      : { bookId, author: authorId };

    const book = await Book.findOne(query).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get book details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch book details right now.",
    });
  }
}
