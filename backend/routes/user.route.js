import express from "express";
import { getAllUsers, addUser, getUserById } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", addUser);
userRouter.get("/:id", getUserById);

export { userRouter };