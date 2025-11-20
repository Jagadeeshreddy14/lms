import multer from "multer";
import { cloudinary } from "./cloudnary.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
    fieldSize: 100 * 1024 * 1024, // Increased field size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video and image files
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed!"), false);
    }
  },
});

// Function to upload video to Cloudinary

export const uploadVideoToCloudinary = async (fileBuffer, fileName) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "lms-videos",
          public_id: fileName,
          chunk_size: 1024 * 1024, // Reduced to 1MB chunks for better stability
          timeout: 300000, // 5 minutes timeout
          quality: "auto:good",
          format: "mp4", // Force mp4 format for better compatibility
          video_codec: "h264", // Use h264 codec for better compression
          eager: [
            { width: 640, height: 360, crop: "limit", quality: "auto:good" }
          ],
          eager_async: true, // Process transformations asynchronously
          overwrite: true, // Allow overwriting existing files
          invalidate: true, // Invalidate CDN cache
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Upload successful:", result.public_id);
            resolve(result);
          }
        }
      );

      // Add error handling for stream
      uploadStream.on('error', (error) => {
        console.error("Upload stream error:", error);
        reject(error);
      });

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Upload function error:", error);
    throw error;
  }
};

// Function to upload image to Cloudinary
export const uploadImageToCloudinary = async (fileBuffer, fileName) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "lms-thumbnails",
            public_id: fileName,
            quality: "auto:good",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    throw error;
  }
};

// Function to upload profile picture to Cloudinary
export const uploadProfilePictureToCloudinary = async (
  fileBuffer,
  fileName
) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "lms-profile-pictures",
            public_id: fileName,
            quality: "auto:good",
            fetch_format: "auto",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(fileBuffer);
    });
  } catch (error) {
    throw error;
  }
};

export { upload };
