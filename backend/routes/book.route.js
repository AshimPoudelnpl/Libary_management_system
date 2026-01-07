import express from "express";
import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired } from "../middleware/validation.middleware.js";

const bookRouter = express.Router();

bookRouter.get("/", getAllBooks);
bookRouter.get("/:id", getBookById);

// Protected routes - Admin and Librarian only
bookRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["isbn", "title"]),
  addBook
);
bookRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  updateBook
);
bookRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  deleteBook
);

export { bookRouter };