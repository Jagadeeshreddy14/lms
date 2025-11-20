import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
      explanation: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
