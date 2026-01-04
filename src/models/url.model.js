import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    urlName: {
      type: String,
      trim: true,
      required: true,
    },

    urlKey: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    ownerType: {
      type: String,
      enum: ["USER", "GUEST"],
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
    },

    ip: String, // User IP
    userAgent: String, // Browser + OS ka raw data
    browser: String, // Chrome, Safari, Firefox
    os: String, // Windows, Android, iOS
    device: String, // Mobile, Desktop, Tablet
    country: String, // India, USA...
    city: String, // Jabalpur, Patna...
    clickHistory: [
      {
        time: { type: Date, default: Date.now }, // Click time (required)
        ip: String, // User IP
        userAgent: String, // Browser + OS ka raw data
        browser: String, // Chrome, Safari, Firefox
        os: String, // Windows, Android, iOS
        device: String, // Mobile, Desktop, Tablet
        country: String, // India, USA...
        city: String, // Jabalpur, Patna...
      },
    ],
  },
  { timestamps: true }
);

urlSchema.index(
  { ownerType: 1, ownerId: 1, urlName: 1 },
  { unique: true }
);

const Url = mongoose.model("Url", urlSchema);
export default Url;
