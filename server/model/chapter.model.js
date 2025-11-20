import mongoose from "mongoose";
import Lecture from "./lecture.model.js";

const chapterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    chapterTitle: {
      type: String,
      required: true,
    },
    chapterContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Lecture,
      },
    ],
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter",chapterSchema);
export default Chapter;
