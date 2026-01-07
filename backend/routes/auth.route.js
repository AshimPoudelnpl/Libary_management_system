import express from "express";
import {
  login,
  register,
  logout,
  getDashboardStats,
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired, validateEmail } from "../middleware/validation.middleware.js";

const authRouter = express.Router();

authRouter.post(
  "/login",
  validateRequired(["email", "password"]),
  validateEmail,
  login
);
authRouter.post(
  "/register",
  validateRequired(["name", "email", "password"]),
  validateEmail,
  register
);
authRouter.post("/logout", logout);
authRouter.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  getDashboardStats
);

export default authRouter;