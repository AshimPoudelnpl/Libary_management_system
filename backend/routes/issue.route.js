import express from "express";
import { issueBook, returnBook } from "../controllers/issue.controller.js";

const issueRouter = express.Router();

issueRouter.post("/", issueBook);
issueRouter.put("/:id/return", returnBook);

export { issueRouter };