import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI as string);

    if (connection) {
      console.log("MongoDB Connected", connection.connection.host);
    }
  } catch (error) {
    console.log("MongoDB Connection failed", error);
    process.exit(1);
  }
};
