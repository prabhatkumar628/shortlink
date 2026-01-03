import mongoose from "mongoose";

const DB_URL = process.env.MONGODB_URI
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return console.log(`MongoDB already connected`);
  try {
    const connectionInstance = await mongoose.connect(DB_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 4500,
    });
    isConnected = connectionInstance.connection.readyState === 1;
    console.log(
      `MongoDB Connected !!! HOST: `,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log(`MongoDB Connection ERROR `, error);
    process.exit(1);
  }
};

export default connectDB
