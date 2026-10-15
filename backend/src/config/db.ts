import mongoose from "mongoose";

const ConnectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const db = await mongoose.connect(uri, {
      dbName: dbName || undefined,
    });

    console.log(
      `Database connected successfully to ${db.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

export default ConnectDB;