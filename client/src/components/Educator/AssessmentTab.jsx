import React, { useState, useEffect } from 'react';
// You may need to adjust these imports to match your API structure
import { getAllCourses } from '../../Api/courseApi';
import { getCourseById } from '../../Api/courseApi';
import { createAssessment, getAssessmentsByVideo } from '../../Api/assessmentApi';

const AssessmentTab = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all courses for educator
    getAllCourses().then(res => {
      if (res.success) setCourses(res.courses);
    });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      getCourseById(selectedCourse).then(res => {
        if (res.success && res.course) {
          // Flatten all videos from chapters
          const vids = [];
          res.course.chapters.forEach(ch => {
            ch.chapterContent.forEach(lec => {
              if (lec.type === 'video') vids.push(lec);
            });
          });
          setVideos(vids);
        }
      });
    } else {
      setVideos([]);
    }
    setSelectedVideo('');
  }, [selectedCourse]);

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.correctAnswer || newQuestion.options.some(opt => !opt)) {
      setMessage('Please fill all fields for the question.');
      return;
    }
    setQuestions([...questions, newQuestion]);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    setMessage('');
  };

  const handleCreateAssessment = async () => {
    if (!selectedVideo || questions.length === 0) {
      setMessage('Select a video and add at least one question.');
      return;
    }
    setLoading(true);
    const res = await createAssessment({ videoId: selectedVideo, questions });
    setLoading(false);
    if (res.success) {
      setMessage('Assessment created successfully!');
      setQuestions([]);
    } else {
      setMessage(res.message || 'Failed to create assessment.');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Assessment</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Course:</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full p-2 border rounded">
          <option value="">-- Choose a course --</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>{course.title}</option>
          ))}
        </select>
      </div>
      {videos.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Video:</label>
          <select value={selectedVideo} onChange={e => setSelectedVideo(e.target.value)} className="w-full p-2 border rounded">
            <option value="">-- Choose a video --</option>
            {videos.map(video => (
              <option key={video._id} value={video._id}>{video.title}</option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Add Questions</h3>
        <div className="space-y-2">
          <input type="text" placeholder="Question" value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} className="w-full p-2 border rounded" />
          {newQuestion.options.map((opt, idx) => (
            <input key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => {
              const opts = [...newQuestion.options];
              opts[idx] = e.target.value;
              setNewQuestion({ ...newQuestion, options: opts });
            }} className="w-full p-2 border rounded" />
          ))}
          <input type="text" placeholder="Correct Answer" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Explanation (optional)" value={newQuestion.explanation} onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })} className="w-full p-2 border rounded" />
          <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-blue-600 text-white rounded mt-2">Add Question</button>
        </div>
      </div>
      {questions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Questions Preview</h4>
          <ul className="list-disc pl-5">
            {questions.map((q, i) => (
              <li key={i} className="mb-1">{q.question} <span className="text-xs text-slate-500">(Correct: {q.correctAnswer})</span></li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={handleCreateAssessment} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded font-bold">
        {loading ? 'Saving...' : 'Create Assessment'}
      </button>
      {message && <div className="mt-4 text-red-500 font-medium">{message}</div>}
    </div>
  );
};

export default AssessmentTab;
