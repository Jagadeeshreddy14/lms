import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleaare.js';
import { upload, uploadVideoToCloudinary, uploadImageToCloudinary } from '../config/multer.js';

const videoRouter = express.Router();

// Upload video endpoint
videoRouter.post('/upload', authenticate, authorize('educator'), upload.single('video'), async (req, res) => {
  try {
    console.log('Video upload request received');
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.log('No video file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Additional validation
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (req.file.size > maxSize) {
      console.log(`File too large: ${req.file.size} bytes`);
      return res.status(400).json({
        success: false,
        message: 'Video file size must be less than 1GB'
      });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('video/')) {
      console.log(`Invalid file type: ${req.file.mimetype}`);
      return res.status(400).json({
        success: false,
        message: 'Only video files are allowed'
      });
    }

    // Sanitize filename for Cloudinary public_id
    const sanitizedName = req.file.originalname
      .split('.')[0] // Remove file extension
      .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace invalid characters with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 50); // Limit length to 50 characters
    
    const fileName = `video_${Date.now()}_${sanitizedName}`;
    console.log('Uploading to Cloudinary with filename:', fileName);
    
    // Upload to Cloudinary
    const result = await uploadVideoToCloudinary(req.file.buffer, fileName);
    console.log('Cloudinary upload successful:', {
      secure_url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes
    });
    
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: result.secure_url,
      videoId: result.public_id,
      duration: result.duration || null,
      format: result.format || null,
      size: result.bytes || req.file.size
    });
  } catch (error) {
    console.error('Video upload error details:', {
      message: error.message,
      stack: error.stack,
      cloudinaryError: error.error || null
    });
    
    // Handle specific Cloudinary errors
    let errorMessage = 'Video upload failed';
    if (error.message.includes('Invalid video file')) {
      errorMessage = 'Invalid video file format';
    } else if (error.message.includes('File size too large')) {
      errorMessage = 'Video file is too large';
    } else if (error.message.includes('Upload timeout')) {
      errorMessage = 'Upload timeout - please try again';
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload image endpoint (for course thumbnails)
videoRouter.post('/upload-image', authenticate, authorize('educator'), upload.single('image'), async (req, res) => {
  try {
    console.log('Image upload request received');
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.log('No image file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Additional validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      console.log(`Image file too large: ${req.file.size} bytes`);
      return res.status(400).json({
        success: false,
        message: 'Image file size must be less than 10MB'
      });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      console.log(`Invalid file type: ${req.file.mimetype}`);
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      });
    }

    // Sanitize filename for Cloudinary public_id
    const sanitizedName = req.file.originalname
      .split('.')[0] // Remove file extension
      .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace invalid characters with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 50); // Limit length to 50 characters

    const fileName = `thumbnail_${Date.now()}_${sanitizedName}`;
    console.log('Uploading image to Cloudinary with filename:', fileName);
    
    // Upload to Cloudinary
    const result = await uploadImageToCloudinary(req.file.buffer, fileName);
    console.log('Cloudinary image upload successful:', {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    });
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      imageId: result.public_id,
      format: result.format || null,
      size: result.bytes || req.file.size
    });
  } catch (error) {
    console.error('Image upload error details:', {
      message: error.message,
      stack: error.stack,
      cloudinaryError: error.error || null
    });
    
    // Handle specific Cloudinary errors
    let errorMessage = 'Image upload failed';
    if (error.message.includes('Invalid image file')) {
      errorMessage = 'Invalid image file format';
    } else if (error.message.includes('File size too large')) {
      errorMessage = 'Image file is too large';
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default videoRouter;