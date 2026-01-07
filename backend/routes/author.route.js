import express from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getBooksByAuthor,
} from "../controllers/author.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired } from "../middleware/validation.middleware.js";

const authorRouter = express.Router();

authorRouter.get("/", getAllAuthors);
authorRouter.get("/:id", getAuthorById);
authorRouter.get("/:id/books", getBooksByAuthor);

// Protected routes - Admin and Librarian only
authorRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["name"]),
  createAuthor
);
authorRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  updateAuthor
);
authorRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  deleteAuthor
);

export { authorRouter };

