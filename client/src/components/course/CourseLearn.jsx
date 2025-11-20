import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  FileText,
  Lock,
  Clock,
  BookOpen,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { getCourseById } from '../../Api/courseApi';
import { checkCoursePurchase, getCourseProgress, updateCourseProgress, downloadCourseCertificate } from '../../Api/userApi';
import { getLectureWithAccess } from '../../Api/lectureApi';
import { useAuth } from '../../context/AuthContext';
import VideoAIChatBot from '../Video/VideoAIChatBot';
import './CourseLearn.css';

const CourseLearn = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  // Course and content state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  
  // Current learning state
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [currentVideoData, setCurrentVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); // Start closed on tablets and mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSize, setVideoSize] = useState('normal'); // 'small', 'normal', 'large'

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarCollapsed(false); // Don't collapse on mobile, just overlay
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Video size control
  const getVideoContainerClass = () => {
    // On mobile, always use full available space
    if (isMobile) {
      return 'h-full max-h-full';
    }
    
    switch (videoSize) {
      case 'small':
        return 'h-48 md:h-64 max-h-64';
      case 'normal':
        return 'h-64 md:h-96 max-h-96';
      case 'large':
        return 'h-full';
      default:
        return 'h-64 md:h-96 max-h-96';
    }
  };

  // Check access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      try {
        console.log('Checking access for course:', courseId);
        const response = await checkCoursePurchase(courseId);
        console.log('Access check response:', response);
        
        if (response.success && response.isEnrolled) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setError('You need to purchase this course to access the content.');
        }
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
        setError('Failed to verify course access.');
      } finally {
        setAccessLoading(false);
      }
    };

    checkAccess();
  }, [courseId, isLoggedIn, navigate]);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!hasAccess) return;
      
      try {
        setLoading(true);
        console.log('Fetching course data for:', courseId);
        const response = await getCourseById(courseId);
        
        if (response.success && response.course) {
          setCourse(response.course);
          console.log('Course data loaded:', response.course);
          console.log('Chapters:', response.course.chapters);
          if (response.course.chapters && response.course.chapters.length > 0) {
            console.log('First chapter content:', response.course.chapters[0]);
          }
        } else {
          setError('Course not found');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, hasAccess]);

  // Load user's saved progress for this course
  useEffect(() => {
    const loadProgress = async () => {
      // Wait for all required data to be available
      if (!hasAccess || !courseId || !course || !course.chapters || course.chapters.length === 0) {
        console.log('Waiting for course data before loading progress...');
        return;
      }

      try {
        console.log('Loading progress for course:', courseId);
        console.log('Course structure ready:', course.chapters.length, 'chapters');
        const res = await getCourseProgress(courseId);
        console.log('Progress API response:', res);
        
        if (res && res.success) {
          const { completedLectures = [], lastPosition } = res.data || {};
          console.log('Server completed lectures (raw):', JSON.stringify(completedLectures, null, 2));

          const completedSet = new Set();
          
          // Handle completed lectures array
          if (Array.isArray(completedLectures)) {
            completedLectures.forEach((item, index) => {
              console.log(`Processing completion item ${index}:`, JSON.stringify(item, null, 2));
              
              // Handle lecture completion objects with indices (fallback method)
              if (typeof item === 'object' && typeof item.chapter === 'number' && typeof item.lecture === 'number') {
                const key = `${item.chapter}-${item.lecture}`;
                completedSet.add(key);
                console.log('Added completion key from indices:', key);
              }
              
              // Handle completion objects with lectureId - map to chapter/lecture indices
              if (item.lectureId) {
                const lectureId = item.lectureId;
                console.log('Looking for lecture ID:', lectureId, 'in course structure');
                
                // Find this lecture in the course structure
                let found = false;
                course.chapters?.forEach((chapter, chapterIndex) => {
                  if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach((lecture, lectureIndex) => {
                      if (lecture && lecture._id === lectureId) {
                        const key = `${chapterIndex}-${lectureIndex}`;
                        completedSet.add(key);
                        console.log(`✓ Mapped lecture ID ${lectureId} to completion key:`, key);
                        found = true;
                      }
                    });
                  }
                });
                
                if (!found) {
                  console.warn('Could not find lecture ID in course structure:', lectureId);
                  console.warn('Available course structure:', course.chapters.map(ch => ({ 
                    chapterContent: ch.chapterContent?.map(lec => lec._id) || [] 
                  })));
                }
              }
            });
          }

          console.log('Final completed set:', Array.from(completedSet));
          setCompletedLectures(completedSet);

          // Restore last position if available
          if (lastPosition && typeof lastPosition.chapter === 'number' && typeof lastPosition.lecture === 'number') {
            console.log('Restoring last position:', lastPosition);
            setCurrentChapter(lastPosition.chapter);
            setCurrentLecture(lastPosition.lecture);
          }
        }
      } catch (err) {
        console.error('Failed to load course progress:', err);
        // If no progress found, start fresh - don't show error
      }
    };

    loadProgress();
  }, [hasAccess, courseId, course?.chapters]);

  // Load current lecture video
  useEffect(() => {
    const loadCurrentLecture = async () => {
      if (!course?.chapters?.[currentChapter]?.chapterContent?.[currentLecture]) return;

      const lectureId = course.chapters[currentChapter].chapterContent[currentLecture]._id;
      if (!lectureId) return;

      try {
        setVideoLoading(true);
        console.log('Loading lecture:', lectureId);
        const response = await getLectureWithAccess(lectureId);
        
        if (response.success) {
          setCurrentVideoData(response.lecture);
          console.log('Lecture loaded:', response.lecture);
        } else {
          console.error('Failed to load lecture:', response.message);
        }
      } catch (error) {
        console.error('Error loading lecture:', error);
      } finally {
        setVideoLoading(false);
      }
    };

    loadCurrentLecture();
  }, [course, currentChapter, currentLecture]);

  // Navigation functions
  const goToPreviousLecture = useCallback(() => {
    if (currentLecture > 0) {
      setCurrentLecture(currentLecture - 1);
    } else if (currentChapter > 0 && course?.chapters) {
      const prevChapter = course.chapters[currentChapter - 1];
      setCurrentChapter(currentChapter - 1);
      setCurrentLecture((prevChapter.chapterContent?.length || 1) - 1);
    }
  }, [currentLecture, currentChapter, course?.chapters]);

  const goToNextLecture = useCallback(() => {
    if (!course?.chapters) return;
    const currentChapterLectures = course.chapters[currentChapter]?.chapterContent || [];
    if (currentLecture + 1 < currentChapterLectures.length) {
      setCurrentLecture(currentLecture + 1);
    } else if (currentChapter + 1 < course.chapters.length) {
      setCurrentChapter(currentChapter + 1);
      setCurrentLecture(0);
    }
  }, [currentLecture, currentChapter, course?.chapters]);

  const canGoPrevious = useCallback(() => {
    return currentChapter > 0 || currentLecture > 0;
  }, [currentChapter, currentLecture]);

  const canGoNext = useCallback(() => {
    if (!course?.chapters) return false;
    const currentChapterLectures = course.chapters[currentChapter]?.chapterContent || [];
    return (currentLecture + 1 < currentChapterLectures.length) || 
           (currentChapter + 1 < course.chapters.length);
  }, [currentLecture, currentChapter, course?.chapters]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!hasAccess) return;
      
      try {
        setLoading(true);
        const response = await getCourseById(courseId);
        if (response.success && response.course) {
          setCourse(response.course);
        } else {
          setError('Course not found or access denied');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, hasAccess]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts when not typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (canGoPrevious()) {
            e.preventDefault();
            goToPreviousLecture();
          }
          break;
        case 'ArrowRight':
          if (canGoNext()) {
            e.preventDefault();
            goToNextLecture();
          }
          break;
        case ' ': // Spacebar
          e.preventDefault();
          const video = document.querySelector('video');
          if (video) {
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            setSidebarOpen(!sidebarOpen);
          }
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.altKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoPrevious, canGoNext, sidebarOpen, isFullscreen, toggleFullscreen]);

  // Handle lecture completion (persist to server)
  const markLectureComplete = async (chapterIndex, lectureIndex) => {
    const lectureKey = `${chapterIndex}-${lectureIndex}`;
    console.log('Marking lecture complete:', lectureKey);

    // Check if already completed
    if (completedLectures.has(lectureKey)) {
      console.log('Lecture already completed:', lectureKey);
      return;
    }

    // Get the actual lecture ID from the course data
    const lecture = course?.chapters?.[chapterIndex]?.chapterContent?.[lectureIndex];
    if (!lecture || !lecture._id) {
      console.error('Cannot find lecture ID for completion');
      return;
    }

    // Get chapter ID
    const chapter = course?.chapters?.[chapterIndex];
    const chapterId = chapter?._id;

    // Optimistic update locally
    setCompletedLectures(prev => {
      const newSet = new Set([...prev, lectureKey]);
      console.log('Updated completed lectures locally:', Array.from(newSet));
      return newSet;
    });

    // Persist progress to server
    try {
      const progressData = {
        lectureId: lecture._id,
        chapterId: chapterId,
        chapter: chapterIndex,
        lecture: lectureIndex
      };
      
      console.log('Sending progress update:', progressData);
      const response = await updateCourseProgress(courseId, progressData);
      console.log('Progress update response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update progress');
      }
    } catch (err) {
      console.error('Failed to persist lecture completion:', err);
      // Rollback optimistic update on error
      setCompletedLectures(prev => {
        const newSet = new Set(prev);
        newSet.delete(lectureKey);
        console.log('Rolled back completion due to error');
        return newSet;
      });
      
      // Optionally show error to user
      alert('Failed to save progress. Please try again.');
      return;
    }

    // Auto-advance to next lecture only after successful save
    const currentChapterLectures = course.chapters[chapterIndex]?.chapterContent || [];
    if (lectureIndex + 1 < currentChapterLectures.length) {
      setTimeout(() => setCurrentLecture(lectureIndex + 1), 500); // Small delay for better UX
    } else if (chapterIndex + 1 < course.chapters.length) {
      setTimeout(() => {
        setCurrentChapter(chapterIndex + 1);
        setCurrentLecture(0);
      }, 500);
    }
  };

  // Get current lecture data
  const getCurrentLecture = () => {
    if (!course?.chapters?.[currentChapter]?.chapterContent?.[currentLecture]) {
      return null;
    }
    return course.chapters[currentChapter].chapterContent[currentLecture];
  };

  // Persist last watched position (debounced)
  useEffect(() => {
    if (!hasAccess || !courseId) return;

    const timer = setTimeout(async () => {
      try {
        await updateCourseProgress(courseId, {
          lastPosition: { chapter: currentChapter, lecture: currentLecture }
        });
      } catch (err) {
        console.error('Failed to persist last position:', err);
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [currentChapter, currentLecture, courseId, hasAccess]);

  // Calculate progress
  const getProgress = () => {
    if (!course?.chapters) return 0;
    
    const totalLectures = course.chapters.reduce((total, chapter) => 
      total + (chapter.chapterContent?.length || 0), 0
    );
    
    const progressPercentage = totalLectures > 0 ? (completedLectures.size / totalLectures) * 100 : 0;
    console.log(`Progress calculation: ${completedLectures.size}/${totalLectures} = ${progressPercentage.toFixed(1)}%`);
    return progressPercentage;
  };

  const isLectureCompleted = (chapterIndex, lectureIndex) => {
    const key = `${chapterIndex}-${lectureIndex}`;
    const isCompleted = completedLectures.has(key);
    console.log(`Checking completion for ${key}:`, isCompleted, 'Current completed:', Array.from(completedLectures));
    return isCompleted;
  };

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            {accessLoading ? 'Verifying access...' : 'Loading course content...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-8">
            <h2 className="text-red-400 text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Back to Course Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-screen bg-slate-950 flex overflow-hidden ${isFullscreen ? 'bg-black' : ''}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: !sidebarOpen ? 0 : sidebarCollapsed ? 60 : isMobile ? '100vw' : 320,
          opacity: !sidebarOpen ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden relative ${
          sidebarOpen && isMobile ? 'fixed inset-0 z-50' : ''
        }`}
      >
        {/* Collapse/Expand Toggle */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 right-2 z-10 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all duration-200 hidden md:block"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {!sidebarCollapsed && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 md:p-6 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="flex items-center text-slate-400 hover:text-white transition-colors text-sm md:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Course</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-white font-semibold mb-2 line-clamp-2 text-sm md:text-base">{course?.title}</h2>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs md:text-sm text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getProgress())}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress()}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                  />
                </div>
                {Math.round(getProgress()) === 100 && (
                  <button
                    onClick={async () => {
                      try {
                        await downloadCourseCertificate(courseId, 'pdf');
                      } catch (e) {
                        alert('Could not download certificate.');
                      }
                    }}
                    className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
                  >
                    Download Certificate (PDF)
                  </button>
                )}
              </div>
              
              <p className="text-slate-400 text-xs md:text-sm">
                {completedLectures.size} of {course?.chapters?.reduce((total, chapter) => total + (chapter.chapterContent?.length || 0), 0)} lectures completed
              </p>
            </div>

            {/* Course Content */}
            <div className="flex-1 overflow-y-auto">
              {course?.chapters?.map((chapter, chapterIndex) => (
                <div key={chapter._id} className="border-b border-slate-800">
                  <div className="p-3 md:p-4">
                    <h3 className="text-white font-medium mb-3 text-sm md:text-base">
                      <span className="hidden sm:inline">Chapter {chapterIndex + 1}: </span>
                      <span className="sm:hidden">Ch {chapterIndex + 1}: </span>
                      {chapter.chapterTitle}
                    </h3>
                    
                    <div className="space-y-2">
                      {chapter.chapterContent?.map((lecture, lectureIndex) => {
                        const isCompleted = isLectureCompleted(chapterIndex, lectureIndex);
                        const isCurrent = currentChapter === chapterIndex && currentLecture === lectureIndex;
                        
                        return (
                          <motion.button
                            key={lecture._id}
                            onClick={() => {
                              setCurrentChapter(chapterIndex);
                              setCurrentLecture(lectureIndex);
                              // Close sidebar on mobile after selection
                              if (isMobile) {
                                setSidebarOpen(false);
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left p-2 md:p-3 rounded-lg transition-all duration-200 ${
                              isCurrent
                                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                                : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <div className="flex-shrink-0 relative">
                                {isCompleted ? (
                                  <div className="relative">
                                    <Circle className="w-4 h-4 md:w-5 md:h-5 text-green-500" fill="currentColor" />
                                    <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-white absolute top-0.5 left-0.5 md:top-1 md:left-1" />
                                  </div>
                                ) : isCurrent ? (
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                  >
                                    <Circle className="w-4 h-4 md:w-5 md:h-5 text-blue-400 fill-blue-400/20" />
                                    <Play className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400 absolute top-0.5 left-1 md:top-1 md:left-1.5" />
                                  </motion.div>
                                ) : (
                                  <Circle className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                                )}
                                
                                {/* Lecture number */}
                                <span className="absolute -top-1 -right-1 text-xs bg-slate-700 text-slate-300 rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center text-[8px] md:text-[10px]">
                                  {lectureIndex + 1}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-2 text-xs md:text-sm">
                                  {lecture.title}
                                </p>
                                <div className="flex items-center space-x-2 md:space-x-3 text-[10px] md:text-xs text-slate-500 mt-1">
                                  <span className="flex items-center">
                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                                    {lecture.duration || '5 min'}
                                  </span>
                                  {lecture.type && (
                                    <span className="flex items-center">
                                      {lecture.type === 'video' ? (
                                        <Play className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                                      ) : (
                                        <FileText className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                                      )}
                                      <span className="hidden sm:inline">{lecture.type}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Collapsed Sidebar Content */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Course"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Progress Circle */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - getProgress() / 100)}`}
                  className="text-green-500 transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                {Math.round(getProgress())}%
              </span>
            </div>
            
            {/* Current Lecture Indicator */}
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Current</div>
              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                <span className="text-xs text-blue-400">{currentLecture + 1}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Menu className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-semibold text-sm md:text-base truncate">
                  {currentVideoData?.title || 'Select a lecture'}
                </h1>
                <p className="text-slate-400 text-xs md:text-sm">
                  <span className="hidden sm:inline">Chapter {currentChapter + 1} - Lecture {currentLecture + 1}</span>
                  <span className="sm:hidden">Ch {currentChapter + 1} - L {currentLecture + 1}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0">
              {/* Video Size Controls - Hidden on small screens */}
              <div className="hidden md:flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setVideoSize('small')}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded transition-colors ${
                    videoSize === 'small' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setVideoSize('normal')}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded transition-colors ${
                    videoSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setVideoSize('large')}
                  className={`px-2 md:px-3 py-1 md:py-1.5 text-xs rounded transition-colors ${
                    videoSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Large
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
              </button>

              {/* Notes Toggle - Hidden on small screens */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-1.5 md:p-2 rounded-lg transition-colors hidden md:block ${
                  showNotes ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              {/* Settings - Hidden on small screens */}
              <button className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Navigation Controls */}
              <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4">
                <button
                  onClick={goToPreviousLecture}
                  disabled={!canGoPrevious()}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    canGoPrevious() 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Previous Lecture"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={goToNextLecture}
                  disabled={!canGoNext()}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    canGoNext() 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Next Lecture"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video/Content Area */}
        <div className="flex-1 flex flex-col">
          <div className={`flex-1 bg-black relative flex items-center justify-center ${!isFullscreen && videoSize !== 'large' ? 'py-2 md:py-8' : ''}`}>
            {accessLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-sm md:text-base">Verifying access...</p>
                </div>
              </div>
            ) : !hasAccess ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="text-center text-white max-w-md mx-auto">
                  <Lock className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Access Denied</h3>
                  <p className="text-slate-300 mb-4 text-sm md:text-base">{error || 'You need to purchase this course to access the content.'}</p>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base"
                  >
                    Back to Course
                  </button>
                </div>
              </div>
            ) : videoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-sm md:text-base">Loading lecture...</p>
                </div>
              </div>
            ) : currentVideoData ? (
              <div className={`w-full ${getVideoContainerClass()} max-w-6xl mx-auto px-2 md:px-0`}>
                {currentVideoData.videoUrl ? (
                  <div className="w-full h-full relative rounded-lg overflow-hidden shadow-2xl">
                    {/* Video Player */}
                    <video
                      ref={videoRef}
                      key={currentVideoData._id}
                      className="w-full h-full object-contain bg-black"
                      controls
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => {
                        setIsVideoPlaying(false);
                        markLectureComplete(currentChapter, currentLecture);
                      }}
                      poster={course?.thumbnail}
                    >
                      <source src={currentVideoData.videoUrl} type="video/mp4" />
                      <source src={currentVideoData.videoUrl} type="video/webm" />
                      <source src={currentVideoData.videoUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Overlay Information */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className=""
                    >
                      <h3 className="font-semibold text-base md:text-lg mb-1">{currentVideoData.title}</h3>
                      <p className="text-xs md:text-sm text-slate-300">
                        <span className="hidden sm:inline">Chapter {currentChapter + 1}, Lecture {currentLecture + 1}</span>
                        <span className="sm:hidden">Ch {currentChapter + 1}, L {currentLecture + 1}</span>
                        {currentVideoData.duration && ` • ${currentVideoData.duration}`}
                      </p>
                    </motion.div>

                    {/* Enhanced Mark Complete Button */}
                    {!isLectureCompleted(currentChapter, currentLecture) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-2 md:bottom-4 right-2 md:right-4"
                      >
                        <button
                          onClick={() => markLectureComplete(currentChapter, currentLecture)}
                          className="group flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 md:py-3 bg-green-600/90 hover:bg-green-600 text-white rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-green-500/25 text-xs md:text-sm"
                        >
                          <Circle className="w-4 h-4 md:w-5 md:h-5 group-hover:hidden" />
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 hidden group-hover:block" />
                          <span className="font-medium hidden sm:inline">Mark Complete</span>
                          <span className="font-medium sm:hidden">Complete</span>
                        </button>
                      </motion.div>
                    )}

                    {/* Completed Indicator */}
                    {isLectureCompleted(currentChapter, currentLecture) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-2 md:bottom-4 right-2 md:right-4"
                      >
                        <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 md:py-3 bg-green-600/90 text-white rounded-full backdrop-blur-sm shadow-lg text-xs md:text-sm">
                          <div className="relative">
                            <Circle className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600 absolute top-0.5 left-0.5 md:top-1 md:left-1" />
                          </div>
                          <span className="font-medium hidden sm:inline">Completed</span>
                          <span className="font-medium sm:hidden">Done</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Video Controls Enhancement */}
                    <div className="absolute bottom-12 md:bottom-16 left-2 md:left-4 flex items-center space-x-2">
                      {canGoPrevious() && (
                        <button
                          onClick={goToPreviousLecture}
                          className="p-1.5 md:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                          title="Previous Lecture"
                        >
                          <SkipBack className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                      {canGoNext() && (
                        <button
                          onClick={goToNextLecture}
                          className="p-1.5 md:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                          title="Next Lecture"
                        >
                          <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fallback for lectures without video */
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center p-4">
                    <div className="text-center max-w-sm mx-auto">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <FileText className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                      </div>
                      <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                        {getCurrentLecture()?.title || 'Lecture Content'}
                      </h3>
                      <p className="text-slate-400 mb-4 text-sm md:text-base">
                        This lecture contains text content or resources
                      </p>
                      
                      {/* Enhanced Mark Complete for Text Lectures */}
                      {!isLectureCompleted(currentChapter, currentLecture) ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markLectureComplete(currentChapter, currentLecture)}
                          className="group flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 shadow-lg mx-auto text-sm md:text-base"
                        >
                          <Circle className="w-4 h-4 md:w-5 md:h-5 group-hover:hidden" />
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 hidden group-hover:block" />
                          <span className="font-medium">Mark as Complete</span>
                        </motion.button>
                      ) : (
                        <div className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-green-600/90 text-white rounded-full shadow-lg mx-auto w-fit text-sm md:text-base">
                          <div className="relative">
                            <Circle className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600 absolute top-0.5 left-0.5 md:top-1 md:left-1" />
                          </div>
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-slate-400 text-lg md:text-xl">Select a lecture to start learning</h3>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Panel - Only visible on larger screens */}
        {showNotes && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex w-80 bg-slate-900 border-l border-slate-800 p-6 flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 flex-1">
              <textarea
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                placeholder="Take notes while learning..."
              />
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">
                Save Notes
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Video Chat Bot - Always visible on large screens */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-50">
        <VideoAIChatBot videoTitle={currentVideoData?.title} videoId={currentVideoData?._id} />
      </div>
    </div>
  );
};

export default CourseLearn;
