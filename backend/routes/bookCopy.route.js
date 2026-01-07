import express from "express";
import {
  getAllBookCopies,
  getBookCopyById,
  createBookCopy,
  updateBookCopy,
  deleteBookCopy,
  getAvailableCopies,
} from "../controllers/bookCopy.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const bookCopyRouter = express.Router();

bookCopyRouter.get("/", getAllBookCopies);
bookCopyRouter.get("/book/:book_id/available", getAvailableCopies);
bookCopyRouter.get("/:id", getBookCopyById);

// Protected routes - Admin and Librarian only
bookCopyRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  createBookCopy
);
bookCopyRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  updateBookCopy
);
bookCopyRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  deleteBookCopy
);

export { bookCopyRouter };

