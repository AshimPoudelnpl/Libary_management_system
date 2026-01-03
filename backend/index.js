import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import { bookRouter } from "./routes/book.route.js";
import { userRouter } from "./routes/user.route.js";
import { issueRouter } from "./routes/issue.route.js";

dotenv.config();

const app = express();

// Connect to database
db.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log("MySQL connection Failed ", error.message));

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

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/users", userRouter);
app.use("/api/issues", issueRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});