import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load .env file manually
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Could not load .env file:', e);
}

// Import Models
import User from './models/User.js';
import ConnectedAccount from './models/ConnectedAccount.js';
import ResumeAnalysis from './models/ResumeAnalysis.js';
import SkillGapReport from './models/SkillGapReport.js';
import CareerRoadmap from './models/CareerRoadmap.js';
import MockInterviewResult from './models/MockInterviewResult.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large JSON payloads (for base64 PDFs)

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pathnexis';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database successfully 🍃'))
  .catch(err => console.error('MongoDB database connection error:', err));

// --- LeetCode Proxy Endpoint ---
app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();

    if (data.errors || !data.data.matchedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allStats = data.data.matchedUser.submitStats.acSubmissionNum;
    const total = allStats.find(s => s.difficulty === 'All')?.count || 0;
    const easy = allStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const medium = allStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard = allStats.find(s => s.difficulty === 'Hard')?.count || 0;

    res.json({ status: 'success', totalSolved: total, easy, medium, hard });
  } catch (error) {
    console.error('LeetCode API Error:', error);
    res.status(500).json({ error: 'Failed to fetch LeetCode stats' });
  }
});

// --- GitHub Proxy Endpoint ---
app.get('/api/github/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const headers = { 'User-Agent': 'PathNexus-App' };
    
    const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!profileRes.ok) return res.status(profileRes.status).json({ error: 'GitHub user not found' });
    const profile = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
    const repos = await reposRes.ok ? await reposRes.json() : [];

    const languages = {};
    const topRepos = repos.slice(0, 5).map(r => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url
    }));

    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const totalReposWithLang = Object.values(languages).reduce((a, b) => a + b, 0);
    const languageStats = Object.entries(languages).map(([lang, count]) => ({
      language: lang,
      percentage: ((count / totalReposWithLang) * 100).toFixed(1)
    })).sort((a, b) => b.percentage - a.percentage);

    res.json({
      status: 'success',
      profile: {
        avatar: profile.avatar_url,
        followers: profile.followers,
        publicRepos: profile.public_repos,
        name: profile.name,
        bio: profile.bio
      },
      topRepos,
      languageStats
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub stats' });
  }
});

// --- User Profile Endpoints ---
app.post('/api/users', async (req, res) => {
  const { uid, ...profile } = req.body;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!profile.lastActiveDate) {
      profile.lastActiveDate = todayStr;
    }
    if (profile.streakCount === undefined || profile.streakCount === 0) {
      profile.streakCount = 1;
    }
    
    // Use returnDocument: 'after' since 'new' is deprecated in modern Mongoose versions
    const user = await User.findOneAndUpdate({ uid }, { uid, ...profile }, { returnDocument: 'after', upsert: true });
    res.json({ status: 'success', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Automatically calculate and update daily streak
    const todayStr = new Date().toISOString().split('T')[0];
    let needsSave = false;
    
    if (!user.lastActiveDate) {
      user.streakCount = 1;
      user.lastActiveDate = todayStr;
      needsSave = true;
    } else {
      const lastActiveStr = user.lastActiveDate.split('T')[0];
      if (lastActiveStr !== todayStr) {
        const lastDate = new Date(lastActiveStr);
        const todayDate = new Date(todayStr);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streakCount = (user.streakCount || 0) + 1;
        } else if (diffDays > 1) {
          user.streakCount = 1;
        }
        user.lastActiveDate = todayStr;
        needsSave = true;
      }
    }
    
    if (needsSave) {
      await user.save();
    }
    
    res.json({ status: 'success', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ uid: req.params.uid }, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ status: 'success', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Connected Accounts Endpoints ---
app.get('/api/portfolio/:uid', async (req, res) => {
  try {
    const account = await ConnectedAccount.findOne({ userId: req.params.uid });
    if (!account) return res.status(404).json({ error: 'Portfolio not found' });
    res.json({ status: 'success', portfolio: account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/portfolio/:uid', async (req, res) => {
  try {
    const account = await ConnectedAccount.findOneAndUpdate(
      { userId: req.params.uid },
      { userId: req.params.uid, ...req.body },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', portfolio: account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Resume Analyses Endpoints ---
app.post('/api/resume/upload', async (req, res) => {
  const { userId, fileName, fileData, ...analysisFields } = req.body;
  try {
    const newAnalysis = new ResumeAnalysis({
      userId,
      fileName,
      fileData: fileData ? Buffer.from(fileData, 'base64') : Buffer.alloc(0),
      ...analysisFields
    });
    await newAnalysis.save();
    res.json({ status: 'success', analysis: newAnalysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resume/latest/:uid', async (req, res) => {
  try {
    const latest = await ResumeAnalysis.findOne({ userId: req.params.uid }).sort({ analyzedAt: -1 });
    if (!latest) return res.status(404).json({ error: 'No resume analysis found' });
    res.json({ status: 'success', analysis: latest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Skill Gap Reports Endpoints ---
app.get('/api/skill-gap/:uid', async (req, res) => {
  try {
    const report = await SkillGapReport.findOne({ userId: req.params.uid }).sort({ updatedAt: -1 });
    if (!report) return res.status(404).json({ error: 'No skill gap report found' });
    res.json({ status: 'success', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skill-gap', async (req, res) => {
  const { userId, roleName, ...reportFields } = req.body;
  try {
    const report = await SkillGapReport.findOneAndUpdate(
      { userId, roleName },
      { userId, roleName, ...reportFields, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Career Roadmaps Endpoints ---
app.get('/api/roadmap/:uid', async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findOne({ userId: req.params.uid }).sort({ generatedAt: -1 });
    if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
    res.json({ status: 'success', roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/roadmap', async (req, res) => {
  const { userId, ...roadmapFields } = req.body;
  try {
    const roadmap = await CareerRoadmap.findOneAndUpdate(
      { userId },
      { userId, ...roadmapFields, generatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/roadmap/:uid/tasks', async (req, res) => {
  const { completedTasks, progress } = req.body;
  try {
    const roadmap = await CareerRoadmap.findOneAndUpdate(
      { userId: req.params.uid },
      { completedTasks, progress },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
    res.json({ status: 'success', roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Mock Interview Results Endpoints ---
app.get('/api/interview/results/:uid', async (req, res) => {
  try {
    const results = await MockInterviewResult.find({ userId: req.params.uid }).sort({ takenAt: -1 });
    res.json({ status: 'success', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/interview/result', async (req, res) => {
  const { userId, ...resultFields } = req.body;
  try {
    const result = new MockInterviewResult({
      userId,
      ...resultFields
    });
    await result.save();
    res.json({ status: 'success', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  });
}

export default app;

