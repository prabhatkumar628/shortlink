import jwt from "jsonwebtoken";
import { generateUUID } from "../utils/idGenerator.js";
// import { generateUUID } from "../../utils/idGenerator.js";

export const identifyUserOrGuest = (req, res, next) => {
  try {
    const token = req.cookies?.authToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.identity = {
        ownerType: "USER",
        ownerId: decoded._id,
      };

      return next();
    }

    let guestId = req.cookies?.guestId;

    if (!guestId) {
      guestId = generateUUID();

      res.cookie("guestId", guestId, {
        httpOnly: true,
        secure:true,
        sameSite: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path:"/"
      });
    }

    req.identity = {
      ownerType: "GUEST",
      ownerId: guestId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};
