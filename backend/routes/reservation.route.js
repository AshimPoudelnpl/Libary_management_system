import express from "express";
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  completeReservation,
  getReservationsByUser,
  getReservationsByBook,
} from "../controllers/reservation.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const reservationRouter = express.Router();

// Public routes (with optional auth)
reservationRouter.get("/", getAllReservations);
reservationRouter.get("/book/:book_id", getReservationsByBook);
reservationRouter.get("/:id", getReservationById);

// Protected routes
reservationRouter.get("/user/:user_id", authenticate, getReservationsByUser);
reservationRouter.post("/", authenticate, createReservation);
reservationRouter.put("/:id", authenticate, authorize("ADMIN", "LIBRARIAN"), updateReservation);
reservationRouter.put("/:id/cancel", authenticate, cancelReservation);
reservationRouter.put("/:id/complete", authenticate, authorize("ADMIN", "LIBRARIAN"), completeReservation);

export { reservationRouter };

