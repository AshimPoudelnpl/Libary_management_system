import express from "express";
import {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired, validateEmail, validateRole } from "../middleware/validation.middleware.js";

const userRouter = express.Router();

// Protected routes
userRouter.get("/", authenticate, authorize("ADMIN", "LIBRARIAN"), getAllUsers);
userRouter.get("/:id", authenticate, getUserById);
userRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["name", "email"]),
  validateEmail,
  validateRole,
  addUser
);
userRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateEmail,
  validateRole,
  updateUser
);
userRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteUser
);

export { userRouter };