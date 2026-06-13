import mongoose from 'mongoose';

const connectedAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // refers to user.uid
  leetcodeUsername: { type: String, default: '' },
  leetcodeSolved: { type: Number, default: 0 },
  leetcodeAiAnalysis: { type: String, default: '' },
  githubUsername: { type: String, default: '' },
  githubData: { type: mongoose.Schema.Types.Mixed, default: null }, // raw stats profile, repos, langs
  githubAiAnalysis: { type: String, default: '' },
  certs: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  hackathons: { type: Array, default: [] },
  dsa: {
    leetcode: { type: Number, default: 0 },
    gfg: { type: Number, default: 0 },
    hackerrank: { type: Number, default: 0 }
  },
  updatedAt: { type: Date, default: Date.now }
});

const ConnectedAccount = mongoose.model('ConnectedAccount', connectedAccountSchema);
export default ConnectedAccount;
