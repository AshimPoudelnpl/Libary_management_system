import express from "express";
import { getAllBooks, addBook, getBookById } from "../controllers/book.controller.js";

const bookRouter = express.Router();

bookRouter.get("/", getAllBooks);
bookRouter.post("/", addBook);
bookRouter.get("/:id", getBookById);

export { bookRouter };