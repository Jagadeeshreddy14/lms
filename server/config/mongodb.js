import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => { 
  try {
    const connectionDB = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connection failed", error.message);
    
  }
}


export default connectDB;