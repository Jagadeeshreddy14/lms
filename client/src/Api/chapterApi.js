import api from './config.js';

export const createChapter = async (courseId, chapterData) => {
  try {
    const res = await api.post(`/chapter/${courseId}`, chapterData);
    return res.data;
  } catch (error) {
    console.log("Create chapter error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const deleteChapter = async (chapterId) => {
  try {
    const res = await api.delete(`/chapter/${chapterId}`);
    return res.data;
  } catch (error) {
    console.log("Delete chapter error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const getChapterById = async (chapterId) => {
  try {
    const res = await api.get(`/chapter/${chapterId}`);
    return res.data;
  } catch (error) {
    console.log("Get chapter error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const getChaptersByCourse = async (courseId) => {
  try {
    const res = await api.get(`/chapter/course/${courseId}`);
    return res.data;
  } catch (error) {
    console.log("Get chapters by course error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};