import { Router } from "express";
import { identifyUserOrGuest } from "../middlewares/identifyUser.middleware.js";
import {
  createUrl,
  deleteUrlById,
  getShortUrl,
  getUrl,
} from "../controllers/url.controller.js";

const urlRouter = Router();

urlRouter.get("/", identifyUserOrGuest, getUrl);
urlRouter.post("/create", identifyUserOrGuest, createUrl);
urlRouter.get("/:urlKey", getShortUrl);
urlRouter.delete("/:urlId", deleteUrlById);

export default urlRouter;
