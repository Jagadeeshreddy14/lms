import User from "../model/user.model.js";
import Course from "../model/course.model.js";
import userCourseProgress from "../model/courseProgress.model.js";
import Purchase from "../model/purchase.model.js";
import { uploadProfilePictureToCloudinary } from "../config/multer.js";

// Get user profile data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourse', 'title thumbnail price educator');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Format the user data for the frontend
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '', // Format as YYYY-MM-DD
      enrolledCourse: user.enrolledCourse,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const updateUserData = async(req,res)=>{
  try {
    const { userId } = req.user;
    const { 
      name, 
      phone, 
      location, 
      bio, 
      birthDate,
      avatar 
    } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prepare update object - only include fields that are provided
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (birthDate !== undefined) {
      // Validate date format if provided
      if (birthDate && !isNaN(new Date(birthDate).getTime())) {
        updateData.birthDate = new Date(birthDate);
      } else if (birthDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid birth date format"
        });
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Exclude password from response
      }
    ).populate('enrolledCourse', 'title thumbnail price educator');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user data error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate unique filename
    const fileName = `profile_${userId}_${Date.now()}`;

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadProfilePictureToCloudinary(req.file.buffer, fileName);
      
      // Update user avatar URL
      user.avatar = uploadResult.secure_url;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        avatar: uploadResult.secure_url,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage"
      });
    }

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

//user enrollCourse
export const userEnrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check if user exists and is a student
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses"
      });
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment"
      });
    }

    // Check if already enrolled
    if (user.enrolledCourse.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    // Enroll user in course
    user.enrolledCourse.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course: {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        price: course.price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const userPurchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { sessionId, paymentMethod = 'stripe' } = req.body;

    // console.log('Processing purchase for user:', userId, 'course:', courseId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Allow both students and educators to purchase courses
    if (user.role !== 'student' && user.role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: "Only students and educators can purchase courses"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId).populate('educator', 'name email');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check for data integrity - educator should exist
    if (!course.educator) {
      console.warn(`Data integrity issue: Course ${courseId} has no associated educator or educator doesn't exist`);
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for purchase"
      });
    }

    // Check if already purchased/enrolled
    const existingPurchase = await Purchase.findOne({
      user: userId,
      course: courseId
    });

    if (existingPurchase || user.enrolledCourse.includes(courseId)) {
      console.log('User already purchased this course, but payment was processed - handling gracefully');
      
      // Since payment was already processed, return success with existing purchase info
      return res.status(200).json({
        success: true,
        message: "Course was already purchased - you already have access to this course",
        purchase: {
          _id: existingPurchase?._id || 'existing',
          course: {
            _id: course._id,
            title: course.title,
            educator: course.educator ? course.educator.name : 'Unknown Educator',
            originalPrice: course.price,
            discount: course.discount || 0,
            finalPrice: course.price - (course.price * (course.discount || 0) / 100)
          },
          paymentMethod: 'stripe',
          purchaseDate: existingPurchase?.purchaseDate || new Date(),
          alreadyPurchased: true
        }
      });
    }

    // Calculate final price after discount
    const finalPrice = course.price - (course.price * (course.discount || 0) / 100);
    
    // console.log('Course price:', course.price, 'Final price after discount:', finalPrice);

    // Create purchase record in database
    let purchase;
    try {
      purchase = new Purchase({
        user: userId,
        course: courseId,
        price: finalPrice,
        purchaseDate: new Date()
      });
      await purchase.save();
      console.log('Purchase record saved:', purchase._id);
    } catch (purchaseErr) {
      console.error('Error saving purchase record:', purchaseErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to save purchase record',
        error: purchaseErr.message
      });
    }

    // Enroll user in course
    try {
      user.enrolledCourse.push(courseId);
      course.enrolledStudents.push(userId);
      await user.save();
      await course.save();
      console.log('User enrolled in course successfully');
    } catch (enrollErr) {
      console.error('Error enrolling user in course:', enrollErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to enroll user in course',
        error: enrollErr.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Course purchased and enrolled successfully",
      purchase: {
        _id: purchase._id,
        course: {
          _id: course._id,
          title: course.title,
          educator: course.educator ? course.educator.name : 'Unknown Educator',
          originalPrice: course.price,
          discount: course.discount || 0,
          finalPrice: finalPrice
        },
        paymentMethod,
        purchaseDate: purchase.purchaseDate
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// update UserCourseProgress
export const updateUserCourseProgress = async (req, res) =>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { completed, progress, lectureId, chapterId, chapter, lecture, lastPosition } = req.body;

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId).populate('chapters');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Find existing progress or create new one
    let courseProgress = await userCourseProgress.findOne({
      userId: userId,
      courseId: courseId
    });

    if (!courseProgress) {
      // Create new progress record
      courseProgress = new userCourseProgress({
        userId: userId,
        courseId: courseId,
        completed: false,
        progress: 0,
        completedLectures: [],
        lastPosition: { chapter: 0, lecture: 0 }
      });
    }

    // Handle lecture completion
    if (lectureId && (chapter !== undefined || chapterId)) {
      console.log('Processing lecture completion:', { lectureId, chapterId, chapter, lecture });
      console.log('Current completed lectures before update:', courseProgress.completedLectures);
      
      // Check if lecture is already marked as completed
      const existingCompletion = courseProgress.completedLectures.find(
        cl => cl.lectureId?.toString() === lectureId.toString() || 
              (cl.chapter === chapter && cl.lecture === lecture)
      );

      console.log('Existing completion found:', existingCompletion);

      if (!existingCompletion) {
        // Add new completed lecture
        const completionData = {
          lectureId: lectureId,
          completedAt: new Date()
        };
        
        if (chapterId) completionData.chapterId = chapterId;
        if (chapter !== undefined) completionData.chapter = chapter;
        if (lecture !== undefined) completionData.lecture = lecture;

        console.log('Adding completion data:', completionData);
        courseProgress.completedLectures.push(completionData);
        
        // Calculate progress percentage
        const totalLectures = course.chapters.reduce((total, ch) => {
          return total + (ch.chapterContent ? ch.chapterContent.length : 0);
        }, 0);
        
        if (totalLectures > 0) {
          const completedCount = courseProgress.completedLectures.length;
          courseProgress.progress = Math.round((completedCount / totalLectures) * 100);
          
          // Mark course as completed if all lectures are done
          if (completedCount === totalLectures) {
            courseProgress.completed = true;
          }
        }
      }
    }

    // Handle overall progress updates
    if (completed !== undefined) {
      courseProgress.completed = completed;
    }
    if (progress !== undefined) {
      courseProgress.progress = progress;
    }

    // Handle last position updates
    if (lastPosition) {
      courseProgress.lastPosition = lastPosition;
    }

    console.log('Saving course progress with completed lectures:', courseProgress.completedLectures);
    await courseProgress.save();
    console.log('Course progress saved successfully');

    res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
      data: {
        courseProgress,
        completedLectures: courseProgress.completedLectures
      }
    });
  } catch (error) {
      console.error('Update course progress error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
  }
}

// get userCourseProgress
export const getUserCourseProgress = async(req,res)=>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course"
      });
    }

    // Find user's progress for the course
    const courseProgress = await userCourseProgress.findOne({
      userId: userId,
      courseId: courseId
    }).populate('courseId', 'title totalDuration');

    console.log('Retrieved course progress for user', userId, 'course', courseId, ':', courseProgress);

    if (!courseProgress) {
      console.log('No progress found, returning empty progress');
      // Return empty progress if none exists
      return res.status(200).json({
        success: true,
        data: {
          courseProgress: null,
          completedLectures: [],
          lastPosition: { chapter: 0, lecture: 0 }
        }
      });
    }

    console.log('Returning completed lectures:', courseProgress.completedLectures);
    res.status(200).json({
      success: true,
      data: {
        courseProgress,
        completedLectures: courseProgress.completedLectures || [],
        lastPosition: courseProgress.lastPosition || { chapter: 0, lecture: 0 }
      }
    });
  } catch (error) {
      console.error('Get course progress error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
  }
}

// addUserRating
export const userRating = async(req,res) =>{
  try {
    const { courseId } = req.params;
    const { userId } = req.user;
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to rate it"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if user already rated this course
    const existingRatingIndex = course.ratings.findIndex(r => r.user.toString() === userId);
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
      course.ratings[existingRatingIndex].review = review || course.ratings[existingRatingIndex].review;
      course.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      course.ratings.push({
        user: userId,
        rating,
        review: review || "",
        createdAt: new Date()
      });
    }

    await course.save();

    // Calculate average rating
    const totalRatings = course.ratings.length;
    const averageRating = course.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    res.status(200).json({
      success: true,
      message: existingRatingIndex !== -1 ? "Rating updated successfully" : "Rating added successfully",
      rating: {
        userRating: rating,
        userReview: review,
        averageRating: averageRating.toFixed(1),
        totalRatings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });    
  } 
}

// Check if user has purchased a course
export const checkCoursePurchase = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.user;


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is enrolled
    const isEnrolled = user.enrolledCourse.includes(courseId);
    
    // Check if there's a purchase record
    const purchase = await Purchase.findOne({
      user: userId,
      course: courseId
    }).populate('course', 'title price');


    res.status(200).json({
      success: true,
      isEnrolled,
      hasPurchased: !!purchase,
      purchase: purchase || null
    });
  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get user's enrolled courses with progress
export const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get user with enrolled courses
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourse',
        select: 'title thumbnail price educator category difficulty rating createdAt chapters',
        populate: {
          path: 'educator',
          select: 'name'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get progress for each enrolled course
    const coursesWithProgress = await Promise.all(
      user.enrolledCourse.map(async (course) => {
        const progress = await userCourseProgress.findOne({
          userId,
          courseId: course._id
        });

        // Calculate total lessons (chapters)
        const totalLessons = course.chapters ? course.chapters.length : 0;
        const progressPercent = progress ? progress.progress : 0;
        const completedLessons = Math.floor((progressPercent / 100) * totalLessons);

        return {
          id: course._id,
          title: course.title,
          instructor: course.educator ? course.educator.name : 'Unknown',
          thumbnail: course.thumbnail || '/api/placeholder/300/200',
          progress: progressPercent,
          totalLessons,
          completedLessons,
          rating: course.rating || 4.5,
          category: course.category || 'General',
          difficulty: course.difficulty || 'Beginner',
          lastAccessed: progress ? progress.updatedAt : course.createdAt,
          isCompleted: progress ? progress.completed : false
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).populate('enrolledCourse');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all progress records for user
    const progressRecords = await userCourseProgress.find({ userId });
    
    // Calculate stats
    const totalEnrolled = user.enrolledCourse.length;
    const completedCourses = progressRecords.filter(p => p.completed).length;
    
 

    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: totalEnrolled,
        completedCourses,
        
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all students and educators
export const getAllStudentsAndEducators = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'educator'] } });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.log("User fetch problem", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate simple SVG certificate when course progress is 100%
export const getCourseCertificate = async (req, res) => {
  try {
    console.log('Certificate request:', {
      courseId: req.params?.courseId,
      userId: req.user?.userId,
      format: (req.query.format || 'svg').toString().toLowerCase()
    });
    const { courseId } = req.params;
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure enrolled
    if (!user.enrolledCourse.includes(courseId)) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Find progress
    const progress = await userCourseProgress.findOne({ userId, courseId });
    if (!progress || progress.progress < 100 || !progress.completed) {
      return res.status(400).json({ success: false, message: 'Certificate available after 100% completion' });
    }

    const course = await Course.findById(courseId);
    const courseTitle = course?.title || 'Course';
    const name = user.name || user.email || 'Student';
    const date = new Date().toLocaleDateString();
    const certId = `${String(userId).slice(-6)}-${String(courseId).slice(-6)}-${String(progress.updatedAt?.getTime() || Date.now()).slice(-6)}`;
    const signerName = (req.query.signer || process.env.CERT_SIGNER || 'Jagadish').toString();
    const signerTitle = (process.env.CERT_SIGNER_TITLE || 'Program Director').toString();

    // If PDF requested
    if ((req.query.format || '').toString().toLowerCase() === 'pdf') {
      let PDFDocument;
      try {
        ({ default: PDFDocument } = await import('pdfkit'));
      } catch (e) {
        console.error('PDFKit import failed:', e?.message);
        return res.status(501).json({ success: false, message: 'PDF generation is not available on this server. Please install pdfkit or request SVG format.' });
      }
      try {
        const chunks = [];
        const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 40 });
        doc.on('data', (c) => chunks.push(c));
        doc.on('error', (e) => console.error('PDF generation error:', e?.message));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="certificate-${courseId}.pdf"`);
          return res.status(200).send(pdfBuffer);
        });

      // Background and border
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');
      doc.save()
        .lineWidth(4)
        .strokeColor('#60a5fa')
        .roundedRect(30, 30, doc.page.width - 60, doc.page.height - 60, 20)
        .stroke()
        .restore();

      // Title and subtitles
      doc.fill('#e2e8f0').font('Helvetica-Bold').fontSize(34).text('Certificate of Completion', 0, 110, { align: 'center' });
      doc.fill('#94a3b8').font('Helvetica').fontSize(16).text('This certifies that', { align: 'center' });
      doc.fill('#ffffff').font('Helvetica-Bold').fontSize(48).text(name, { align: 'center' });
      doc.moveDown(0.3);
      doc.fill('#94a3b8').fontSize(16).text('has successfully completed the course', { align: 'center' });
      doc.fill('#e5e7eb').font('Helvetica-Bold').fontSize(30).text(courseTitle, { align: 'center' });

      // Meta (left bottom area)
      const leftY = doc.page.height - 190;
      doc.fill('#cbd5e1').font('Helvetica').fontSize(12).text(`Date: ${date}`, 70, leftY);
      doc.text(`Certificate ID: ${certId}`, 70, leftY + 22);

      // Signature block
      const sigY = doc.page.height - 120;
      doc.strokeColor('#475569').lineWidth(1.5).moveTo(doc.page.width - 420, sigY).lineTo(doc.page.width - 160, sigY).stroke();
      doc.fill('#e5e7eb').font('Times-Roman').fontSize(24).text(signerName, doc.page.width - 420, sigY - 28, { width: 260, align: 'center' });
      doc.fill('#94a3b8').font('Helvetica').fontSize(12).text(signerTitle, doc.page.width - 420, sigY + 10, { width: 260, align: 'center' });

      // CampusConnect logo below signature
      const logoCx = doc.page.width - 290, logoCy = sigY + 48;
      doc.save().circle(logoCx, logoCy, 42).fillOpacity(0.10).fill('#60a5fa').restore();
      doc.save().lineWidth(2).strokeColor('#60a5fa').circle(logoCx, logoCy, 34).stroke().restore();
      doc.fill('#93c5fd').font('Helvetica').fontSize(12).text('CampusConnect', logoCx - 60, logoCy - 7, { width: 120, align: 'center' });

      // Footer verify
      doc.fill('#64748b').font('Helvetica').fontSize(10).text(`Verify at https://example.com/verify/${certId}`, 0, doc.page.height - 60, { align: 'center' });

        doc.end();
        return;
      } catch (e) {
        console.error('PDF creation failed, falling back to SVG:', e?.message);
        // fall back to SVG below
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="850" fill="#0f172a"/>
  <rect x="28" y="28" width="1144" height="794" rx="24" fill="none" stroke="url(#g)" stroke-width="4"/>
  <rect x="40" y="40" width="1120" height="770" rx="24" fill="#0f172a"/>

  <text x="600" y="170" font-family="Segoe UI, Roboto, Arial" font-size="46" fill="#e2e8f0" text-anchor="middle">Certificate of Completion</text>
  <text x="600" y="230" font-family="Segoe UI, Roboto, Arial" font-size="22" fill="#94a3b8" text-anchor="middle">This certifies that</text>
  <text x="600" y="310" font-family="Segoe UI, Roboto, Arial" font-size="56" fill="#ffffff" text-anchor="middle" font-weight="bold">${name.replace(/&/g,'&amp;')}</text>
  <text x="600" y="370" font-family="Segoe UI, Roboto, Arial" font-size="22" fill="#94a3b8" text-anchor="middle">has successfully completed the course</text>
  <text x="600" y="450" font-family="Segoe UI, Roboto, Arial" font-size="40" fill="#e5e7eb" text-anchor="middle" font-weight="bold">${courseTitle.replace(/&/g,'&amp;')}</text>

  <text x="200" y="560" font-family="Segoe UI, Roboto, Arial" font-size="18" fill="#cbd5e1">Date: ${date}</text>
  <text x="200" y="600" font-family="Segoe UI, Roboto, Arial" font-size="18" fill="#cbd5e1">Certificate ID: ${certId}</text>

  <!-- CampusConnect logo below signature -->
  <g transform="translate(900,690)">
    <circle cx="0" cy="0" r="42" fill="#60a5fa" opacity="0.10"/>
    <circle cx="0" cy="0" r="34" fill="none" stroke="#60a5fa" stroke-width="2"/>
    <text x="0" y="5" font-family="Segoe UI, Roboto, Arial" font-size="12" fill="#93c5fd" text-anchor="middle">CampusConnect</text>
  </g>

  <!-- Signature Block -->
  <g>
    <text x="900" y="620" font-family="'Brush Script MT', cursive" font-size="36" fill="#e5e7eb" text-anchor="middle">${signerName.replace(/&/g,'&amp;')}</text>
    <line x1="780" y1="630" x2="1020" y2="630" stroke="#475569" stroke-width="2"/>
    <text x="900" y="655" font-family="Segoe UI, Roboto, Arial" font-size="14" fill="#94a3b8" text-anchor="middle">${signerTitle.replace(/&/g,'&amp;')}</text>
  </g>

  <text x="600" y="760" font-family="Segoe UI, Roboto, Arial" font-size="14" fill="#64748b" text-anchor="middle">Verify at https://example.com/verify/${certId}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${courseId}.svg"`);
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Certificate generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

