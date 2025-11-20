import api from './config.js';

// Video API functions
export const uploadVideo = async (videoFile) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  
  const res = await api.post("/video/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Image upload API function
export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const res = await api.post("/video/upload-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};