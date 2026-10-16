import express from "express"
import {
  registerAuthor,
  login,
  registerAdmin,
} from "../controllers/auth.Controller.js";

const router=express.Router()

router.post("/register", registerAuthor);
router.post("/login", login);
router.post("/register-admin", registerAdmin);
export default router