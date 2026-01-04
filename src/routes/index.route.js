import { Router } from "express";
import urlRouter from "./url.route.js";
import authRouter from "./auth.route.js";

const router = Router();

router.use("/urls", urlRouter);
router.use("/auth", authRouter);

export default router;
