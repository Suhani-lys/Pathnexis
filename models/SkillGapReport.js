import mongoose from 'mongoose';

const skillGapReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  roleName: { type: String, required: true },
  readinessScore: { type: Number, default: 0 },
  gaps: [{
    skillName: { type: String },
    userRating: { type: Number },
    targetRating: { type: Number },
    status: { type: String },
    statusColor: { type: String }
  }],
  updatedAt: { type: Date, default: Date.now }
});

const SkillGapReport = mongoose.model('SkillGapReport', skillGapReportSchema);
export default SkillGapReport;
