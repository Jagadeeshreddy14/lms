import api from './config.js';

//  Get User Profile
export const getUserProfile = async () => {
  try {
    const res = await api.get("/user/profile");
    return res.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error; // rethrow so UI can handle it
  }
};

//  Update User Profile
export const updateUserProfile = async (profileData) => {
  try {
    const res = await api.put("/user/profile", profileData);
    return res.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

//  Upload Profile Picture
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const res = await api.post("/user/profile/upload-avatar", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

//  Purchase a Course
export const purchaseCourse = async (courseId) => {
  try {
    const res = await api.post(`/user/purchase/${courseId}`);
    return res.data;
  } catch (error) {
    console.error(`Error purchasing course ${courseId}:`, error);
    throw error;
  }
};

//  Update Course Progress
export const updateCourseProgress = async (courseId, progressData) => {
  try {
    const res = await api.put(`/user/progress/${courseId}`, progressData);
    return res.data;
  } catch (error) {
    console.error(`Error updating progress for course ${courseId}:`, error);
    throw error;
  }
};

//  Get Course Progress
export const getCourseProgress = async (courseId) => {
  try {
    const res = await api.get(`/user/progress/${courseId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching progress for course ${courseId}:`, error);
    throw error;
  }
};

//  Rate Course
export const rateCourse = async (courseId, ratingData) => {
  try {
    const res = await api.post(`/user/rating/${courseId}`, ratingData);
    return res.data;
  } catch (error) {
    console.error(`Error rating course ${courseId}:`, error);
    throw error;
  }
};

//  Check Course Purchase Status
export const checkCoursePurchase = async (courseId) => {
  try {
    const res = await api.get(`/user/purchase-status/${courseId}`);
    return res.data;
  } catch (error) {
    console.error(`Error checking purchase status for course ${courseId}:`, error);
    throw error;
  }
};

//  Get User's Enrolled Courses with Progress
export const getEnrolledCourses = async () => {
  try {
    const res = await api.get("/user/enrolled-courses");
    return res.data;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};

//  Get Course Certificate (SVG download)
export const downloadCourseCertificate = async (courseId, format = 'pdf') => {
  const isPdf = String(format).toLowerCase() === 'pdf';
  const res = await api.get(`/user/certificate/${courseId}?format=${isPdf ? 'pdf' : 'svg'}`, { responseType: 'blob' });
  const mime = isPdf ? 'application/pdf' : 'image/svg+xml';
  const ext = isPdf ? 'pdf' : 'svg';
  const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${courseId}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return true;
};

//  Get User Stats (enrolled, completed courses, study hours, etc.)
export const getUserStats = async () => {
  try {
    const res = await api.get("/user/stats");
    return res.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

// Get All Students and Educators
export const getAllStudentsAndEducators = async () => {
  try {
    const res = await api.get("/user/all-students-and-educators");

    console.log("All Students and Educators:", res.data);

    return res.data;
  } catch (error) {
    console.error("Error fetching all students and educators:", error);
    throw error;
  }
};