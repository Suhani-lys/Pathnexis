import React, { useState, useEffect } from 'react';
import { Bot, ChevronDown, Download, CheckCircle, Circle, Loader2, AlertCircle, Award, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Roadmap.css';

const JOB_ROLES = [
  "Software Developer", "Data Scientist", "ML Engineer", 
  "DevOps Engineer", "Cybersecurity Analyst", "Product Manager", 
  "Full Stack Developer"
];

const ROLE_SKILLS_MAP = {
  "Software Developer": [
    { name: "DSA", weight: 4 },
    { name: "Programming", weight: 3 },
    { name: "Git & Version Control", weight: 1 },
    { name: "Problem Solving", weight: 2 }
  ],
  "Full Stack Developer": [
    { name: "Web Development", weight: 3 },
    { name: "SQL & Databases", weight: 2 },
    { name: "Programming", weight: 2 },
    { name: "Git & Version Control", weight: 1 },
    { name: "DSA", weight: 2 }
  ],
  "Data Scientist": [
    { name: "Programming", weight: 3 },
    { name: "SQL & Databases", weight: 3 },
    { name: "DSA", weight: 3 },
    { name: "Problem Solving", weight: 1 }
  ],
  "ML Engineer": [
    { name: "Programming", weight: 3 },
    { name: "DSA", weight: 3 },
    { name: "SQL & Databases", weight: 2 },
    { name: "Problem Solving", weight: 2 }
  ],
  "DevOps Engineer": [
    { name: "System Design", weight: 3 },
    { name: "Git & Version Control", weight: 2 },
    { name: "Programming", weight: 2 },
    { name: "SQL & Databases", weight: 1 },
    { name: "DSA", weight: 2 }
  ],
  "Cybersecurity Analyst": [
    { name: "System Design", weight: 3 },
    { name: "DSA", weight: 3 },
    { name: "Programming", weight: 2 },
    { name: "Communication Skills", weight: 2 }
  ],
  "Product Manager": [
    { name: "Communication Skills", weight: 4 },
    { name: "Problem Solving", weight: 3 },
    { name: "System Design", weight: 2 },
    { name: "Git & Version Control", weight: 1 }
  ]
};

const aggregateUserSkills = (userData, portfolioData, resumeData, isDemo, currentUser) => {
  const defaultSkills = {
    "DSA": 5,
    "Programming": 5,
    "Web Development": 4,
    "SQL & Databases": 4,
    "System Design": 3,
    "Communication Skills": 6,
    "Problem Solving": 5,
    "Git & Version Control": 4
  };

  const onboardingSkills = userData?.skillRatings || defaultSkills;
  const aggregated = { ...onboardingSkills };

  let portfolioDsa = 0;
  let portfolioGithub = null;
  
  if (portfolioData) {
    portfolioDsa = portfolioData.dsa?.leetcode || 0;
    portfolioGithub = portfolioData.githubData || null;
  }

  if (portfolioDsa > 0) {
    let dsaBoost = 5;
    if (portfolioDsa > 300) dsaBoost = 10;
    else if (portfolioDsa > 150) dsaBoost = 8;
    else if (portfolioDsa > 50) dsaBoost = 6;
    aggregated["DSA"] = Math.max(aggregated["DSA"], dsaBoost);
  }

  if (portfolioGithub && portfolioGithub.profile) {
    const repos = portfolioGithub.profile.publicRepos || 0;
    if (repos > 5) {
      aggregated["Git & Version Control"] = Math.max(aggregated["Git & Version Control"], 8);
      aggregated["Programming"] = Math.max(aggregated["Programming"], 7);
    } else if (repos > 0) {
      aggregated["Git & Version Control"] = Math.max(aggregated["Git & Version Control"], 6);
    }
  }

  if (resumeData) {
    const keyLangs = (resumeData.key_skills || []).map(s => s.toLowerCase());
    if (keyLangs.some(s => s.includes('react') || s.includes('web') || s.includes('html') || s.includes('javascript'))) {
      aggregated["Web Development"] = Math.max(aggregated["Web Development"], 8);
    }
    if (keyLangs.some(s => s.includes('sql') || s.includes('postgres') || s.includes('mongo') || s.includes('database'))) {
      aggregated["SQL & Databases"] = Math.max(aggregated["SQL & Databases"], 8);
    }
    if (keyLangs.some(s => s.includes('git') || s.includes('github'))) {
      aggregated["Git & Version Control"] = Math.max(aggregated["Git & Version Control"], 8);
    }

    const missingLangs = (resumeData.missing_skills || []).map(s => s.toLowerCase());
    if (missingLangs.some(s => s.includes('system design') || s.includes('architecture'))) {
      aggregated["System Design"] = Math.min(aggregated["System Design"], 4);
    }
    if (missingLangs.some(s => s.includes('dsa') || s.includes('algorithm'))) {
      aggregated["DSA"] = Math.min(aggregated["DSA"], 4);
    }
  }

  return {
    skills: aggregated,
    portfolioDsa,
    hasSyncedGithub: !!portfolioGithub,
    hasUploadedResume: !!resumeData
  };
};

const calculateReadiness = (userSkills, roleName) => {
  const roleSkills = ROLE_SKILLS_MAP[roleName] || ROLE_SKILLS_MAP["Software Developer"];
  
  let totalWeight = 0;
  let earnedScore = 0;

  const gaps = roleSkills.map(req => {
    let skillKey = req.name;
    if (req.key) skillKey = req.key;
    
    const userRating = userSkills[skillKey] || 5;
    const targetRating = 8;
    
    let status = "Action Required";
    let statusColor = "pill-red";
    if (userRating >= targetRating) {
      status = "Mastered";
      statusColor = "pill-green";
    } else if (userRating >= 5) {
      status = "In Progress";
      statusColor = "pill-blue";
    }

    const skillRatio = Math.min(userRating / targetRating, 1);
    earnedScore += skillRatio * req.weight;
    totalWeight += req.weight;

    return {
      skillName: req.name,
      userRating,
      targetRating,
      status,
      statusColor
    };
  });

  const readinessScore = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 70;

  return {
    readinessScore,
    gaps
  };
};

const generateLocalRoadmap = (role, company, dsaSkill, progSkill) => {
  let roleThemes = [];
  let roleTasks = [];
  
  if (role.toLowerCase().includes('data scientist') || role.toLowerCase().includes('ml')) {
    roleThemes = [
      "Python Essentials & NumPy",
      "Data Manipulation with Pandas",
      "Exploratory Data Analysis & Viz",
      "Probability & Statistics Fundamentals",
      "Linear Regression & Classification",
      "Model Evaluation & Hyperparameters",
      "Decision Trees & Ensemble Methods",
      "Unsupervised Learning (K-Means/PCA)",
      "Introduction to Deep Learning & PyTorch",
      "Feature Engineering & Pipelines",
      "ML Model Deployment (Flask/FastAPI)",
      "Capstone Project & Portfolio Review"
    ];
    roleTasks = [
      ["Master NumPy array operations and indexing", "Solve 5 array manipulation coding tasks", "Build basic mathematical operations from scratch", "Read Python coding standards (PEP 8)", "Analyze data vectors in NumPy"],
      ["Load and clean messy datasets with Pandas", "Merge and group tables on multi-keys", "Perform aggregate stats on a tabular dataset", "Solve 3 Pandas data manipulation puzzles", "Implement custom data filtering functions"],
      ["Plot histograms and boxplots using Seaborn", "Identify outliers in a dataset visually", "Build a dashboard showing dataset relations", "Learn matplotlib customization techniques", "Present data insight stories using charts"],
      ["Solve 10 probability coin/dice problems", "Understand Central Limit Theorem", "Implement Hypothesis Testing (A/B testing)", "Calculate Confidence Intervals", "Study conditional probability (Bayes' Theorem)"],
      ["Implement linear regression from scratch", "Train logistic regression classifier in sklearn", "Tune regularization L1/L2 penalties", "Verify linear regression assumptions", "Write report on model coefficient impacts"],
      ["Calculate Precision, Recall, and F1-score", "Set up K-Fold cross-validation loops", "Plot ROC curves and AUC calculations", "Tune parameters using GridSearchCV", "Document error analysis of model predictions"],
      ["Build and visualize a decision tree", "Train a Random Forest classifier", "Implement gradient boosting using XGBoost", "Analyze feature importance rankings", "Compare ensemble models vs single trees"],
      ["Run K-Means clustering on customer profiles", "Apply PCA to reduce dimensionality to 2D", "Visualize clusters in scatter plots", "Calculate silhouette scores for clusters", "Determine optimal cluster count using Elbow method"],
      ["Build a simple MLP classifier in PyTorch", "Understand Forward and Backpropagation", "Apply Dropout and Batch Normalization", "Train model on MNIST dataset", "Visualize loss and accuracy curves"],
      ["Handle missing values with smart imputation", "Encode categorical variables (One-hot, Target)", "Scale numeric columns using StandardScaler", "Create interaction terms and log transforms", "Build custom sklearn pipeline stages"],
      ["Wrap trained ML model in a FastAPI endpoint", "Dockerize the model API container", "Test API latency and throughput local-side", "Write API docs and test payloads", "Deploy to cloud (Render or AWS)"],
      ["Assemble Git repo with clean model code", "Write a professional README with diagrams", "Create a 5-slide project presentation", "Conduct mock ML system design interviews", "Optimize model inference latency"]
    ];
  } else if (role.toLowerCase().includes('devops') || role.toLowerCase().includes('cloud')) {
    roleThemes = [
      "Linux Basics & Shell Scripting",
      "Git Flow & Version Control",
      "Networking & Web Servers",
      "Containerization with Docker",
      "CI/CD Pipeline Design",
      "Infrastructure as Code (IaC)",
      "Cloud Foundations (AWS/Azure)",
      "Container Orchestration (K8s)",
      "Monitoring & Logging (ELK/Prometheus)",
      "Configuration Management (Ansible)",
      "DevOps Security & DevSecOps",
      "System Design & Placement Prep"
    ];
    roleTasks = [
      ["Learn file system navigation and file permissions", "Write a bash script to parse system log files", "Automate daily backup cron jobs locally", "Master grep, sed, and awk commands", "Practice basic ssh setup and keys configuration"],
      ["Understand merge vs rebase branches", "Configure a multi-branch Git workflow", "Resolve git merge conflicts manually", "Write clean, standard commit messages", "Use git bisect to find broken commits"],
      ["Understand TCP/IP, DNS, and HTTP requests", "Set up Nginx as a reverse proxy server", "Configure HTTPS secure layer using certbot", "Analyze network traffic using curl and ping", "Configure custom load-balancer rules"],
      ["Write dockerfiles for Node/Python apps", "Optimize docker image size with multi-stage builds", "Run multi-container setups using Docker Compose", "Configure docker volumes and bind mounts", "Verify container port mapping and routing"],
      ["Set up GitHub Actions workflow pipelines", "Integrate automated testing steps in CI", "Configure automated linting check triggers", "Deploy code build artifacts to a repository", "Create pipeline status notification webhooks"],
      ["Learn Terraform syntax and providers", "Define simple cloud instances in tf scripts", "Manage state files and remote backend configurations", "Deploy basic network architecture in code", "Run terraform plan and apply commands safely"],
      ["Set up AWS EC2 instances and security groups", "Configure storage buckets (AWS S3) and access policies", "Configure serverless functions (AWS Lambda)", "Understand VPC routing and subnet splits", "Analyze billing dashboard alerts and quotas"],
      ["Understand Pods, Deployments, and Services in K8s", "Write YAML manifests for microservices", "Deploy local cluster using Minikube", "Configure K8s horizontal pod autoscalers", "Expose services using ingress resources"],
      ["Configure Prometheus monitoring server", "Create clean dashboards in Grafana", "Implement warning alerts for high CPU usage", "Parse app logs using ELK stack", "Practice analyzing system log metrics"],
      ["Write Ansible playbooks for server setup", "Manage inventory files and hosts variables", "Automate server user creations dynamically", "Deploy patches across virtual instances", "Validate server configurations with dry runs"],
      ["Integrate security scanning (Trivy/SonarQube) in CI", "Manage environment secrets securely using Vault", "Apply IAM roles and least-privilege policies", "Audit system vulnerabilities in dependency trees", "Configure web application firewalls (WAF)"],
      ["Design resilient, scalable infrastructure diagrams", "Read through top 20 DevOps interview questions", "Conduct infrastructure mock interviews", "Polish GitHub profile with DevOps projects", "Optimize speed of a CI/CD pipeline"]
    ];
  } else {
    roleThemes = [
      "Programming Fundamentals & Big O",
      "Basic Data Structures (Arrays & Lists)",
      "Object-Oriented Programming & Databases",
      "Advanced DSA (Trees & Graphs)",
      "Frontend Essentials (HTML, CSS & JS)",
      "React UI & State Management",
      "Backend Architecture (Node/Express)",
      "REST APIs & Database Integration",
      "System Design & Scalability",
      "Software Testing & CI/CD",
      "Resume Prep & Mock Interviews",
      "Final Review & Application Strategy"
    ];
    roleTasks = [
      ["Master recursion and time complexity analysis", "Solve 5 recursion problems on LeetCode", "Learn binary search algorithms", "Optimize sorting algorithms dynamically", "Complete Big O evaluation exercises"],
      ["Implement Linked Lists from scratch", "Solve 5 array-based medium LeetCode questions", "Master Stack and Queue operations", "Implement dynamic sliding window algorithms", "Practice two-pointer array traversal"],
      ["Implement OOP concepts (Inheritance, Polymorphic) in Java/C++", "Write complex SQL join queries", "Design database schema for an e-commerce app", "Learn indexing and query execution plans", "Set up PostgreSQL database locally"],
      ["Practice Binary Search Trees insertion and deletion", "Implement DFS and BFS traversals", "Solve 5 Tree-based medium LeetCode questions", "Solve Dijkstra shortest path algorithms", "Review dynamic programming recursion memoization"],
      ["Create fully responsive layout using flexbox/grid", "Understand DOM manipulation and events in vanilla JS", "Master JS closures, promises, and async/await", "Practice fetch API error handling", "Build dynamic DOM layout project"],
      ["Set up a React app with Vite structure", "Master React hooks (useState, useEffect, useContext)", "Configure multi-page routing with React Router", "Implement global state using Redux or custom context", "Style UI components with clean CSS tokens"],
      ["Set up Express server with logging middleware", "Understand Node.js Event Loop and Non-blocking IO", "Design clean MVC structure in backend", "Handle file uploads in Node (Multer)", "Configure CORS and CORS policies secure rules"],
      ["Connect Express server to SQL/NoSQL databases", "Build CRUD routes for a project system", "Implement JWT user authentication and cookie storage", "Validate input schemas using Zod or Joi", "Write API documentation (Swagger)"],
      ["Understand load balancers, caching, and CDN concepts", "Design system architecture for URL shortener (TinyURL)", "Learn database replication and sharding methods", "Study message queues (RabbitMQ or Kafka) basics", "Draw system designs for social media feed page"],
      ["Write unit tests for backend routers", "Write component tests using Jest/React Testing Library", "Configure GitHub actions CI deployment workflows", "Audit web security checklist (OWASP Top 10)", "Optimize web assets and page performance"],
      ["Include project achievements on your resume", "Tailor resume layout to target job roles", "Conduct mock technical interview sessions", "Refine LinkedIn profile and developer branding", "Submit resume to resume analyzer offline mode"],
      ["Apply to 10 companies on LinkedIn/Indeed", "Practice 3 medium LeetCode questions daily", "Review common behavioral interview answers", "Optimize code profiles and repository folders", "Follow up on job referrals actively"]
    ];
  }

  const roadmap = [];
  for (let w = 1; w <= 12; w++) {
    roadmap.push({
      week_number: w,
      theme: roleThemes[w - 1] || `Week ${w} Preparation`,
      tasks: roleTasks[w - 1] || [
        `Master fundamental algorithms for ${role}`,
        `Solve 3 relevant practice questions`,
        `Build a mini feature matching ${role} requirement`,
        `Read industry best-practices document`,
        `Review preparation milestones`
      ],
      skill_badge: w % 2 === 0 ? "DSA" : "Core Tech"
    });
  }

  return roadmap;
};

const ReadinessRing = ({ percentage }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="readiness-ring-container mx-auto">
      <svg className="readiness-ring" width="160" height="160">
        <circle className="readiness-ring-bg" strokeWidth="10" r={radius} cx="80" cy="80" />
        <circle
          className="readiness-ring-fill"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx="80"
          cy="80"
        />
      </svg>
      <div className="readiness-ring-content">
        <span className="readiness-value">{percentage}%</span>
        <span className="readiness-label">Readiness</span>
      </div>
    </div>
  );
};

const Roadmap = () => {
  const { currentUser, userData, isDemo, updateUserData } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [roadmapData, setRoadmapData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [error, setError] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const [formData, setFormData] = useState({
    role: userData?.targetRole || 'Software Developer',
    company: userData?.dreamCompanies?.[0] || 'Google',
    dsaSkill: userData?.skillRatings?.dsa || 5,
    progSkill: userData?.skillRatings?.programming || 5,
    months: 3
  });

  useEffect(() => {
    const loadPortfolioAndResume = async () => {
      if (!currentUser) return;
      try {
        const portRes = await fetch(`${API_URL}/api/portfolio/${currentUser.uid}`);
        if (portRes.ok) {
          const data = await portRes.json();
          if (data.status === 'success' && data.portfolio) {
            setPortfolioData(data.portfolio);
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio from MongoDB in Roadmap:", err);
      }

      try {
        const resumeRes = await fetch(`${API_URL}/api/resume/latest/${currentUser.uid}`);
        if (resumeRes.ok) {
          const data = await resumeRes.json();
          if (data.status === 'success' && data.analysis) {
            setResumeData(data.analysis);
          }
        }
      } catch (err) {
        console.error("Failed to load resume analysis from MongoDB in Roadmap:", err);
      }
    };
    loadPortfolioAndResume();
  }, [currentUser]);

  // Pull dynamic aggregations
  const { skills, portfolioDsa, hasSyncedGithub, hasUploadedResume } = aggregateUserSkills(userData, portfolioData, resumeData, isDemo, currentUser);
  const currentRole = formData.role || "Software Developer";
  const { readinessScore, gaps } = calculateReadiness(skills, currentRole);

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!currentUser) return;

      const storageKey = `pathnexis_roadmap_${currentUser.uid}`;
      const localRoadmap = localStorage.getItem(storageKey);
      
      if (localRoadmap) {
        try {
          const cached = JSON.parse(localRoadmap);
          if (cached.roadmapData) {
            setRoadmapData(cached.roadmapData);
            setCompletedTasks(cached.completedTasks || {});
            setHasGenerated(true);
            setFormData(prev => ({
              ...prev,
              role: cached.role || prev.role,
              company: cached.company || prev.company,
              months: cached.months || prev.months
            }));
          }
        } catch (e) {
          console.warn("Failed to parse cached roadmap:", e);
        }
      } else if (userData?.userRoadmap) {
        setRoadmapData(userData.userRoadmap);
        setCompletedTasks(userData.completedTasks || {});
        setHasGenerated(true);
      }

      try {
        const res = await fetch(`${API_URL}/api/roadmap/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.roadmap) {
            setRoadmapData(data.roadmap.roadmapData || []);
            setCompletedTasks(data.roadmap.completedTasks || {});
            setHasGenerated(true);
            setFormData(prev => ({
              ...prev,
              role: data.roadmap.role || prev.role,
              company: data.roadmap.company || prev.company,
              months: data.roadmap.months || prev.months
            }));

            localStorage.setItem(storageKey, JSON.stringify({
              role: data.roadmap.role,
              company: data.roadmap.company,
              months: data.roadmap.months,
              roadmapData: data.roadmap.roadmapData,
              completedTasks: data.roadmap.completedTasks
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to load roadmap from MongoDB, using local fallback:", err);
      }
    };
    loadRoadmap();
  }, [currentUser, userData]);

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        role: userData.targetRole || prev.role || 'Software Developer',
        company: userData.dreamCompanies?.[0] || prev.company || 'Google',
        dsaSkill: userData.skillRatings?.["DSA"] || prev.dsaSkill || 5,
        progSkill: userData.skillRatings?.["Programming"] || prev.progSkill || 5
      }));
    }
  }, [userData]);

  // Proactively update readiness score and save skill gap report on calculations
  useEffect(() => {
    const syncSkillGap = async () => {
      if (!currentUser || isGenerating) return;
      try {
        // Sync user table readiness
        if (userData && userData.readinessScore !== readinessScore) {
          updateUserData({ readinessScore });
        }
        // Save Skill Gap report to MongoDB
        await fetch(`${API_URL}/api/skill-gap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            roleName: currentRole,
            readinessScore,
            gaps
          })
        });
      } catch (e) {
        console.error("Failed to sync skill gap report with MongoDB:", e);
      }
    };
    syncSkillGap();
  }, [readinessScore, userData, currentUser, isGenerating, currentRole, gaps, updateUserData]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setIsOfflineMode(false);

    try {
      const prompt = `Generate a personalized 12-week placement preparation roadmap for a student targeting ${formData.role} at ${formData.company} with DSA skill ${formData.dsaSkill}/10 and Programming skill ${formData.progSkill}/10. Return only a valid JSON array of 12 objects with no markdown or extra text. Each object must have: week_number (integer), theme (string), tasks (array of exactly 5 strings), skill_badge (string).`;
      
      let data = null;
      let parsed = null;
      let offline = false;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );

        data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
          console.warn("Gemini 2.5-flash failed, trying 1.5-flash fallback...", data);
          const response15 = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
          );
          const data15 = await response15.json();
          if (!data15.candidates || data15.candidates.length === 0) {
            throw new Error("API Limit Reached");
          }
          data = data15;
        }
        
        const text = data.candidates[0].content.parts[0].text;
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to local roadmap generator:", geminiErr);
        parsed = generateLocalRoadmap(formData.role, formData.company, formData.dsaSkill, formData.progSkill);
        offline = true;
      }

      setRoadmapData(parsed);
      setIsOfflineMode(offline);
      setHasGenerated(true);

      // Persist CareerRoadmap to MongoDB and local cache
      if (currentUser) {
        const storageKey = `pathnexis_roadmap_${currentUser.uid}`;
        localStorage.setItem(storageKey, JSON.stringify({
          role: formData.role,
          company: formData.company,
          months: formData.months,
          roadmapData: parsed,
          completedTasks: {}
        }));

        try {
          await fetch(`${API_URL}/api/roadmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              role: formData.role,
              company: formData.company,
              months: formData.months,
              roadmapData: parsed,
              completedTasks: {},
              progress: 0
            })
          });
          setCompletedTasks({});
          
          updateUserData({ 
            userRoadmap: parsed,
            completedTasks: {},
            readinessScore
          });
        } catch (dbErr) {
          console.error("Failed to save roadmap to MongoDB database:", dbErr);
          setCompletedTasks({});
          updateUserData({ 
            userRoadmap: parsed,
            completedTasks: {},
            readinessScore
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create roadmap. Using local parser.");
      const parsed = generateLocalRoadmap(formData.role, formData.company, formData.dsaSkill, formData.progSkill);
      setRoadmapData(parsed);
      setIsOfflineMode(true);
      setHasGenerated(true);
      if (currentUser) {
        const storageKey = `pathnexis_roadmap_${currentUser.uid}`;
        localStorage.setItem(storageKey, JSON.stringify({
          role: formData.role,
          company: formData.company,
          months: formData.months,
          roadmapData: parsed,
          completedTasks: {}
        }));
        updateUserData({ 
          userRoadmap: parsed,
          completedTasks: {},
          readinessScore
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = async (weekNumber, taskIndex) => {
    const key = `week_${weekNumber}_task_${taskIndex}`;
    const isNowCompleted = !completedTasks[key];
    const updatedTasks = { ...completedTasks, [key]: isNowCompleted };
    if (!isNowCompleted) delete updatedTasks[key];
    
    setCompletedTasks(updatedTasks);

    const totalChecked = Object.keys(updatedTasks).length;
    const mapSize = roadmapData.length * 5;
    const pct = Math.min((totalChecked / mapSize) * 100, 100);

    if (currentUser) {
      const storageKey = `pathnexis_roadmap_${currentUser.uid}`;
      localStorage.setItem(storageKey, JSON.stringify({
        role: formData.role,
        company: formData.company,
        months: formData.months,
        roadmapData,
        completedTasks: updatedTasks
      }));
    }

    try {
      await fetch(`${API_URL}/api/roadmap/${currentUser.uid}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks: updatedTasks,
          progress: pct
        })
      });

      if (currentUser) {
        updateUserData({ roadmapProgress: pct, tasksCompleted: totalChecked, completedTasks: updatedTasks });
      }
    } catch (err) {
      console.warn("Failed to save tasks progress to MongoDB database, saved to local cache:", err);
      if (currentUser) {
        updateUserData({ roadmapProgress: pct, tasksCompleted: totalChecked, completedTasks: updatedTasks });
      }
    }
  };

  return (
    <div className="roadmap-page fade-in">
      <div className="roadmap-header text-center">
        <h1 className="page-title gradient-text">Personalized Skill Gap & Roadmap 🎯</h1>
        <p className="page-subtitle">Align your active profile metrics against standard recruiter benchmarks.</p>
      </div>

      {/* 1. Skill Gap Analysis Dashboard */}
      <div className="skill-gap-dashboard">
        <div className="readiness-score-card glass-card text-center">
          <h3>Target Role Match</h3>
          <p className="text-secondary mt-2 mb-4">Benchmarks calculated for <strong>{currentRole}</strong></p>
          <ReadinessRing percentage={readinessScore} />
          <div className="sources-indicator justify-center">
            <div className="source-item">
              <span className={`source-dot ${portfolioDsa > 0 ? 'active' : ''}`}></span>
              <span>LeetCode</span>
            </div>
            <div className="source-item">
              <span className={`source-dot ${hasSyncedGithub ? 'active' : ''}`}></span>
              <span>GitHub</span>
            </div>
            <div className="source-item">
              <span className={`source-dot ${hasUploadedResume ? 'active' : ''}`}></span>
              <span>Resume</span>
            </div>
          </div>
        </div>

        <div className="skills-comparison-card glass-card">
          <div>
            <h3>Skill Profiler</h3>
            <p className="text-secondary mt-2">Required competencies vs your actual level:</p>
          </div>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Benchmark</th>
                  <th>Your Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.skillName}</strong></td>
                    <td>8 / 10</td>
                    <td>
                      <div className="level-indicator">
                        <span>{item.userRating} / 10</span>
                        <div className="level-bar">
                          <div className="level-bar-fill" style={{ width: `${item.userRating * 10}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${item.statusColor}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOfflineMode && (
        <div className="offline-banner">
          <AlertCircle size={20} />
          <span>
            <strong>Offline Masterplan:</strong> Gemini API rate limit or quota exceeded. Generated prep path using rule-based local guidelines.
          </span>
        </div>
      )}

      {error && (
        <div className="glass-card mb-4" style={{padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <AlertCircle /> {error}
        </div>
      )}

      {/* 2. Roadmap Form */}
      {!hasGenerated && !isGenerating && (
        <div className="generator-card glass-card">
          <h3 className="mb-4 text-center">Customize Your Preparation Strategy</h3>
          <form className="generator-form" onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Target Job Role</label>
              <div className="select-wrapper">
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select a role</option>
                  {JOB_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <ChevronDown className="select-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label>Dream Company</label>
              <input 
                type="text" 
                placeholder="e.g. Google, DataDog, Netflix" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                required
              />
            </div>

            <div className="sliders-row">
              <div className="form-group slider-group">
                <div className="slider-label">
                  <span>Current DSA Skill</span>
                  <span className="slider-val">{formData.dsaSkill}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={formData.dsaSkill}
                  onChange={e => setFormData({...formData, dsaSkill: parseInt(e.target.value)})}
                  className="custom-range"
                />
              </div>

              <div className="form-group slider-group">
                <div className="slider-label">
                  <span>Current Programming Skill</span>
                  <span className="slider-val">{formData.progSkill}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={formData.progSkill}
                  onChange={e => setFormData({...formData, progSkill: parseInt(e.target.value)})}
                  className="custom-range"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Available Preparation Time (Months)</label>
              <div className="select-wrapper">
                <select 
                  value={formData.months} 
                  onChange={e => setFormData({...formData, months: parseInt(e.target.value)})}
                >
                  {[1,2,3,4,5,6].map(m => <option key={m} value={m}>{m} Months</option>)}
                </select>
                <ChevronDown className="select-icon" size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary generate-cta pulse-glow">
              <Bot size={22} style={{marginRight: '8px'}} />
              Generate My Prep Plan
            </button>
          </form>
        </div>
      )}

      {/* 3. Generating Loading State */}
      {isGenerating && (
        <div className="loading-state glass-card pulse-glow">
          <Loader2 className="spinner" size={60} color="var(--accent-blue)" />
          <h2 className="gradient-text">🤖 AI is building your personalized roadmap...</h2>
          <p>Analyzing matching benchmarks and compiling custom schedules for {formData.company || 'your dream companies'}...</p>
        </div>
      )}

      {/* 4. Timeline View */}
      {hasGenerated && !isGenerating && (
        <div className="roadmap-results fade-in-up">
          <div className="results-header">
            <div>
              <h2>Your Custom Prep Schedule</h2>
              <p>Target: {formData.role} at {formData.company}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setHasGenerated(false)}>
                Configure Options
              </button>
              <button className="btn btn-primary download-btn" onClick={() => window.print()}>
                <Download size={18} />
                Download Plan
              </button>
            </div>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {roadmapData.map((weekData) => {
              const weekNum = weekData.week_number;
              return (
                <div key={weekNum} className="timeline-item">
                  <div className="timeline-dot current"></div>
                  <div className="timeline-card glass-card hover-up">
                    <div className="timeline-card-header">
                      <h3>Week {weekNum}: {weekData.theme}</h3>
                      <span className="skill-badge">{weekData.skill_badge}</span>
                    </div>
                    
                    <ul className="tasks-list">
                      {weekData.tasks.map((task, tidx) => {
                        const isDone = completedTasks[`week_${weekNum}_task_${tidx}`];
                        return (
                          <li key={tidx} className="timeline-task" style={{ cursor: 'pointer' }} onClick={() => toggleTask(weekNum, tidx)}>
                            {isDone ? (
                              <CheckCircle size={18} className="task-icon done" color="#4ADE80" />
                            ) : (
                              <Circle size={18} className="task-icon pending" color="#cbd5e1" />
                            )}
                            <span className={`${isDone ? 'text-done' : ''}`} style={isDone ? { textDecoration: 'line-through', color: '#64748b' } : {}}>{task}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
