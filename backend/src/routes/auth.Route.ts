import express from "express"
import {
  registerAuthor,
  login,
  registerAdmin,
  getMyInfo,
  logout,
} from "../controllers/auth.Controller.js";
import { authenticate } from "../middleware/auth.Middleware.js";

const router=express.Router()

router.post("/register", registerAuthor);
router.post("/login", login);
router.post("/register-admin", registerAdmin);
router.get("/me", authenticate, getMyInfo);
router.post("/logout", logout);
export default router