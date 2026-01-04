import { Router } from "express";
import {
  getMe,
  login,
  logout,
  SignUp,
} from "../controllers/auth.controller.js";
import { identifyUserOrGuest } from "../middlewares/identifyUser.middleware.js";

const authRouter = Router();

authRouter.post("/user/signup", identifyUserOrGuest, SignUp);
authRouter.post("/user/login", identifyUserOrGuest, login);
authRouter.post("/user/logout", identifyUserOrGuest, logout);
authRouter.get("/user/me", identifyUserOrGuest, getMe);

export default authRouter;
