import { Router } from "express";
import { identifyUserOrGuest } from "../middlewares/identifyUser.middleware.js";
import { createUrl, getShortUrl, getUrl } from "../controllers/url.controller.js";

const urlRouter = Router();

urlRouter.get("/", identifyUserOrGuest, getUrl);
urlRouter.post("/create", identifyUserOrGuest, createUrl);
urlRouter.get("/:urlKey", getShortUrl)

export default urlRouter