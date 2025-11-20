import Course from "../model/course.model.js";
import Chapter from "../model/chapter.model.js";
import Lecture from "../model/lecture.model.js";
import User from "../model/user.model.js";
import Purchase from "../model/purchase.model.js";
import { uploadImageToCloudinary } from "../config/multer.js";


//create course
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      thumbnail,
      totalDuration,
      chapters,
    } = req.body;
    const { userId } = req.user;

    const educator = await User.findById(userId);
    if (!educator || educator.role !== "educator") {
      return res
        .status(403)
        .json({ success: false, message: "Only educators can create courses" });
    }

    // Create the course
    const course = new Course({
      title,
      description,
      price,
      discount: discount || 0,
      thumbnail,
      educator: userId,
      totalDuration,
      chapters: [],
    });

    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all course
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("educator", "name email avatar")
      .populate("chapters")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//delete the course

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Debug: Log the values being compared
    // console.log('User ID from token:', userId);
    // console.log('User ID type:', typeof userId);
    // console.log('Course educator ID:', course.educator);
    // console.log('Course educator ID type:', typeof course.educator);
    // console.log('Course educator toString():', course.educator.toString());
    // console.log('Are they equal?:', course.educator.toString() === userId.toString());

    // Check if user is the educator of this course
    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to delete this course" 
      });
    }

    // Delete related chapters and lectures
    await Chapter.deleteMany({ course: courseId });
    await Lecture.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enroll student in course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (user.role !== "student" && user.role !== "educator") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only students can enroll in courses",
        });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    // Add student to course
    await course.save();

    // Add course to user's enrolled courses
    user.enrolledCourse.push(courseId);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Successfully enrolled in course" });
  } catch (error) {
    res.status(500).json({ success: false, message:error.message });
  }
};

// get course by educator
export const getCourseEducator = async (req, res) => {
  try {
    const { userId } = req.user;

    const courses = await Course.find({ educator: userId })
      .populate("educator", "name email avatar")
      .populate("chapters")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("educator", "name email avatar")
      .populate({
        path: "chapters",
        populate: {
          path: "chapterContent",
          model: "Lecture"
        }
      })
      .populate({
        path: "ratings.user",
        select: "name avatar"
      });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publish/Unpublish course
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Debug: Log the values being compared
    // console.log('User ID from token:', userId);
    // console.log('Course educator ID:', course.educator.toString());
    // console.log('User role:', req.user.role);

    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({ 
      success: true, 
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user has already purchased a course
export const checkPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if already purchased/enrolled
    const existingPurchase = await Purchase.findOne({
      user: userId,
      course: courseId
    });

    const isEnrolled = user.enrolledCourse.includes(courseId);
    const hasPurchased = existingPurchase !== null;

    res.status(200).json({
      success: true,
      data: {
        courseId,
        userId,
        hasPurchased,
        isEnrolled,
        canPurchase: !hasPurchased && !isEnrolled,
        purchaseDate: existingPurchase?.purchaseDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//update course 

export const updateCourse = async (req, res) => {
  try {
    console.log('=== UPDATE COURSE DEBUG ===');
    console.log('Course ID:', req.params.courseId);
    console.log('User ID:', req.user.userId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { courseId } = req.params;
    const { userId } = req.user;
    
    // Find course by ID and check ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if user is the educator of this course
    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to update this course" 
      });
    }

    let updateData = {};
    let thumbnailUrl = null;

    // Handle file upload (FormData) vs regular JSON request
    if (req.file) {
      // This is a FormData request with a thumbnail file
      const {
        title,
        description,
        category,
        price,
        discount,
        level,
        language,
        isPublished,
        estimatedDuration,
        requirements,
        whatYouWillLearn,
        tags
      } = req.body;

      console.log('FormData fields:', {
        title,
        description,
        category,
        price,
        discount,
        level,
        language,
        isPublished,
        estimatedDuration,
        requirements,
        whatYouWillLearn,
        tags
      });

      // Upload thumbnail to Cloudinary
      try {
        const fileName = `course-thumbnail-${courseId}-${Date.now()}`;
        const uploadResult = await uploadImageToCloudinary(req.file.buffer, fileName);
        thumbnailUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload thumbnail" 
        });
      }

      updateData = {
        title: title?.trim(),
        description: description?.trim(),
        category: category || '',
        price: price ? parseFloat(price) : 0,
        discount: discount ? parseFloat(discount) : 0,
        level: level || 'beginner',
        language: language || 'English',
        isPublished: isPublished === 'true' || isPublished === true,
        estimatedDuration: estimatedDuration ? parseFloat(estimatedDuration) : 0,
        requirements: requirements ? JSON.parse(requirements) : [],
        whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [],
        tags: tags ? JSON.parse(tags) : [],
        thumbnail: thumbnailUrl
      };
    } else {
      // This is a regular JSON request
      const {
        title,
        description,
        category,
        price,
        discount,
        level,
        language,
        isPublished,
        estimatedDuration,
        requirements,
        whatYouWillLearn,
        tags,
        thumbnail
      } = req.body;

      console.log('JSON fields:', {
        title,
        description,
        category,
        price,
        discount,
        level,
        language,
        isPublished,
        estimatedDuration,
        requirements,
        whatYouWillLearn,
        tags,
        thumbnail
      });

      updateData = {
        title: title?.trim(),
        description: description?.trim(),
        category: category || '',
        price: price ?? 0,
        discount: discount ?? 0,
        level: level || 'beginner',
        language: language || 'English',
        isPublished: Boolean(isPublished),
        estimatedDuration: estimatedDuration ?? 0,
        requirements: requirements || [],
        whatYouWillLearn: whatYouWillLearn || [],
        tags: tags || [],
        thumbnail: thumbnail
      };
    }

    console.log('Final update data:', updateData);

    // Update course with new data
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        course[key] = updateData[key];
      }
    });

    await course.save();

    console.log('Course updated successfully');
    res.status(200).json({ 
      success: true, 
      message: "Course updated successfully", 
      course 
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//search controllers 
export const searchCourses = async(req,res)=>{
  try {
    const { query, category, level, minPrice, maxPrice } = req.query;
    
    // Build search conditions
    let searchConditions = {
      isPublished: true, // Only return published courses
    };

    // Text search across title, description
    if (query && query.trim()) {
      searchConditions.$or = [
        { title: { $regex: query.trim(), $options: "i" } },
        { description: { $regex: query.trim(), $options: "i" } }
      ];
    }

    // Category filter (if category field exists in model)
    if (category && category !== 'All') {
      searchConditions.category = { $regex: category, $options: "i" };
    }

    // Level filter (if difficulty field exists in model)
    if (level && level !== 'All') {
      searchConditions.difficulty = { $regex: level, $options: "i" };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      searchConditions.price = {};
      if (minPrice !== undefined) {
        searchConditions.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        searchConditions.price.$lte = parseFloat(maxPrice);
      }
    }

    const courses = await Course.find(searchConditions)
      .populate("educator", "name email avatar")
      .populate("chapters")
      .sort({ createdAt: -1 })
      .limit(50); // Limit results to prevent overload

    res.status(200).json({ 
      success: true, 
      data: courses,
      count: courses.length,
      searchTerm: query || '',
      filters: { category, level, minPrice, maxPrice }
    });
  } catch (error) {
   res.status(500).json({ success: false, message: error.message }); 
   console.log("Search courses error:", error.message);
  }
}

// Get educator analytics
export const getEducatorAnalytics = async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get educator's courses with ratings
    const courses = await Course.find({ educator: userId })
      .populate("chapters")
      .populate("ratings.user", "name")
      .select('_id title price isPublished createdAt enrolledStudents ratings');

    // Get purchases for educator's courses
    const courseIds = courses.map(course => course._id);
    const purchases = await Purchase.find({
      course: { $in: courseIds },
      purchaseDate: { $gte: startDate }
    }).populate('course', 'title price').populate('user', 'name email');

    // Get all-time purchases for comparison
    const allTimePurchases = await Purchase.find({
      course: { $in: courseIds }
    }).populate('course', 'title price');

    // Calculate metrics
    const totalRevenue = allTimePurchases.reduce((sum, purchase) => sum + purchase.price, 0);
    const periodRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    
    const totalStudents = [...new Set(allTimePurchases.map(p => p.user.toString()))].length;
    const periodStudents = [...new Set(purchases.map(p => p.user.toString()))].length;
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;

    // Calculate real average rating from all courses' ratings
    let totalRatings = 0;
    let ratingsCount = 0;
    courses.forEach(course => {
      if (course.ratings && course.ratings.length > 0) {
        course.ratings.forEach(rating => {
          totalRatings += rating.rating;
          ratingsCount++;
        });
      }
    });
    const avgRating = ratingsCount > 0 ? totalRatings / ratingsCount : 0;

    // Calculate percentage changes (based on real data)
    const revenueChange = periodRevenue > 0 && totalRevenue > periodRevenue ? 
      ((periodRevenue / (totalRevenue - periodRevenue)) * 100).toFixed(1) : 0;
    const studentsChange = periodStudents > 0 && totalStudents > periodStudents ? 
      ((periodStudents / (totalStudents - periodStudents)) * 100).toFixed(1) : 0;
    const coursesChange = 0; // Would need to track course creation dates to calculate this
    const ratingChange = 0; // Would need historical rating data to calculate trend

    // Get top performing courses
    const courseRevenue = {};
    allTimePurchases.forEach(purchase => {
      const courseId = purchase.course._id.toString();
      if (!courseRevenue[courseId]) {
        courseRevenue[courseId] = {
          id: courseId,
          title: purchase.course.title,
          revenue: 0,
          students: new Set()
        };
      }
      courseRevenue[courseId].revenue += purchase.price;
      courseRevenue[courseId].students.add(purchase.user.toString());
    });

    const topCourses = Object.values(courseRevenue)
      .map(course => ({
        ...course,
        students: course.students.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate recent activity
    const recentActivity = purchases
      .slice(-10)
      .reverse()
      .map(purchase => ({
        description: `New enrollment in "${purchase.course.title}"`,
        time: purchase.purchaseDate.toLocaleDateString(),
        type: 'enrollment'
      }));

    // Student engagement metrics (based on real data where possible)
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
    const totalPurchases = allTimePurchases.length;
    const completionRate = totalEnrollments > 0 ? ((totalPurchases / totalEnrollments) * 100).toFixed(1) : 0;
    
    const studentEngagement = {
      completionRate: parseFloat(completionRate),
      avgTimeSpent: 0, // Would need activity tracking to calculate this
      dropoffRate: totalEnrollments > 0 ? (((totalEnrollments - totalPurchases) / totalEnrollments) * 100).toFixed(1) : 0,
      satisfactionScore: avgRating
    };

    // Generate chart data for revenue trends
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayRevenue = purchases
        .filter(p => {
          const pDate = new Date(p.purchaseDate);
          return pDate.toDateString() === date.toDateString();
        })
        .reduce((sum, p) => sum + p.price, 0);
      
      chartData.push({
        date: date.toLocaleDateString(),
        revenue: dayRevenue,
        students: purchases.filter(p => {
          const pDate = new Date(p.purchaseDate);
          return pDate.toDateString() === date.toDateString();
        }).length
      });
    }

    const analyticsData = {
      overview: {
        totalRevenue,
        totalStudents,
        totalCourses: publishedCourses,
        avgRating,
        revenueChange,
        studentsChange,
        coursesChange,
        ratingChange
      },
      chartData,
      topCourses,
      recentActivity,
      studentEngagement,
      timeRange
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}