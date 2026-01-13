import Url from "../models/url.model.js";
import { generateUrlKey } from "../utils/idGenerator.js";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

export const createUrl = async (req, res) => {
  try {
    const { urlName } = req.body;
    const { ownerType, ownerId } = req.identity;
    if (!urlName || !urlName.startsWith("https://")) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid link" });
    }

    const oldData = await Url.findOneAndDelete({
      urlName: urlName.trim(),
      ownerId,
      ownerType,
    });

    // const oldData = await Url.findOne({
    //   urlName: urlName.trim(),
    //   ownerId,
    //   ownerType,
    // });
    // if (oldData) {
    //   await Url.findByIdAndDelete(oldData._id);
    // }

    let urlKey;
    let exists = true;

    while (exists) {
      urlKey = generateUrlKey(6);
      exists = await Url.exists({ urlKey });
    }

    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      req.ip;

    const ua = UAParser(req.headers["user-agent"]);
    const browserName = ua.browser?.name || "";
    const osName = ua.os?.name || "";
    const deviceType = ua.device?.type || "Destop";
    const location = geoip.lookup(userIp);

    const url = await Url.create({
      urlName,
      urlKey,
      ownerType,
      ownerId,

      ip: userIp,
      userAgent: req.headers["user-agent"] ?? "",
      browser: browserName,
      os: osName,
      device: deviceType,
      country: location?.country ?? "",
      city: location?.city ?? "",
    });

    res.status(201).json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${urlKey}`,
      data: url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUrl = async (req, res) => {
  try {
    const { ownerType, ownerId } = req.identity;

    const urls = await Url.find({ ownerType, ownerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShortUrl = async (req, res) => {
  try {
    const { urlKey } = req.params;
    // const url = await Url.findOne({ urlKey });
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      req.ip;

    const ua = UAParser(req.headers["user-agent"]);
    const browserName = ua.browser.name ?? "";
    const osName = ua.os.name ?? "";
    const deviceType = ua.device.type ?? "Desktop";
    const location = geoip.lookup(userIp);

    const url = await Url.findOneAndUpdate(
      { urlKey },
      {
        $push: {
          clickHistory: {
            time: new Date(),
            ip: userIp,
            userAgent: req.headers["user-agent"] ?? "",
            browser: browserName,
            os: osName,
            device: deviceType,
            country: location?.country ?? "",
            city: location?.city ?? "",
          },
        },
      }
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found",
      });
    }
    return res.redirect(url.urlName);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteUrlById = async (req, res) => {
  try {
    const { urlId } = req.params;
    const urlRes = await Url.findByIdAndDelete(urlId);
    res
      .status(200)
      .json({ success: true, message: "Url deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message ?? "Internal server error",
      });
  }
};
