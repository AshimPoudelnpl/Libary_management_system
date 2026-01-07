import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import { bookRouter } from "./routes/book.route.js";
import { userRouter } from "./routes/user.route.js";
import { issueRouter } from "./routes/issue.route.js";
import { categoryRouter } from "./routes/category.route.js";
import { publisherRouter } from "./routes/publisher.route.js";
import { authorRouter } from "./routes/author.route.js";
import { bookCopyRouter } from "./routes/bookCopy.route.js";
import { fineRouter } from "./routes/fine.route.js";
import { reservationRouter } from "./routes/reservation.route.js";

dotenv.config();

const app = express();

// Connect to database
try {
  console.log("Database connected successfully");
} catch (error) {
  console.log("MySQL connection Failed:", error.message);
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/publishers", publisherRouter);
app.use("/api/authors", authorRouter);
app.use("/api/book-copies", bookCopyRouter);
app.use("/api/fines", fineRouter);
app.use("/api/reservations", reservationRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", status: "OK" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});