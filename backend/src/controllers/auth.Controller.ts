
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Author from "../models/Author.model.js";
import User from "../models/Admin.model.js";
import {createToken} from "../utils/authfun.js"


// POST /api/auth/register
export async function registerAuthor(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const existingAuthor = await Author.findOne({
      email: normalizedEmail,
    });

    if (existingAuthor) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const authorId = `AUTH-${crypto.randomUUID()}`;

    const author = await Author.create({
      authorId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = createToken(author.id, "author");

    return res.status(201).json({
      success: true,
      message: "Author account created successfully.",
      token,
      user: {
        id: author.id,
        authorId: author.authorId,
        name: author.name,
        email: author.email,
        role: "author",
      },
    });
  } catch (error) {
    console.error("Author registration error:", error);

    // Handle duplicate email/authorId conflicts.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or ID already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create the account right now.",
    });
  }
}


// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try author login first.
    const author = await Author.findOne({
      email: normalizedEmail,
      isActive: true,
    }).select("+passwordHash");

    if (author) {
      const passwordMatches = await bcrypt.compare(
        password,
        author.passwordHash
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = createToken(author.id, "author");

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: author.id,
          name: author.name,
          email: author.email,
          role: "author",
        },
      });
    }

    // If no author account exists, try the admin collection.
    const admin = await User.findOne({
      email: normalizedEmail,
      isActive: true,
      role: "admin",
    }).select("+passwordHash");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = createToken(admin.id, "admin");

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
}
