# Advanced-LMS

A full-stack Learning Management System (LMS) built with Node.js, Express, MongoDB, React, and Cloudinary for video hosting.

## Features
- User authentication (student & educator roles)
- Educator: Create, publish, and manage courses, chapters, lectures
- Student: Enroll in/purchase courses, track progress, rate courses
- Video upload and streaming via Cloudinary
- RESTful API with JWT authentication
- Course ratings and reviews
- Progress tracking per course

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React (see `/client`)
- **Media:** Cloudinary (video hosting)
- **Auth:** JWT, bcrypt

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/gourabofficial/Advanced-LMS.git
cd Advanced-LMS
```

### 2. Install dependencies
```bash
cd server
npm install
```

### 3. Set up environment variables
Create a `.env` file in `/server`:
```
MONGODB_URI=your_mongodb_uri
PORT=3000
JWT_TOKEN=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
```

### 4. Start the backend server
```bash
npm start
```

### 5. Start the frontend (optional)
```bash
cd ../client
npm install
npm run dev
```

## API Overview

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user

### User
- `GET /api/user/profile` — Get user profile
- `POST /api/user/enroll/:courseId` — Enroll in course
- `POST /api/user/purchase/:courseId` — Purchase course
- `PUT /api/user/progress/:courseId` — Update course progress
- `GET /api/user/progress/:courseId` — Get course progress
- `POST /api/user/rating/:courseId` — Rate a course

### Course
- `GET /api/course/all` — List all published courses
- `POST /api/course/create` — Create course (educator)
- `DELETE /api/course/:courseId` — Delete course (educator)
- `GET /api/course/my-courses` — Educator's courses
- `PATCH /api/course/:courseId/toggle-publish` — Publish/unpublish course
- `POST /api/course/enroll/:courseId` — Enroll in course (student)

### Chapter
- `GET /api/chapter/course/:courseId` — List chapters for a course
- `POST /api/chapter/create/:courseId` — Create chapter (educator)
- `DELETE /api/chapter/:chapterId` — Delete chapter (educator)

### Lecture
- `GET /api/lecture/chapter/:chapterId` — List lectures for a chapter
- `POST /api/lecture/create/:courseId/:chapterId` — Create lecture (educator)
- `DELETE /api/lecture/:lectureId` — Delete lecture (educator)

### Video
- `POST /api/video/upload` — Upload video (educator)

## Video Upload
- Videos are uploaded to Cloudinary via `/api/video/upload` (max size configurable in multer config)
- Use the returned `videoUrl` when creating a lecture

## License
MIT
# lms
