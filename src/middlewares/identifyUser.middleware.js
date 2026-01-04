import jwt from "jsonwebtoken";
import { generateUUID } from "../utils/idGenerator.js";

const AUTH_ROUTES = ["/api/v1/auth/user/login", "/api/v1/auth/user/signup"];

export const identifyUserOrGuest = (req, res, next) => {
  try {
    const token = req.cookies?.authToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.identity = { ownerType: "USER", ownerId: decoded._id.toString() ,data:decoded };
      return next(); 
    }

    if (AUTH_ROUTES.includes(req.path)) {
      const guestId = req.cookies?.guestId;
      if (guestId) {
        req.identity = { ownerType: "GUEST", ownerId: guestId };
      } else {
        req.identity = { ownerType: "NONE", ownerId: null };
      }
      return next();
    }

    let guestId = req.cookies?.guestId;
    if (!guestId) {
      guestId = generateUUID();
      res.cookie("guestId", guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }
    req.identity = { ownerType: "GUEST", ownerId: guestId };

    return next();
  } catch (err) {
    console.error("identifyUserOrGuest error:", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
