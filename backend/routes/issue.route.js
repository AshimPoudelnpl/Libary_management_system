import express from "express";
import {
  issueBook,
  returnBook,
  getAllIssuedBooks,
  getIssueById,
  getIssuesByUser,
} from "../controllers/issue.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired } from "../middleware/validation.middleware.js";

const issueRouter = express.Router();

// Protected routes
issueRouter.get("/", authenticate, getAllIssuedBooks);
issueRouter.get("/user/:user_id", authenticate, getIssuesByUser);
issueRouter.get("/:id", authenticate, getIssueById);
issueRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["user_id", "copy_id", "due_date"]),
  issueBook
);
issueRouter.put(
  "/:id/return",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  returnBook
);

export { issueRouter };