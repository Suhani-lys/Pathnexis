import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // refers to user.uid
  fileName: { type: String, required: true },
  fileData: { type: Buffer, required: true }, // raw PDF binary data
  contentType: { type: String, default: 'application/pdf' },
  parsedText: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  ats_score: { type: Number, default: 0 },
  key_skills: { type: [String], default: [] },
  missing_skills: { type: [String], default: [] },
  tips: { type: [String], default: [] },
  isOfflineMode: { type: Boolean, default: false },
  analyzedAt: { type: Date, default: Date.now }
});

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export default ResumeAnalysis;
