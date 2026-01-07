import express from "express";
import {
  getAllFines,
  getFineById,
  createFine,
  updateFine,
  payFine,
  getFinesByUser,
  calculateFineForIssue,
} from "../controllers/fine.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const fineRouter = express.Router();

// Protected routes
fineRouter.get("/", authenticate, getAllFines);
fineRouter.get("/user/:user_id", authenticate, getFinesByUser);
fineRouter.get("/:id", authenticate, getFineById);
fineRouter.post("/", authenticate, authorize("ADMIN", "LIBRARIAN"), createFine);
fineRouter.post("/calculate/:issue_id", authenticate, authorize("ADMIN", "LIBRARIAN"), calculateFineForIssue);
fineRouter.put("/:id", authenticate, authorize("ADMIN", "LIBRARIAN"), updateFine);
fineRouter.put("/:id/pay", authenticate, payFine);

export { fineRouter };

