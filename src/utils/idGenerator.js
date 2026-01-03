import crypto from "crypto";

export const generateUUID = () => {
  return crypto.randomUUID();
};

export const generateUrlKey = (length = 6) => {
  return crypto
    .randomBytes(length)
    .toString("base64url")
    .slice(0, length);
};
