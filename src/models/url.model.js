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
  },
  { timestamps: true }
);

urlSchema.index(
  { ownerType: 1, ownerId: 1, urlName: 1 },
  { unique: true }
);

const Url = mongoose.model("Url", urlSchema);
export default Url;
