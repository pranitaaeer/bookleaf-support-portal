import express from "express"
import {
  registerAuthor,
  login,
} from "../controllers/auth.Controller.js";

const router=express.Router()

router.post("/register", registerAuthor);
router.post("/login", login);

export default router