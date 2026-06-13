import mongoose from 'mongoose';

const mockInterviewResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: { type: String, default: 'Resume-Based' },
  averageScore: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  answers: [{
    question: { type: String },
    userAnswer: { type: String },
    score: { type: Number },
    evaluation: {
      score: { type: Number },
      strengths: { type: String },
      missing: { type: String },
      model_answer: { type: String }
    }
  }],
  takenAt: { type: Date, default: Date.now }
});

const MockInterviewResult = mongoose.model('MockInterviewResult', mockInterviewResultSchema);
export default MockInterviewResult;
