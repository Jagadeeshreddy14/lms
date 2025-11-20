import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Download,
  BookOpen,
  Award,
  Globe,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from 'lucide-react';
import { getCourseById } from '../../Api/courseApi.js';
import { checkCoursePurchase } from '../../Api/userApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StripeCheckoutButton from '../Payment/StripeCheckoutButton';
import Rating from '../Student/Rating.jsx';
import ReviewsList from './ReviewsList.jsx';
import './CourseDetails.css';

const CourseDetails = () => {
  const params = useParams();
  const { id: courseId } = params; // Extract 'id' parameter and rename it to 'courseId'
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState({
    isEnrolled: false,
    hasPurchased: false,
    loading: true
  });
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);



  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCourseById(courseId);
      
      if (response.success && response.course) {
        setCourse(response.course);
        console.log("Course details set:", response.course);
        
        // Check if user has already rated this course
        if (isLoggedIn && user && response.course.ratings) {
          const existingRating = response.course.ratings.find(
            rating => rating.user && rating.user._id === user._id
          );
          setUserRating(existingRating || null);
        }
      } else {
        throw new Error(response.message || "Failed to fetch course details");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError(error.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = async (newRatingData) => {
    // Refresh course data to get updated ratings
    await fetchCourseDetails();
    setShowRatingForm(false);
    
    // Show success message or handle UI updates
    console.log('Rating submitted successfully:', newRatingData);
  };

  const getUserRatingInfo = () => {
    if (!course?.ratings || !user) return { rating: 0, review: '' };
    
    const userRatingObj = course.ratings.find(
      rating => rating.user && (rating.user._id === user._id || rating.user === user._id)
    );
    
    return {
      rating: userRatingObj?.rating || 0,
      review: userRatingObj?.review || ''
    };
  };

  const calculateAverageRating = () => {
    if (!course?.ratings || course.ratings.length === 0) return 0;
    
    const sum = course.ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return sum / course.ratings.length;
  };

  const checkPurchaseStatus = async () => {
    if (!isLoggedIn || !courseId) {
      setPurchaseStatus({
        isEnrolled: false,
        hasPurchased: false,
        loading: false
      });
      return;
    }

    try {
      console.log("Checking purchase status for course:", courseId);
      const response = await checkCoursePurchase(courseId);
      console.log("Purchase status response:", response);
      
      if (response.success) {
        setPurchaseStatus({
          isEnrolled: response.isEnrolled,
          hasPurchased: response.hasPurchased,
          loading: false
        });
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setPurchaseStatus({
        isEnrolled: false,
        hasPurchased: false,
        loading: false
      });
    }
  };

  useEffect(() => {
    console.log("CourseDetails component mounted with courseId:", courseId);
    if (courseId) {
      fetchCourseDetails();
    } else {
      console.error("No courseId found in URL parameters");
      setError("Course ID not provided");
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    checkPurchaseStatus();
  }, [courseId, isLoggedIn, user]);

  // Update user rating when course data changes
  useEffect(() => {
    if (course && isLoggedIn && user) {
      const existingRating = course.ratings?.find(
        rating => rating.user && (rating.user._id === user._id || rating.user === user._id)
      );
      setUserRating(existingRating || null);
    }
  }, [course, isLoggedIn, user]);

  const handleExplore = () => {
    if (course && purchaseStatus.isEnrolled) {
      navigate(`/course/${courseId}/learn`);
    }
  };

  const handleBuyNow = () => {
    if (!course) return;
    // The StripeCheckoutButton component will handle redirecting to Stripe Checkout
    console.log("Payment will be handled by Stripe Checkout");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-16 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            <div className="lg:col-span-2 order-2 lg:order-1 space-y-6 md:space-y-8">
              <div className="animate-pulse">
                <div className="bg-slate-800 h-6 md:h-8 rounded w-3/4 mb-4"></div>
                <div className="bg-slate-800 h-8 md:h-12 rounded w-full mb-4"></div>
                <div className="bg-slate-800 h-4 md:h-6 rounded w-2/3 mb-6"></div>
                <div className="bg-slate-800 h-48 md:h-64 rounded-lg md:rounded-2xl"></div>
              </div>
            </div>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="animate-pulse bg-slate-800 h-80 md:h-96 rounded-lg md:rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-16 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16">
          <div className="text-center py-8 md:py-12">
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg md:rounded-xl p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-red-400 text-xl md:text-2xl font-bold mb-4">Error Loading Course</h2>
              <p className="text-slate-400 mb-4 md:mb-6 text-sm md:text-base">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={fetchCourseDetails}
                  className="px-4 md:px-6 py-2 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg md:rounded-xl transition-colors text-sm md:text-base"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="block w-full px-4 md:px-6 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg md:rounded-xl transition-colors text-sm md:text-base"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24">
        <div className="container mx-auto px-6 lg:px-8 pb-16">
          <div className="text-center py-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-slate-300 text-2xl font-bold mb-4">Course Not Found</h2>
              <p className="text-slate-400 mb-6">The course you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-16 md:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Course Header */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="mb-6 md:mb-8"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 md:px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs md:text-sm">
                  {course.category || 'General'}
                </span>
                {course.isPublished && (
                  <span className="px-2 md:px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs md:text-sm">
                    Available
                  </span>
                )}
              </div>
            </motion.div>

            {/* Course Thumbnail */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="relative mb-6 md:mb-8"
            >
              <div className="aspect-video bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg md:rounded-xl overflow-hidden shadow-lg relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-white/80" />
                  </div>
                )}
                
                {/* Play Button Overlay - Only show if user has purchased */}
                {purchaseStatus.isEnrolled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <button
                      onClick={handleExplore}
                      className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl"
                      aria-label="Open course"
                    >
                      <Play className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </div>
                )}

                {/* Course Badge */}
                <div className="absolute top-3 md:top-4 left-3 md:left-4">
                  <span className="px-2 md:px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs md:text-sm rounded-full border border-white/20">
                    {course.category || 'Course'}
                  </span>
                </div>
              </div>

              {/* Course Info Below Thumbnail */}
              <div className="mt-4 space-y-3">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-slate-300 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-slate-300">
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(calculateAverageRating()) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="ml-1 text-xs md:text-sm">{calculateAverageRating().toFixed(1)}</span>
                    <span className="text-slate-400 text-xs md:text-sm hidden sm:inline">({course.ratings?.length || 0} reviews)</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">{course.enrolledStudents?.length || 0} students</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">{course.duration || 'Self-paced'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="mb-6 md:mb-8"
            >
              <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-1 backdrop-blur-sm border border-slate-700/50">
                <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" role="tablist">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      role="tab"
                      aria-selected={activeTab === tab}
                      aria-controls={`${tab}-panel`}
                      className={`flex-1 min-w-0 py-2 md:py-3 px-2 md:px-4 rounded-md md:rounded-lg font-medium text-xs md:text-sm capitalize transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg md:rounded-2xl p-4 md:p-6 shadow-lg"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`${activeTab}-tab`}
            >
              {activeTab === 'overview' && (
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {course.learningObjectives && course.learningObjectives.length > 0 ? (
                      course.learningObjectives.map((objective, i) => (
                        <div key={i} className="flex items-start space-x-2 md:space-x-3">
                          <Award className="w-3 h-3 md:w-4 md:h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-300 text-sm md:text-base">{objective}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-sm md:text-base col-span-full">No learning objectives specified for this course.</div>
                    )}
                  </div>
                  
                  {course.requirements && course.requirements.length > 0 && (
                    <>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 mt-4 md:mt-6">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((requirement, i) => (
                          <li key={i} className="flex items-start space-x-2 md:space-x-3 text-slate-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm md:text-base">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Course Content</h3>
                  <div className="text-slate-300 mb-4 text-sm md:text-base">
                    {course.chapters?.length || 0} chapters • {course.chapters?.reduce((total, chapter) => total + (chapter.chapterContent?.length || 0), 0) || 0} lectures
                  </div>
                  
                  {course.chapters && course.chapters.length > 0 ? (
                    course.chapters.map((chapter, i) => (
                      <div key={chapter._id} className="border border-slate-600/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                          className="w-full p-3 md:p-4 text-left bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium text-sm md:text-base">Chapter {i + 1}: {chapter.chapterTitle}</h4>
                              <p className="text-slate-400 text-xs md:text-sm">{chapter.chapterContent?.length || 0} lectures</p>
                            </div>
                            {expandedSection === i ? (
                              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        
                        {expandedSection === i && chapter.chapterContent && (
                          <div className="p-3 md:p-4 space-y-2">
                            {chapter.chapterContent.map((lecture, j) => (
                              <div key={lecture._id} className="flex items-center justify-between py-1 md:py-2">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <Play className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-slate-300 text-sm md:text-base truncate">{j + 1}. {lecture.title}</span>
                                </div>
                                {lecture.duration && (
                                  <span className="text-slate-400 text-xs md:text-sm flex-shrink-0 ml-2">{lecture.duration}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 md:py-8 text-slate-400">
                      <BookOpen className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm md:text-base">No curriculum available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Instructor</h3>
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0 overflow-hidden">
                      {course.educator?.profileImage ? (
                        <img
                          src={course.educator.profileImage}
                          alt={course.educator?.name || 'Educator'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base md:text-lg font-semibold text-white mb-1">
                        {course.educator?.name || 'Course Instructor'}
                      </h4>
                      <p className="text-blue-400 mb-2 text-sm md:text-base">
                        {course.educator?.title || 'Educator'}
                      </p>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3">
                        {course.educator?.bio || 'Experienced instructor dedicated to providing quality education.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg md:text-xl font-semibold text-white">Student Reviews</h3>
                    
                    {/* Rating Button - Only show if user is enrolled */}
                    {isLoggedIn && purchaseStatus.isEnrolled && (
                      <button
                        onClick={() => setShowRatingForm(!showRatingForm)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        {userRating ? 'Update Rating' : 'Rate Course'}
                      </button>
                    )}
                  </div>

                  {/* Rating Form */}
                  {showRatingForm && isLoggedIn && purchaseStatus.isEnrolled && (
                    <div className="mb-6">
                      <Rating
                        courseId={courseId}
                        existingRating={getUserRatingInfo().rating}
                        existingReview={getUserRatingInfo().review}
                        onRatingSubmitted={handleRatingSubmitted}
                      />
                    </div>
                  )}

                  {/* Reviews List */}
                  <ReviewsList 
                    reviews={course.ratings || []}
                    courseRating={calculateAverageRating()}
                    totalRatings={course.ratings?.length || 0}
                  />
                  
                  {/* Message for non-enrolled users */}
                  {isLoggedIn && !purchaseStatus.isEnrolled && (
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mt-6">
                      <p className="text-blue-400 text-sm text-center">
                        Enroll in this course to leave a rating and review
                      </p>
                    </div>
                  )}
                  
                  {/* Message for non-logged users */}
                  {!isLoggedIn && (
                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 mt-6">
                      <p className="text-slate-400 text-sm text-center">
                        <button
                          onClick={() => navigate('/login')}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Log in
                        </button>
                        {' '}to view all reviews and ratings
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-24 order-1 lg:order-2"
            >
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg md:rounded-2xl shadow-2xl overflow-hidden">
                {/* Course Preview Card */}
                <div className="relative">
                  <div className="aspect-video bg-slate-900/50 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-white/70" />
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  {course.isPublished ? (
                    <div className="absolute top-2 md:top-3 right-2 md:right-3">
                      <span className="px-2 md:px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        Available
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-2 md:top-3 right-2 md:right-3">
                      <span className="px-2 md:px-3 py-1 bg-yellow-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Purchase Section */}
                <div className="p-4 md:p-6">
                  {/* Price */}
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-baseline space-x-2 md:space-x-3 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-white">₹{course.price || '0'}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <>
                          <span className="text-base md:text-lg text-slate-400 line-through">₹{course.originalPrice}</span>
                          <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full">
                            {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(calculateAverageRating()) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-slate-300 text-xs md:text-sm">({course.ratings?.length || 0} reviews)</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {!isLoggedIn ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 md:py-4 font-semibold rounded-lg md:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 text-sm md:text-base"
                      >
                        Login to Enroll
                      </button>
                    ) : purchaseStatus.loading ? (
                      <button
                        disabled
                        className="w-full py-3 md:py-4 font-semibold rounded-lg md:rounded-xl bg-slate-700 text-slate-400 cursor-not-allowed text-sm md:text-base"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Checking...</span>
                        </div>
                      </button>
                    ) : purchaseStatus.isEnrolled ? (
                      <button
                        onClick={handleExplore}
                        className="w-full py-3 md:py-4 font-semibold rounded-lg md:rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25 text-sm md:text-base"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Continue Learning</span>
                        </div>
                      </button>
                    ) : course.isPublished ? (
                      <div className="space-y-2">
                        <StripeCheckoutButton
                          course={course}
                          buttonText="Enroll Now"
                          className="w-full py-3 md:py-4 font-semibold rounded-lg md:rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25 text-sm md:text-base"
                        />
                        
                      </div>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 md:py-4 font-semibold rounded-lg md:rounded-xl bg-slate-700 text-slate-400 cursor-not-allowed text-sm md:text-base"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-slate-900/50 rounded-lg md:rounded-xl">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-white">{course.chapters?.length || 0}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Chapters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-white">{course.chapters?.reduce((total, chapter) => total + (chapter.chapterContent?.length || 0), 0) || 0}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Lectures</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-white">{course.enrolledStudents?.length || 0}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-white">{course.level || 'All'}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Level</div>
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center space-x-2 text-sm md:text-base">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span>What's included:</span>
                    </h4>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center space-x-3 text-slate-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Play className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
                        </div>
                        <span className="text-xs md:text-sm">{course.chapters?.reduce((total, chapter) => total + (chapter.chapterContent?.length || 0), 0) || 0} HD video lectures</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Download className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
                        </div>
                        <span className="text-xs md:text-sm">Downloadable resources</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-slate-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Smartphone className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-400" />
                        </div>
                        <span className="text-xs md:text-sm">Mobile & desktop access</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-300">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-cyan-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Globe className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400" />
                        </div>
                        <span className="text-xs md:text-sm">Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;