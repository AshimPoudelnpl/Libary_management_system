import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
} from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateRequired } from "../middleware/validation.middleware.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.get("/:id/books", getBooksByCategory);

// Protected routes - Admin and Librarian only
categoryRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  validateRequired(["category_name"]),
  createCategory
);
categoryRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  updateCategory
);
categoryRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "LIBRARIAN"),
  deleteCategory
);

export { categoryRouter };

