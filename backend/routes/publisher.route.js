import express from "express";
import {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getBooksByPublisher,
} from "../controllers/publisher.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired } from "../middleware/validation.middleware.js";

const publisherRouter = express.Router();

publisherRouter.get("/", getAllPublishers);
publisherRouter.get("/:id", getPublisherById);
publisherRouter.get("/:id/books", getBooksByPublisher);

// Protected routes - Admin and Librarian only
publisherRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["name"]),
  createPublisher
);
publisherRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  updatePublisher
);
publisherRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  deletePublisher
);

export { publisherRouter };

