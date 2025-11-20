import Course from "../model/course.model.js";
import Chapter from "../model/chapter.model.js";
import Lecture from "../model/lecture.model.js";
import User from "../model/user.model.js";
import { uploadVideoToCloudinary } from "../config/multer.js";


export const createLecture = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title, description, content, duration, order } = req.body;
    const { userId } = req.user;

    // Validations
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Lecture title is required" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Video file is required" });
    }

    // Check course & educator
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to add lectures" });
    }

    // Check chapter
    const chapter = await Chapter.findOne({ _id: chapterId, course: courseId });
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });

    // Upload video to Cloudinary with retry logic
    let videoUrl = "";
    let publicId = "";
    try {
      const fileName = `lecture_${courseId}_${chapterId}_${Date.now()}`;
      console.log(`Starting video upload for file: ${fileName}`);
      
      // Retry logic for video upload
      let uploadResult;
      let retries = 3;
      
      while (retries > 0) {
        try {
          uploadResult = await uploadVideoToCloudinary(req.file.buffer, fileName);
          break; // Success, exit retry loop
        } catch (uploadError) {
          retries--;
          console.log(`Upload attempt failed, retries left: ${retries}`, uploadError.message);
          
          if (retries === 0) {
            throw uploadError; // Final attempt failed
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (3 - retries) * 2000));
        }
      }
      
      videoUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
      console.log(`Video upload successful: ${videoUrl}`);
    } catch (err) {
      console.error("Video upload error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to upload video. Please try again with a smaller file or check your internet connection.",
        error: err.message 
      });
    }

    // Check order uniqueness
    const existingLecture = await Lecture.findOne({ chapter: chapterId, order: parseInt(order) });
    if (existingLecture) {
      return res.status(400).json({ success: false, message: "Lecture order already exists" });
    }

    // Save lecture
    const lecture = new Lecture({
      course: courseId,
      chapter: chapterId,
      title: title.trim(),
      description,
      content,
      videoUrl,
      publicId, // save Cloudinary public ID for future delete
      duration: parseInt(duration) || 0,
      order: parseInt(order) || 1,
    });

    await lecture.save();

    // Update chapter & course
    chapter.chapterContent.push(lecture._id);
    await chapter.save();
    course.lectures.push(lecture._id);
    await course.save();

    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all lectures for a chapter
export const getLecturesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    const lectures = await Lecture.find({ chapter: chapterId }).sort({
      order: 1,
    });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all lectures for a course
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lectures = await Lecture.find({ course: courseId })
      .populate("chapter", "chapterTitle")
      .sort({ "chapter.createdAt": 1, order: 1 });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId)
      .populate("course", "title educator")
      .populate("chapter", "chapterTitle");

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    res.status(200).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete lecture
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { userId } = req.user;

    const lecture = await Lecture.findById(lectureId).populate("course");
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    // Check if user is the educator of this course
    if (lecture.course.educator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this lecture",
        });
    }

    
    await Chapter.findByIdAndUpdate(lecture.chapter, {
      $pull: { chapterContent: lectureId },
    });

    
    await Course.findByIdAndUpdate(lecture.course._id, {
      $pull: { lectures: lectureId },
    });

    await Lecture.findByIdAndDelete(lectureId);

    res
      .status(200)
      .json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder lectures in a chapter
export const reorderLectures = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { lectureOrders } = req.body; // Array of { lectureId, newOrder }
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
          message: "Not authorized to reorder lectures",
        });
    }

    // Update lecture orders
    for (const { lectureId, newOrder } of lectureOrders) {
      await Lecture.findByIdAndUpdate(lectureId, { order: newOrder });
    }

    const updatedLectures = await Lecture.find({ chapter: chapterId }).sort({
      order: 1,
    });

    res.status(200).json({ success: true, lectures: updatedLectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lecture with access control
export const getLectureWithAccess = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { userId } = req.user;


    // Find the lecture with course and chapter details
    const lecture = await Lecture.findById(lectureId)
      .populate({
        path: 'chapter',
        populate: {
          path: 'course',
          model: 'Course'
        }
      });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    const courseId = lecture.chapter.course._id;

    // Check if user has purchased/enrolled in this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isEnrolled = user.enrolledCourse.includes(courseId);
    const isEducator = lecture.chapter.course.educator.toString() === userId.toString();


    if (!isEnrolled && !isEducator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please purchase this course to view lectures."
      });
    }

    res.status(200).json({
      success: true,
      lecture,
      hasAccess: true
    });
  } catch (error) {
    console.error('Get lecture with access error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
