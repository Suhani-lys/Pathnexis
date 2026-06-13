import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  onboardingComplete: { type: Boolean, default: false },
  streakCount: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  skillsUnlocked: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null },
  dreamCompanies: { type: [String], default: [] },
  selectedRoles: { type: [String], default: [] },
  targetRole: { type: String, default: '' },
  skillRatings: { type: Map, of: Number, default: {} },
  fullName: { type: String, default: '' },
  collegeName: { type: String, default: '' },
  branch: { type: String, default: '' },
  semester: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
