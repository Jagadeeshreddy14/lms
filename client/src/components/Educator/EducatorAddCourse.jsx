import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  BookOpen,
  Video,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash,
  X,
  Upload,
  PlayCircle,
  AlertCircle,
  Check,
  ImageIcon
} from 'lucide-react';

import { createCourse, toggleCourse } from '../../Api/courseApi.js';
import { createChapter } from '../../Api/chapterApi.js';
import { createLecture } from '../../Api/lectureApi.js';
import { uploadVideo, uploadImage } from '../../Api/videoApi.js';

export default function EducatorAddCourse() {
  const navigate = useNavigate();
  
  // Debug logging
  console.log('EducatorAddCourse component loaded');
  
  // Multi-step form state
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course data state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: 0,
    duration: 0,
    thumbnail: '',
    requirements: [''],
    whatYouWillLearn: ['']
  });

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);

  // Chapters and lectures state
  const [chapters, setChapters] = useState([]);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    videoUrl: '',
    videoFile: null,
    duration: '',
    order: 1,
    isUploading: false,
    uploadProgress: 0
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Helper functions
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!courseData.title.trim()) newErrors.title = 'Course title is required';
      if (!courseData.description.trim()) newErrors.description = 'Course description is required';
      if (!courseData.category) newErrors.category = 'Category is required';
      if (!courseData.level) newErrors.level = 'Level is required';
      if (courseData.price < 0) newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Chapter management
  const addChapter = () => {
    const newChapter = {
      id: Date.now().toString(),
      title: '',
      description: '',
      lectures: [],
      order: chapters.length + 1
    };
    console.log('Adding new chapter:', newChapter);
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (chapterId) => {
    console.log('Removing chapter:', chapterId);
    setChapters(chapters.filter(ch => ch.id !== chapterId));
  };

  const updateChapter = (chapterId, field, value) => {
    console.log('Updating chapter:', chapterId, field, value);
    setChapters(chapters.map(ch => 
      ch.id === chapterId ? { ...ch, [field]: value } : ch
    ));
  };

  // Lecture management
  const addLecture = async (chapterId) => {
    if (!lectureForm.title.trim()) {
      setError('Please enter lecture title');
      return;
    }

    let videoUrl = lectureForm.videoUrl;

    // Upload video if file is selected
    if (lectureForm.videoFile && !videoUrl) {
      try {
        console.log('Uploading video file:', lectureForm.videoFile.name);
        setLectureForm(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
        
        const uploadResponse = await uploadVideo(lectureForm.videoFile);
        console.log('Video upload response:', uploadResponse);
        
        if (uploadResponse.success) {
          videoUrl = uploadResponse.videoUrl;
          console.log('Video uploaded successfully, URL:', videoUrl);
          
          // Update duration if available
          if (uploadResponse.duration) {
            setLectureForm(prev => ({ ...prev, duration: uploadResponse.duration.toString() }));
          }
        } else {
          throw new Error(uploadResponse.message || 'Upload failed');
        }
      } catch (err) {
        console.error('Video upload error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to upload video');
        setLectureForm(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
        return;
      }
    }

    if (!videoUrl) {
      setError('Please provide video URL or upload a video file');
      return;
    }

    console.log('Adding lecture to chapter:', chapterId);
    console.log('Lecture form data:', lectureForm);

    const newLecture = {
      id: Date.now().toString(),
      title: lectureForm.title,
      videoUrl: videoUrl,
      duration: lectureForm.duration || '0',
      order: lectureForm.order || 1
    };

    console.log('New lecture object:', newLecture);

    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? { ...ch, lectures: [...ch.lectures, newLecture] }
        : ch
    ));

    console.log('Lecture added to chapter successfully');

    // Reset form
    setLectureForm({
      title: '',
      videoUrl: '',
      videoFile: null,
      duration: '',
      order: 1,
      isUploading: false,
      uploadProgress: 0
    });
    setEditingLecture(null);
    setError('');
  };

  const removeLecture = (chapterId, lectureId) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? { ...ch, lectures: ch.lectures.filter(lec => lec.id !== lectureId) }
        : ch
    ));
  };

  // Requirements and learning outcomes
  const addRequirement = () => {
    setCourseData({
      ...courseData,
      requirements: [...courseData.requirements, '']
    });
  };

  const removeRequirement = (index) => {
    setCourseData({
      ...courseData,
      requirements: courseData.requirements.filter((_, i) => i !== index)
    });
  };

  const addLearningItem = () => {
    setCourseData({
      ...courseData,
      whatYouWillLearn: [...courseData.whatYouWillLearn, '']
    });
  };

  const removeLearningItem = (index) => {
    setCourseData({
      ...courseData,
      whatYouWillLearn: courseData.whatYouWillLearn.filter((_, i) => i !== index)
    });
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log('Uploading thumbnail image:', file.name);
        setImageUploading(true);
        setError('');
        
        const uploadResponse = await uploadImage(file);
        console.log('Image upload response:', uploadResponse);
        
        if (uploadResponse.success) {
          setCourseData({...courseData, thumbnail: uploadResponse.imageUrl});
          console.log('Thumbnail uploaded successfully:', uploadResponse.imageUrl);
        } else {
          throw new Error(uploadResponse.message || 'Image upload failed');
        }
      } catch (err) {
        console.error('Image upload error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to upload thumbnail image');
      } finally {
        setImageUploading(false);
      }
    }
  };

  // Save course
  const handleSaveCourse = async (isPublished = false) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate basic info
      if (!validateStep(1)) {
        setActiveStep(1);
        setIsLoading(false);
        return;
      }

      // Validate chapters and lectures for published courses
      if (isPublished) {
        if (chapters.length === 0) {
          setError('Please add at least one chapter before publishing the course.');
          setActiveStep(2);
          setIsLoading(false);
          return;
        }

        const hasLectures = chapters.some(chapter => 
          chapter.lectures && chapter.lectures.length > 0
        );

        if (!hasLectures) {
          setError('Please add at least one lecture to your chapters before publishing the course.');
          setActiveStep(2);
          setIsLoading(false);
          return;
        }
      }

      console.log('Starting course creation process...');
      console.log('Course Data:', courseData);
      console.log('Chapters Array:', chapters);
      console.log('Chapters Length:', chapters.length);

      // Debug each chapter
      chapters.forEach((chapter, index) => {
        console.log(`Chapter ${index + 1}:`, {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          lectures: chapter.lectures,
          lecturesCount: chapter.lectures?.length || 0
        });
      });

      // Step 1: Create the basic course
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price || 0,
        discount: 0,
        thumbnail: courseData.thumbnail || '',
        totalDuration: courseData.duration || 1, // Default to 1 hour if not specified
      };

      console.log('Creating course with payload:', coursePayload);
      const courseResponse = await createCourse(coursePayload);
      console.log('Course creation response:', courseResponse);
      
      if (!courseResponse.success) {
        throw new Error(courseResponse.message || 'Failed to create course');
      }

      const courseId = courseResponse.course._id;
      console.log('Course created successfully with ID:', courseId);

      // Check if there are chapters to create
      if (chapters.length === 0) {
        console.log('No chapters found, skipping chapter/lecture creation');
        if (isPublished) {
          try {
            console.log('Publishing course...');
            const toggleResponse = await toggleCourse(courseId);
            console.log('Toggle course response:', toggleResponse);
            
            if (toggleResponse.success) {
              setSuccess('Course created and published successfully!');
            } else {
              console.warn('Course created but failed to publish:', toggleResponse.message);
              setSuccess('Course created successfully but failed to publish. You can publish it later from your dashboard.');
            }
          } catch (toggleErr) {
            console.error('Toggle course error:', toggleErr);
            setSuccess('Course created successfully but failed to publish. You can publish it later from your dashboard.');
          }
        } else {
          setSuccess('Course created successfully as draft!');
        }
        
        setTimeout(() => {
          navigate('/educator/dashboard');
        }, 2000);
        return;
      }

      console.log(`Found ${chapters.length} chapters to create`);

      // Step 2: Create chapters and lectures
      let createdChapters = 0;
      let createdLectures = 0;
      const errors = [];

      for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
        const chapter = chapters[chapterIndex];
        
        console.log(`Creating chapter ${chapterIndex + 1}:`, chapter);
        
        if (!chapter.title.trim()) {
          console.log(`Skipping chapter ${chapterIndex + 1} - no title`);
          errors.push(`Chapter ${chapterIndex + 1}: No title provided`);
          continue;
        }

        try {
          // Create chapter
          const chapterPayload = {
            chapterId: `chapter_${Date.now()}_${chapterIndex}`,
            chapterTitle: chapter.title,
          };

          console.log('Creating chapter with payload:', chapterPayload);
          const chapterResponse = await createChapter(courseId, chapterPayload);
          console.log('Chapter creation response:', chapterResponse);

          if (!chapterResponse.success) {
            console.error(`Failed to create chapter ${chapterIndex + 1}:`, chapterResponse.message);
            errors.push(`Chapter ${chapterIndex + 1}: ${chapterResponse.message}`);
            continue;
          }

          const chapterId = chapterResponse.chapter._id;
          console.log(`Chapter created successfully with ID: ${chapterId}`);
          createdChapters++;

          // Create lectures for this chapter
          for (let lectureIndex = 0; lectureIndex < chapter.lectures.length; lectureIndex++) {
            const lecture = chapter.lectures[lectureIndex];
            
            console.log(`Creating lecture ${lectureIndex + 1} for chapter ${chapterIndex + 1}:`, lecture);
            
            if (!lecture.title.trim() || !lecture.videoUrl.trim()) {
              console.log(`Skipping lecture ${lectureIndex + 1} - missing title or video URL`);
              errors.push(`Lecture ${lectureIndex + 1} in Chapter ${chapterIndex + 1}: Missing title or video URL`);
              continue;
            }

            try {
              // Create lecture
              const lecturePayload = {
                title: lecture.title,
                videoUrl: lecture.videoUrl,
                duration: lecture.duration.toString(), // Convert to string as expected by model
                order: lecture.order || lectureIndex + 1,
              };

              console.log('Creating lecture with payload:', lecturePayload);
              const lectureResponse = await createLecture(courseId, chapterId, lecturePayload);
              console.log('Lecture creation response:', lectureResponse);

              if (!lectureResponse.success) {
                console.error(`Failed to create lecture ${lectureIndex + 1}:`, lectureResponse.message);
                errors.push(`Lecture ${lectureIndex + 1} in Chapter ${chapterIndex + 1}: ${lectureResponse.message}`);
                continue;
              }

              console.log(`Lecture created successfully with ID: ${lectureResponse.lecture._id}`);
              createdLectures++;
            } catch (lectureErr) {
              console.error(`Error creating lecture ${lectureIndex + 1}:`, lectureErr);
              errors.push(`Lecture ${lectureIndex + 1} in Chapter ${chapterIndex + 1}: ${lectureErr.message}`);
            }
          }
        } catch (chapterErr) {
          console.error(`Error creating chapter ${chapterIndex + 1}:`, chapterErr);
          errors.push(`Chapter ${chapterIndex + 1}: ${chapterErr.message}`);
        }
      }

      console.log(`Course creation summary: ${createdChapters} chapters, ${createdLectures} lectures created`);
      if (errors.length > 0) {
        console.warn('Some items failed to create:', errors);
      }

      // Step 3: Toggle course publication if needed
      if (isPublished) {
        try {
          console.log('Publishing course...');
          const toggleResponse = await toggleCourse(courseId);
          console.log('Toggle course response:', toggleResponse);
          
          if (toggleResponse.success) {
            setSuccess(`Course created and published successfully! Created ${createdChapters} chapters and ${createdLectures} lectures.`);
          } else {
            console.warn('Course created but failed to publish:', toggleResponse.message);
            setSuccess(`Course created successfully with ${createdChapters} chapters and ${createdLectures} lectures, but failed to publish. You can publish it later from your dashboard.`);
          }
        } catch (toggleErr) {
          console.error('Toggle course error:', toggleErr);
          setSuccess(`Course created successfully with ${createdChapters} chapters and ${createdLectures} lectures, but failed to publish. You can publish it later from your dashboard.`);
        }
      } else {
        setSuccess(`Course created successfully as draft with ${createdChapters} chapters and ${createdLectures} lectures!`);
      }

      // Show any errors that occurred
      if (errors.length > 0) {
        console.warn('Some items failed to create:', errors);
        const errorSummary = errors.slice(0, 3).join('; ') + (errors.length > 3 ? '...' : '');
        setError(`Course created but some items failed: ${errorSummary}`);
      }

      console.log('Course creation process completed successfully');
      
      setTimeout(() => {
        navigate('/educator/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error in course creation process:', err);
      
      let errorMessage = 'Failed to save course. Please try again.';
      
      // Handle different error types
      if (err.response) {
        console.error('Response error:', err.response);
        // Server responded with error status
        if (err.response.data) {
          if (typeof err.response.data === 'string' && err.response.data.includes('PayloadTooLargeError')) {
            errorMessage = 'Course data is too large. Please reduce image sizes and try again.';
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = 'Server error occurred. Please try again.';
          }
        }
      } else if (err.request) {
        console.error('Request error:', err.request);
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        console.error('General error:', err.message);
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/educator/dashboard"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Create New Course
              </h1>
              <p className="text-slate-300 mt-2">
                Complete course creation with chapters and lectures
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Step Indicator */}
            <div className="hidden md:flex items-center space-x-2 mr-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    activeStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>

            <button
              onClick={() => handleSaveCourse(false)}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={() => handleSaveCourse(true)}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Publishing...' : 'Publish Course'}</span>
            </button>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${activeStep >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Basic Info</span>
            </div>
            
            <div className="w-16 h-0.5 bg-slate-700"></div>
            
            <div className={`flex items-center space-x-2 ${activeStep >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Content</span>
            </div>
            
            <div className="w-16 h-0.5 bg-slate-700"></div>
            
            <div className={`flex items-center space-x-2 ${activeStep >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 3 ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Review</span>
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </motion.div>
        )}

        {previewMode ? (
          // Preview Mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 flex items-center justify-center">
                {courseData.thumbnail ? (
                  <img src={courseData.thumbnail} alt="Course thumbnail" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-white/50" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {courseData.title || 'Course Title'}
              </h1>
              <p className="text-slate-300 max-w-2xl mx-auto">
                {courseData.description || 'Course description will appear here...'}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-white mb-4">Course Information</h2>
                <div className="space-y-4 text-slate-300">
                  <p><strong>Price:</strong> ${courseData.price || '0'}</p>
                  <p><strong>Category:</strong> {courseData.category || 'Not specified'}</p>
                  <p><strong>Level:</strong> {courseData.level || 'Not specified'}</p>
                  <p><strong>Duration:</strong> {courseData.duration || 'Not specified'} hours</p>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Course Preview</h3>
                <div className="text-slate-300 text-sm">
                  <p>This is how your course will appear to students.</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Edit Mode - Comprehensive Form
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Step 1: Basic Course Information */}
              {activeStep === 1 && (
                <motion.div
                  variants={slideInLeft}
                  initial="initial"
                  animate="animate"
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Course Information</h3>
                      <p className="text-slate-400">Basic details about your course</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Course Title */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={courseData.title}
                        onChange={(e) => {
                          console.log('Course title updated:', e.target.value);
                          setCourseData({...courseData, title: e.target.value});
                        }}
                        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Enter an engaging title for your course"
                      />
                      {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Course Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Course Description *
                      </label>
                      <textarea
                        value={courseData.description}
                        onChange={(e) => {
                          console.log('Course description updated:', e.target.value);
                          setCourseData({...courseData, description: e.target.value});
                        }}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none"
                        placeholder="Describe what students will learn in this course"
                      />
                      {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Category *
                        </label>
                        <select
                          value={courseData.category}
                          onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                          <option value="">Select Category</option>
                          <option value="programming">Programming & Development</option>
                          <option value="design">Design</option>
                          <option value="business">Business</option>
                          <option value="marketing">Marketing</option>
                          <option value="data-science">Data Science</option>
                          <option value="photography">Photography</option>
                          <option value="music">Music</option>
                          <option value="fitness">Health & Fitness</option>
                          <option value="language">Language</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                      </div>

                      {/* Level */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Level *
                        </label>
                        <select
                          value={courseData.level}
                          onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                          <option value="">Select Level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="all-levels">All Levels</option>
                        </select>
                        {errors.level && <p className="text-red-400 text-sm mt-1">{errors.level}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Price (USD) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400">$</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={courseData.price}
                            onChange={(e) => setCourseData({...courseData, price: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            placeholder="29.99"
                          />
                        </div>
                        {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={courseData.duration}
                          onChange={(e) => setCourseData({...courseData, duration: parseFloat(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                          placeholder="2.5"
                        />
                      </div>
                    </div>

                    {/* Course Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Course Thumbnail
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg hover:border-slate-500 transition-colors duration-200">
                        <div className="space-y-1 text-center">
                          {courseData.thumbnail ? (
                            <div className="relative">
                              <img
                                src={courseData.thumbnail}
                                alt="Course thumbnail"
                                className="mx-auto h-32 w-auto rounded-lg"
                              />
                              <button
                                onClick={() => setCourseData({...courseData, thumbnail: ''})}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                                disabled={imageUploading}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {imageUploading ? (
                                <div className="flex flex-col items-center">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                  <p className="text-blue-400 mt-2">Uploading thumbnail...</p>
                                </div>
                              ) : (
                                <>
                                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                  <div className="flex text-sm text-slate-400">
                                    <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 px-2 py-1">
                                      <span>Upload a file</span>
                                      <input
                                        id="thumbnail-upload"
                                        name="thumbnail-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="sr-only"
                                        disabled={imageUploading}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Course Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Course Requirements
                      </label>
                      <div className="space-y-2">
                        {courseData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={req}
                              onChange={(e) => {
                                const newReq = [...courseData.requirements];
                                newReq[index] = e.target.value;
                                setCourseData({...courseData, requirements: newReq});
                              }}
                              className="flex-1 px-4 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                              placeholder="e.g., Basic computer skills"
                            />
                            <button
                              onClick={() => removeRequirement(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addRequirement}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Requirement</span>
                        </button>
                      </div>
                    </div>

                    {/* What Students Will Learn */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        What Students Will Learn
                      </label>
                      <div className="space-y-2">
                        {courseData.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...courseData.whatYouWillLearn];
                                newItems[index] = e.target.value;
                                setCourseData({...courseData, whatYouWillLearn: newItems});
                              }}
                              className="flex-1 px-4 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                              placeholder="e.g., Build responsive web applications"
                            />
                            <button
                              onClick={() => removeLearningItem(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addLearningItem}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Learning Outcome</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Next: Course Content</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Chapters & Lectures */}
              {activeStep === 2 && (
                <motion.div
                  variants={slideInLeft}
                  initial="initial"
                  animate="animate"
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Course Content</h3>
                        <p className="text-slate-400">Organize your content into chapters and lectures</p>
                      </div>
                    </div>
                    <button
                      onClick={addChapter}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Chapter</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {chapters.map((chapter, chapterIndex) => (
                      <div key={chapter.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                        {/* Chapter Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={chapter.title}
                              onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                              className="text-lg font-semibold text-white bg-transparent border-none outline-none w-full"
                              placeholder={`Chapter ${chapterIndex + 1} Title`}
                            />
                            <textarea
                              value={chapter.description}
                              onChange={(e) => updateChapter(chapter.id, 'description', e.target.value)}
                              className="text-sm text-slate-400 bg-transparent border-none outline-none w-full mt-2 resize-none"
                              placeholder="Chapter description (optional)"
                              rows={2}
                            />
                          </div>
                          <button
                            onClick={() => removeChapter(chapter.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Lectures List */}
                        <div className="space-y-3">
                          {chapter.lectures.map((lecture, lectureIndex) => (
                            <div key={lecture.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <PlayCircle className="w-5 h-5 text-blue-400" />
                                  <div className="flex-1">
                                    <p className="text-white font-medium">{lecture.title}</p>
                                    <p className="text-slate-400 text-sm">{lecture.duration} mins</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeLecture(chapter.id, lecture.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add Lecture Form */}
                          {editingLecture === chapter.id && (
                            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Lecture Title *
                                </label>
                                <input
                                  type="text"
                                  value={lectureForm.title}
                                  onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  placeholder="Enter lecture title"
                                />
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Duration (minutes)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={lectureForm.duration}
                                    onChange={(e) => setLectureForm({...lectureForm, duration: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="10"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Order
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={lectureForm.order}
                                    onChange={(e) => setLectureForm({...lectureForm, order: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="1"
                                  />
                                </div>
                              </div>

                              {/* Video Upload/URL */}
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Video Content
                                </label>
                                <div className="space-y-3">
                                  {/* Upload Video File */}
                                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-slate-500 transition-colors duration-200">
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) => setLectureForm({...lectureForm, videoFile: e.target.files[0]})}
                                      className="hidden"
                                      id={`video-upload-${chapter.id}`}
                                    />
                                    <label htmlFor={`video-upload-${chapter.id}`} className="cursor-pointer">
                                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                      <p className="text-slate-400">
                                        {lectureForm.videoFile ? lectureForm.videoFile.name : 'Click to upload video file'}
                                      </p>
                                      <p className="text-slate-500 text-xs mt-1">MP4, WebM, AVI up to 500MB</p>
                                    </label>
                                  </div>

                                  <div className="text-center text-slate-400">OR</div>

                                  {/* Video URL */}
                                  <input
                                    type="url"
                                    value={lectureForm.videoUrl}
                                    onChange={(e) => setLectureForm({...lectureForm, videoUrl: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                  />

                                  {/* Upload Progress */}
                                  {lectureForm.isUploading && (
                                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-white text-sm">Uploading video...</span>
                                        <span className="text-slate-400 text-sm">{lectureForm.uploadProgress}%</span>
                                      </div>
                                      <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${lectureForm.uploadProgress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => setEditingLecture(null)}
                                  className="px-4 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => addLecture(chapter.id)}
                                  disabled={lectureForm.isUploading}
                                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {lectureForm.isUploading ? 'Uploading...' : 'Add Lecture'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Add Lecture Button */}
                          {editingLecture !== chapter.id && (
                            <button
                              onClick={() => setEditingLecture(chapter.id)}
                              className="w-full px-4 py-3 border-2 border-dashed border-slate-600 text-slate-400 font-medium rounded-lg hover:border-slate-500 hover:text-slate-300 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Lecture</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {chapters.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <Video className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">No chapters yet</p>
                        <p className="mb-4">Start by adding your first chapter using the "Add Chapter" button above</p>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-left max-w-md mx-auto">
                          <p className="font-medium text-blue-400 mb-2">How to structure your course:</p>
                          <ol className="space-y-1 text-slate-300">
                            <li>1. Click "Add Chapter" to create a new chapter</li>
                            <li>2. Give your chapter a title and description</li>
                            <li>3. Click "Add Lecture" within the chapter</li>
                            <li>4. Upload a video or provide a video URL</li>
                            <li>5. Repeat for all your content</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-6 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200 flex items-center space-x-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Next: Review</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Publish */}
              {activeStep === 3 && (
                <motion.div
                  variants={slideInLeft}
                  initial="initial"
                  animate="animate"
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Review & Publish</h3>
                      <p className="text-slate-400">Final review before publishing your course</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Course Summary */}
                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Course Summary</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Title:</span>
                          <span className="text-white ml-2">{courseData.title || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Price:</span>
                          <span className="text-white ml-2">${courseData.price || '0'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Category:</span>
                          <span className="text-white ml-2">{courseData.category || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Level:</span>
                          <span className="text-white ml-2">{courseData.level || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Chapters:</span>
                          <span className="text-white ml-2">{chapters.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Lectures:</span>
                          <span className="text-white ml-2">{chapters.reduce((acc, ch) => acc + ch.lectures.length, 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Overview */}
                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Content Overview</h4>
                      <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                          <div key={chapter.id} className="border-l-4 border-blue-500 pl-4">
                            <h5 className="text-white font-medium">{index + 1}. {chapter.title || `Chapter ${index + 1}`}</h5>
                            <p className="text-slate-400 text-sm">{chapter.lectures.length} lectures</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation Checklist */}
                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Publishing Checklist</h4>
                      <div className="space-y-2">
                        <div className={`flex items-center space-x-2 ${courseData.title ? 'text-green-400' : 'text-red-400'}`}>
                          {courseData.title ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>Course title provided</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${courseData.description ? 'text-green-400' : 'text-red-400'}`}>
                          {courseData.description ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>Course description provided</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${courseData.category ? 'text-green-400' : 'text-red-400'}`}>
                          {courseData.category ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>Category selected</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${courseData.price >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {courseData.price >= 0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>Price set</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${chapters.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {chapters.length > 0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one chapter added</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${chapters.some(ch => ch.lectures.length > 0) ? 'text-green-400' : 'text-red-400'}`}>
                          {chapters.some(ch => ch.lectures.length > 0) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one lecture added</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200 flex items-center space-x-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSaveCourse(false)}
                        disabled={isLoading}
                        className="px-6 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => handleSaveCourse(true)}
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isLoading ? 'Publishing...' : 'Publish Course'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Progress */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Course Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Completion</span>
                    <span className="text-white">{Math.round(((courseData.title ? 1 : 0) + (courseData.description ? 1 : 0) + (courseData.category ? 1 : 0) + (chapters.length > 0 ? 1 : 0)) / 4 * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(((courseData.title ? 1 : 0) + (courseData.description ? 1 : 0) + (courseData.category ? 1 : 0) + (chapters.length > 0 ? 1 : 0)) / 4 * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Course Statistics */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Course Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Chapters</span>
                    <span className="text-white font-medium">{chapters.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Lectures</span>
                    <span className="text-white font-medium">{chapters.reduce((acc, ch) => acc + ch.lectures.length, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Estimated Duration</span>
                    <span className="text-white font-medium">
                      {chapters.reduce((acc, ch) => 
                        acc + ch.lectures.reduce((lectureAcc, lecture) => lectureAcc + parseInt(lecture.duration || 0), 0), 0
                      )} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="w-full px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveCourse(false)}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-slate-600 text-slate-300 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};