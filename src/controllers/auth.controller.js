import Url from "../models/url.model.js";
import User from "../models/user.model.js";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const SignUp = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.identity;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const authToken = user.generateAccessToken();

    if (ownerType === "GUEST" && ownerId) {
      const guestUrls = await Url.find({
        ownerType: "GUEST",
        ownerId,
      }).select("urlName");

      if (guestUrls.length > 0) {
        const guestUrlNames = guestUrls.map((u) => u.urlName);
        const userUrls = await Url.find({
          ownerType: "USER",
          ownerId: user._id,
          urlName: { $in: guestUrlNames },
        }).select("urlName");

        const duplicateNames = userUrls.map((u) => u.urlName);

        if (duplicateNames.length > 0) {
          await Url.deleteMany({
            ownerType: "GUEST",
            ownerId,
            urlName: { $in: duplicateNames },
          });
        }

        await Url.updateMany(
          { ownerType: "GUEST", ownerId },
          { ownerType: "USER", ownerId: user._id }
        );
      }
    }

    res
      .status(201)
      .cookie("authToken", authToken, options)
      .json({
        success: true,
        message: "SignUp user successfully",
        data: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.identity;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalide credentials",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalide credentials",
      });
    }
    const checkPassword = await user.isPasswordCorrect(password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalide credentials",
      });
    }

    const authToken = user.generateAccessToken();

    if (ownerType === "GUEST" && ownerId) {
      const guestUrls = await Url.find({
        ownerType: "GUEST",
        ownerId,
      }).select("urlName");

      if (guestUrls.length > 0) {
        const guestUrlNames = guestUrls.map((u) => u.urlName);
        const userUrls = await Url.find({
          ownerType: "USER",
          ownerId: user._id,
          urlName: { $in: guestUrlNames },
        }).select("urlName");

        const duplicateNames = userUrls.map((u) => u.urlName);

        if (duplicateNames.length > 0) {
          await Url.deleteMany({
            ownerType: "GUEST",
            ownerId,
            urlName: { $in: duplicateNames },
          });
        }

        await Url.updateMany(
          { ownerType: "GUEST", ownerId },
          { ownerType: "USER", ownerId: user._id }
        );
      }
    }

    res
      .status(200)
      .cookie("authToken", authToken, options)
      .json({
        success: true,
        message: "Logged in user successfully",
        data: { _id: user._id, name: user.name, email: user.email },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { ownerType, ownerId, data } = req.identity;
    if (ownerType === "USER" && data && data.role) {
      res
        .status(200)
        .json({ success: true, message: "Current user fetched", data: data });
    } else {
      return res.status(200).json({
        success: false,
        message: "Current user Guest",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.identity;
    if (ownerType !== "USER") {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized request" });
    }
    return res
      .status(200)
      .clearCookie("authToken", { path: "/" })
      .json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Internal server error",
    });
  }
};
