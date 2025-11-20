import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role: {
      type: String,
      enum: ["student", "educator"],
      default: "student",
    },
    avatar: {
      type: String,
    },
    phone: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    birthDate: {
        type: Date
    },
    enrolledCourse: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    }
},{timestamps:true});

const User = mongoose.model("User",userSchema); 
export default User;