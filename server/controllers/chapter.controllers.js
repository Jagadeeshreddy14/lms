import Course from "../model/course.model.js";
import Chapter from "../model/chapter.model.js";
import Lecture from "../model/lecture.model.js";

export const createChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterId, chapterTitle } = req.body;
    const { userId } = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    
    // console.log('User ID from token:', userId);
    // console.log('Course educator ID:', course.educator.toString());
    // console.log('Are they equal?:', course.educator.toString() === userId.toString());

    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add chapters to this course",
      });
    }
    const existingChapter = await Chapter.findOne({
      course: courseId,
      chapterId,
    });
    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID already exists in this course",
      });
    }

    // Create the chapter
    const chapter = new Chapter({
      course: courseId,
      chapterId,
      chapterTitle,
      chapterContent: [],
    });

    await chapter.save();

    // Add chapter to course
    course.chapters.push(chapter._id);
    await course.save();

    res.status(201).json({ success: true, chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all chapters for a course
export const getChaptersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const chapters = await Chapter.find({ course: courseId })
      .populate("chapterContent")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chapter by ID
export const getChapterById = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId)
      .populate("course", "title educator")
      .populate("chapterContent");

    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    res.status(200).json({ success: true, chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//delete the chapter
export const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { userId } = req.user;

    const chapter = await Chapter.findById(chapterId).populate("course");
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    // Check if user is the educator of this course
    if (chapter.course.educator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this chapter",
        });
    }

    // Delete all lectures in this chapter
    await Lecture.deleteMany({ chapter: chapterId });

    // Remove chapter from course
    await Course.findByIdAndUpdate(chapter.course._id, {
      $pull: { chapters: chapterId },
    });

    // Delete the chapter
    await Chapter.findByIdAndDelete(chapterId);

    res
      .status(200)
      .json({ success: true, message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
