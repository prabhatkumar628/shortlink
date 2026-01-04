import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, "../", "dist");
const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(publicPath));

const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL_PROD,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      if (allowedOrigin.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED", origin);
      callback(new Error("not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

import router from "./routes/index.route.js";
import { getShortUrl } from "./controllers/url.controller.js";
app.get("/:urlKey", getShortUrl);
app.use("/api/v1/", router);
app.get("/health", (req, res) => res.json({ success: true }));


// ❌❌❌ ALL ROUTES KE BAAD
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

export default app;
