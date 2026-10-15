import express from "express"
import {
  getBookById,getMyBooks
} from "../controllers/book.Controller.js";
import { authenticate } from "../middleware/auth.Middleware.js";

const router=express.Router()

router.post("/get-books",authenticate, getMyBooks);
router.post("/get-book/:bookId", authenticate,getBookById);

export default router