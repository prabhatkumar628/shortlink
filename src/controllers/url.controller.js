import Url from "../models/url.model.js";
import { generateUrlKey } from "../utils/idGenerator.js";

export const createUrl = async (req, res) => {
  try {
    const { urlName } = req.body;
    const { ownerType, ownerId } = req.identity;

    const oldData = await Url.findOne({
      urlName: urlName.trim(),
      ownerId,
      ownerType,
    });
    if (oldData) {
      await Url.findByIdAndDelete(oldData._id);
    }

    let urlKey;
    let exists = true;

    while (exists) {
      urlKey = generateUrlKey(6);
      exists = await Url.exists({ urlKey });
    }

    const url = await Url.create({
      urlName,
      urlKey,
      ownerType,
      ownerId,
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
    const url = await Url.findOne({ urlKey });
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
