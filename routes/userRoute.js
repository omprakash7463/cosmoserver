import express from "express";
import { loginUser, registerUser, adminLogin, getUserProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/profile", requireAuth, getUserProfile);

export default userRouter;
