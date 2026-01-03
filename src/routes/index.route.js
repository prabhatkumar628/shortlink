import { Router } from "express";
import urlRouter from "./url.route.js";

const router = Router();

router.use("/urls", urlRouter);

export default router;
