import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Bot, UploadCloud, ChevronUp, PlayCircle, Loader2, Award, Clock, ArrowRight, BookOpen, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './InterviewPrep.css';

const PREDEFINED_CATEGORIES = ['DSA', 'OOPs', 'System Design', 'SQL', 'Web Dev', 'HR Questions'];

const CATEGORY_FALLBACK_QUESTIONS = {
  'DSA': [
    { question: 'Explain the difference between a Stack and a Queue.', answer_hint: 'Hint: A stack is Last-In-First-Out (LIFO), whereas a queue is First-In-First-Out (FIFO).' },
    { question: 'What is the time complexity of searching in a Balanced Binary Search Tree?', answer_hint: 'Hint: In a balanced BST (like AVL or Red-Black), search is O(log n) because the tree height is balanced.' },
    { question: 'When would you use a Hash Table over an Array?', answer_hint: 'Hint: Use hash tables when you need O(1) key-based lookups and searches rather than index-based access.' },
    { question: 'Explain how Merge Sort works and state its time complexity.', answer_hint: 'Hint: It uses divide-and-conquer to split the array, sort sub-arrays, and merge them. Time complexity is O(n log n) in all cases.' },
    { question: 'What is the difference between Depth First Search (DFS) and Breadth First Search (BFS)?', answer_hint: 'Hint: DFS uses a stack/recursion to go deep down a branch first; BFS uses a queue to traverse level-by-level.' },
    { question: 'What is a collision in a Hash Map, and how is it resolved?', answer_hint: 'Hint: Collision occurs when two keys map to the same index. Resolved using chaining (linked lists) or open addressing (linear probing).' },
    { question: 'Explain the concept of Dynamic Programming.', answer_hint: 'Hint: It solves complex problems by breaking them into overlapping subproblems, solving them once, and storing results (memoization/tabulation).' },
    { question: 'How do you detect a cycle in a Linked List?', answer_hint: 'Hint: Use Floyd\'s Cycle-Finding Algorithm (two pointers: slow moving 1 step, fast moving 2 steps).' },
    { question: 'What is the difference between a binary tree and a binary search tree?', answer_hint: 'Hint: In a BST, for every node, left child elements are smaller and right child elements are larger.' },
    { question: 'Explain the difference between time complexity and space complexity.', answer_hint: 'Hint: Time complexity measures execution time scaling; space complexity measures auxiliary memory scaling with input size.' }
  ],
  'OOPs': [
    { question: 'What are the four main pillars of Object-Oriented Programming?', answer_hint: 'Hint: Encapsulation, Inheritance, Polymorphism, and Abstraction.' },
    { question: 'Explain the difference between Method Overloading and Method Overriding.', answer_hint: 'Hint: Overloading is compile-time (same method name, different parameters); Overriding is runtime (subclass redefines parent method).' },
    { question: 'What is the difference between an Abstract Class and an Interface?', answer_hint: 'Hint: Abstract classes can have state/concrete methods; Interfaces define a contract (traditionally all methods abstract, though modern languages support defaults).' },
    { question: 'Explain the concept of Encapsulation and its benefit.', answer_hint: 'Hint: Encapsulation wraps data (variables) and code (methods) together and hides variables using private modifiers to ensure security.' },
    { question: 'What is inheritance, and what are its types?', answer_hint: 'Hint: Inheritance allows a class to acquire properties/methods of another. Types include Single, Multiple (via interfaces), Multilevel, Hierarchical.' },
    { question: 'What is Polymorphism? Provide a real-world example.', answer_hint: 'Hint: Polymorphism means "many forms". Example: a "Shape" class with a "draw()" method implemented differently by Circle and Square.' },
    { question: 'What is a Constructor? Can it be inherited?', answer_hint: 'Hint: A constructor initializes a newly created object. No, constructors cannot be inherited, but subclasses call parent constructors using "super()".' },
    { question: 'Explain the difference between aggregation and composition.', answer_hint: 'Hint: Aggregation is a weak relationship ("has-a" e.g. Library and Student); Composition is a strong relationship ("belongs-to" e.g. House and Room).' },
    { question: 'What is abstraction, and how is it achieved in OOP?', answer_hint: 'Hint: Abstraction hides implementation details and shows only functionality. Achieved using abstract classes and interfaces.' },
    { question: 'What does the "this" keyword represent in OOP?', answer_hint: 'Hint: "this" represents the reference of the current object instance within a class method or constructor.' }
  ],
  'System Design': [
    { question: 'What is the difference between Horizontal Scaling and Vertical Scaling?', answer_hint: 'Hint: Vertical is adding more power (CPU/RAM) to an existing machine; Horizontal is adding more machines to the network pool.' },
    { question: 'Explain what a Load Balancer does.', answer_hint: 'Hint: A Load Balancer distributes incoming network traffic across multiple backend servers to prevent overload and ensure high availability.' },
    { question: 'What is the CAP Theorem?', answer_hint: 'Hint: CAP states a distributed system can only guarantee two out of three: Consistency, Availability, and Partition Tolerance.' },
    { question: 'Explain the difference between SQL and NoSQL databases.', answer_hint: 'Hint: SQL databases are relational, structured (schemas), and ACID compliant; NoSQL databases are non-relational, distributed, and schema-flexible.' },
    { question: 'What is caching, and where can it be applied?', answer_hint: 'Hint: Caching stores copy of frequently accessed data in fast memory (e.g. Redis). Applied at client browser, CDN, database query, or server levels.' },
    { question: 'Explain how Content Delivery Networks (CDNs) speed up content delivery.', answer_hint: 'Hint: CDNs cache static files (images, files) on geographically distributed edge servers closest to the user request.' },
    { question: 'What is Database Sharding?', answer_hint: 'Hint: Sharding splits a large database horizontally across multiple database engines or machines based on a shard key.' },
    { question: 'Explain the difference between Monolith and Microservices architectures.', answer_hint: 'Hint: Monolith is a single unified application code base; Microservices splits functionality into separate, independent HTTP/gRPC services.' },
    { question: 'What is a Message Queue, and why is it used?', answer_hint: 'Hint: MQs (like RabbitMQ or Kafka) enable asynchronous communication between microservices, decoupling tasks and improving reliability.' },
    { question: 'How does DNS (Domain Name System) work?', answer_hint: 'Hint: DNS acts as the phonebook of the internet, resolving human-readable domain names (example.com) to machine IP addresses.' }
  ],
  'SQL': [
    { question: 'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?', answer_hint: 'Hint: INNER returns matching rows; LEFT returns all rows from left table plus matching right; RIGHT returns all right rows plus matching left.' },
    { question: 'What is an Index in SQL, and why is it useful?', answer_hint: 'Hint: An index speeds up data retrieval queries at the cost of slower write speeds (INSERT/UPDATE).' },
    { question: 'Explain the difference between WHERE and HAVING clauses.', answer_hint: 'Hint: WHERE filters individual rows before grouping; HAVING filters grouped summaries after GROUP BY is applied.' },
    { question: 'What are database Transactions and ACID properties?', answer_hint: 'Hint: Transactions are sequential DB operations. ACID stands for Atomicity, Consistency, Isolation, and Durability.' },
    { question: 'What is normalization in databases, and why do we normalize?', answer_hint: 'Hint: Normalization organizes table columns to reduce data redundancy and eliminate anomalies (1NF, 2NF, 3NF).' },
    { question: 'What is a primary key vs a foreign key?', answer_hint: 'Hint: A primary key uniquely identifies a row in a table. A foreign key references a primary key in another table to link records.' },
    { question: 'Explain the difference between clustered and non-clustered indexes.', answer_hint: 'Hint: A clustered index defines the physical order of table storage (1 per table); a non-clustered index creates a separate pointer list.' },
    { question: 'What is a SQL View?', answer_hint: 'Hint: A view is a virtual table containing results of a pre-defined SELECT query.' },
    { question: 'What are SQL aggregate functions? List three examples.', answer_hint: 'Hint: Functions performing calculations on multiple rows returning a single value: SUM(), AVG(), COUNT(), MAX(), MIN().' },
    { question: 'What is a Subquery, and what is its difference from a Join?', answer_hint: 'Hint: A subquery is a nested query inside another statement. Joins are usually faster as databases optimize execution paths.' }
  ],
  'Web Dev': [
    { question: 'Explain the difference between Session Storage, Local Storage, and Cookies.', answer_hint: 'Hint: SessionStorage lasts for tab session; LocalStorage persists across tab closes; Cookies are sent with every HTTP request (max 4KB).' },
    { question: 'What is the DOM, and what does DOM manipulation mean?', answer_hint: 'Hint: Document Object Model is an object representation of HTML pages. Manipulation is updating DOM elements via JS APIs.' },
    { question: 'Explain CORS (Cross-Origin Resource Sharing).', answer_hint: 'Hint: CORS is a browser security mechanism that restricts web applications from making HTTP requests to a different domain than the host.' },
    { question: 'What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?', answer_hint: 'Hint: CSR builds page in browser using JS bundles; SSR pre-renders fully compiled HTML on server before sending to client.' },
    { question: 'What is the purpose of React hooks? Name three basic hooks.', answer_hint: 'Hint: Hooks let functional components use state and lifecycle methods. Basic hooks: useState, useEffect, useContext.' },
    { question: 'What is a Virtual DOM in React, and how does it improve performance?', answer_hint: 'Hint: React holds a copy of real DOM in memory. Diffing algorithm matches updates and applies changes in batches to real DOM.' },
    { question: 'Explain the difference between HTTP GET and POST requests.', answer_hint: 'Hint: GET requests parameters in URL header (retrieve data); POST requests parameters in message body (create/update data).' },
    { question: 'What is CSS Flexbox vs CSS Grid?', answer_hint: 'Hint: Flexbox is one-dimensional layout (row or column); Grid is two-dimensional layout (rows and columns simultaneously).' },
    { question: 'What is a Promise in JavaScript? What are its three states?', answer_hint: 'Hint: A promise handles asynchronous operations. States: Pending, Fulfilled, Rejected.' },
    { question: 'Explain standard REST API principles.', answer_hint: 'Hint: Stateless client-server architecture using standard HTTP verbs (GET, POST, PUT, DELETE) mapping to CRUD actions.' }
  ],
  'HR Questions': [
    { question: 'Tell me about yourself.', answer_hint: 'Hint: Structure using the Present-Past-Future formula (current role, key past achievements, why you are excited for this target role).' },
    { question: 'What is your greatest strength and weakness?', answer_hint: 'Hint: Strength should align with target role requirements; Weakness should be genuine but paired with active steps you take to overcome it.' },
    { question: 'Why do you want to work for our company?', answer_hint: 'Hint: Research the company\'s mission, products, and culture. Link it to your personal career aspirations and values.' },
    { question: 'Describe a time you faced a conflict in a project and how you resolved it.', answer_hint: 'Hint: Use the STAR method (Situation, Task, Action, Result) focusing on open communication and positive professional outcomes.' },
    { question: 'Where do you see yourself in five years?', answer_hint: 'Hint: Show ambition but realism. Focus on skill mastery, increasing responsibilities, and leadership growth in the domain.' },
    { question: 'Why should we hire you?', answer_hint: 'Hint: Summarize your relevant tech skills, project experience, and enthusiasm to deliver immediate value to the team.' },
    { question: 'Tell me about a time you failed and what you learned.', answer_hint: 'Hint: Choose a real technical/project mistake, focus on taking ownership, resolving the impact, and what permanent system lessons you took away.' },
    { question: 'How do you handle tight deadlines and high pressure?', answer_hint: 'Hint: Explain your prioritization workflow, how you set milestones, communicate issues to stakeholders early, and stay focused.' },
    { question: 'Do you prefer working alone or in a team? Why?', answer_hint: 'Hint: Balance. Express ability to execute individual tasks independently, but emphasize value of collaboration and code reviews.' },
    { question: 'Do you have any questions for us?', answer_hint: 'Hint: Ask about day-to-day team engineering culture, upcoming technical projects, or expectations for the first 90 days.' }
  ]
};

const generateLocalResumeQuestions = (resumeText) => {
  const resumeLower = resumeText.toLowerCase();
  
  const techKeywords = [
    { key: 'react', q: 'Explain a technical challenge you faced when building UI components in React.', hint: 'Discuss state management, virtual DOM rendering performance, or hook dependency loops.' },
    { key: 'node', q: 'How did you handle route authentication and security in your Node.js backend?', hint: 'Discuss JWT middleware, token validation, password hashing (bcrypt), and CORS configs.' },
    { key: 'python', q: 'What libraries did you use in Python, and how did you verify model or data scaling?', hint: 'Explain scikit-learn models, numpy vectors, pandas processing pipelines, or performance checks.' },
    { key: 'sql', q: 'How did you optimize queries or structure schemas in your SQL database?', hint: 'Discuss normalization, foreign key relations, indices, or query profiling.' },
    { key: 'docker', q: 'Explain your containerization workflow using Docker.', hint: 'Detail Dockerfile optimization, multi-stage builds, or container communication via Docker Compose.' },
    { key: 'aws', q: 'Explain how you configured cloud hosting or storage on AWS.', hint: 'Discuss EC2, S3 bucket permissions, IAM roles, or serverless lambda functions.' },
    { key: 'flutter', q: 'Explain how you structured state management in your mobile Flutter project.', hint: 'Discuss Provider, Bloc, or Riverpod, and how you handled API callbacks.' }
  ];

  const matched = techKeywords.filter(item => resumeLower.includes(item.key));
  const questions = matched.map(m => ({ question: m.q, answer_hint: m.hint }));
  
  const defaultQs = [
    { question: "Walk me through the architecture of your main resume project.", hint: "Describe frontend architecture, backend endpoints, database structure, and deployment channels." },
    { question: "Explain a difficult bug you encountered in your projects and how you diagnosed it.", hint: "Discuss using logging, browser devtools, network logs, or step-through debugging." },
    { question: "How did you manage database relations and consistency in your projects?", hint: "Discuss ACID transactions, schema design, or ORM/ODM choices." },
    { question: "Explain how you managed Git branches and code reviews during project changes.", hint: "Discuss feature branch models, handling conflicts, pull request verification, or CI checks." },
    { question: "If you had to rebuild your portfolio projects from scratch, what architectural choices would you change?", hint: "Focus on performance limitations, tech stack constraints, scalability, or framework choice benefits." }
  ];

  while (questions.length < 5 && defaultQs.length > 0) {
    const nextQ = defaultQs.shift();
    if (!questions.some(q => q.question === nextQ.question)) {
      questions.push(nextQ);
    }
  }

  return questions.slice(0, 5);
};

const evaluateAnswerLocally = (questionText, answerText) => {
  const answerLower = answerText.toLowerCase();
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 6) {
    return {
      score: 3,
      strengths: "Your response was recorded.",
      missing: "Your answer is too short. Try to explain the technical concepts in more detail, providing real-world examples or implementations.",
      model_answer: "Explain technical definitions, code details, and practical examples to build a stronger response."
    };
  }

  const keywordsMap = [
    { keys: ['stack', 'queue'], expected: ['lifo', 'fifo', 'push', 'pop', 'enqueue', 'dequeue'], model: "A Stack is a LIFO (Last In First Out) structure where operations happen at one end (push/pop). A Queue is a FIFO (First In First Out) structure where elements are added at the rear and removed from the front (enqueue/dequeue)." },
    { keys: ['polymorphism', ' pillar'], expected: ['overload', 'override', 'runtime', 'compile', 'subclass', 'interface'], model: "Polymorphism means 'many forms'. Method overloading is compile-time (same name, different signatures), whereas method overriding is runtime (subclass redefines parent method)." },
    { keys: ['abstract', 'interface'], expected: ['contract', 'state', 'inheritance', 'concrete', 'method'], model: "Abstract classes can hold state (member variables) and provide concrete method implementations. Interfaces define a pure contract (behaviors) and allow multiple inheritance." },
    { keys: ['horizontal', 'vertical', 'scaling'], expected: ['server', 'cpu', 'ram', 'machine', 'load balancer'], model: "Vertical scaling increases resources (CPU/RAM) of a single server (scale up). Horizontal scaling adds more machines to the pool (scale out), utilizing load balancers to distribute traffic." },
    { keys: ['load balancer'], expected: ['distribute', 'traffic', 'server', 'redundancy', 'routing'], model: "A load balancer acts as a reverse proxy, distributing incoming network traffic across multiple servers to improve performance, concurrency, and reliability." },
    { keys: ['sql', 'nosql'], expected: ['relational', 'schema', 'acid', 'flexible', 'document', 'join'], model: "SQL databases are relational, table-based, structured (schemas), and ACID-compliant. NoSQL databases are non-relational, distributed, schema-flexible, and scale horizontally." },
    { keys: ['caching', 'cache'], expected: ['redis', 'memory', 'speed', 'read', 'expiry', 'latency'], model: "Caching stores copies of database queries or files in fast-access memory (like Redis or Memcached) to reduce database read load and page load times." },
    { keys: ['index', 'indices'], expected: ['speed', 'search', 'query', 'write', 'table'], model: "An index is a data structure (like B-Tree) that speeds up SELECT queries on tables, but adds storage overhead and slows down write operations (INSERT/UPDATE)." },
    { keys: ['cors'], expected: ['origin', 'browser', 'header', 'security', 'domain'], model: "CORS (Cross-Origin Resource Sharing) is a browser safety mechanism that uses HTTP headers to restrict script-based cross-origin requests." }
  ];

  const questionLower = questionText.toLowerCase();
  const matchedSet = keywordsMap.find(set => set.keys.some(k => questionLower.includes(k)));

  let found = [];
  let missing = [];
  let score = 5;

  if (matchedSet) {
    found = matchedSet.expected.filter(kw => answerLower.includes(kw));
    missing = matchedSet.expected.filter(kw => !answerLower.includes(kw));
    const matchRatio = found.length / matchedSet.expected.length;
    score = Math.round(5 + (matchRatio * 4));
    if (wordCount > 40) score = Math.min(score + 1, 10);
  } else {
    const genericExpected = ['state', 'component', 'props', 'api', 'database', 'logic', 'performance', 'error', 'debug'];
    found = genericExpected.filter(kw => answerLower.includes(kw));
    missing = genericExpected.filter(kw => !answerLower.includes(kw)).slice(0, 3);
    
    if (found.length >= 3) score = 8;
    else if (found.length >= 1) score = 7;
    else score = 6;
  }

  return {
    score,
    strengths: found.length > 0 ? `Good job explaining the core terms like: ${found.join(', ')}.` : "You provided a structured response.",
    missing: missing.length > 0 ? `Consider expanding your answer to explain concepts like: ${missing.join(', ')}.` : "No major technical keywords were missing. Try to provide concrete examples.",
    model_answer: matchedSet ? matchedSet.model : "Structure: 1. State definition/objective. 2. Mention details of architecture/hooks/dependencies. 3. Detail performance implications and testing."
  };
};

const InterviewPrep = () => {
  const { currentUser, isDemo } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('OOPs');
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Simulator states
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewTime, setInterviewTime] = useState(0);
  const [completedAnswers, setCompletedAnswers] = useState([]); 
  const [evaluationFeedback, setEvaluationFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fetch standard category questions
  useEffect(() => {
    const fetchCategoryQuestions = async () => {
      setLoadingBank(true);
      const prompt = `Generate exactly 10 common technical interview questions for the category: ${selectedSkill}. Return ONLY a raw JSON array of objects with keys "question" and "answer_hint". No markdown codeblocks.`;
      const apiKey = import.meta.env.VITE_API_KEY;
      let data = null;
      let parsed = null;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
          console.warn("Gemini 2.5-flash failed, trying 1.5-flash fallback...", data);
          const response15 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data15 = await response15.json();
          if (!data15.candidates || data15.candidates.length === 0) {
            throw new Error("API Limit Reached");
          }
          data = data15;
        }

        const text = data.candidates[0].content.parts[0].text;
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch (err) {
        console.warn("Failed to fetch questions via API, falling back to local list:", err);
        parsed = CATEGORY_FALLBACK_QUESTIONS[selectedSkill] || CATEGORY_FALLBACK_QUESTIONS['OOPs'];
      } finally {
        setBankQuestions(parsed);
        setLoadingBank(false);
        setOpenAccordions({});
      }
    };
    fetchCategoryQuestions();
  }, [selectedSkill]);

  // Load previous mock interview results and latest resume questions on mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      // Load previous mock interview results
      setLoadingHistory(true);
      try {
        const historyRes = await fetch(`http://localhost:3000/api/interview/results/${currentUser.uid}`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.status === 'success') {
            setPreviousResults(historyData.results || []);
          }
        }
      } catch (err) {
        console.error("Failed to load interview history:", err);
      } finally {
        setLoadingHistory(false);
      }

      // Load latest resume to generate questions if available
      try {
        const resumeRes = await fetch(`http://localhost:3000/api/resume/latest/${currentUser.uid}`);
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          if (resumeData.status === 'success' && resumeData.analysis) {
            const parsedText = resumeData.analysis.parsedText || "";
            if (parsedText) {
              setIsUploading(true);
              const prompt = `Based on the following parsed resume text, generate 5 highly specific technical interview questions related to the projects and skills explicitly mentioned in it. Return ONLY a JSON array of objects formatted exactly like this: [{"question": "...", "answer_hint": "..."}]. No markdown code blocks. Resume Text: ${parsedText.substring(0, 3000)}`;
              const apiKey = import.meta.env.VITE_API_KEY;
              let questions = [];

              try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await response.json();
                
                let dataCandidates = data;
                if (!data.candidates || data.candidates.length === 0) {
                  console.warn("Gemini 2.5-flash failed, trying 1.5-flash fallback...", data);
                  const response15 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                  });
                  const data15 = await response15.json();
                  if (!data15.candidates || data15.candidates.length === 0) {
                    throw new Error("API Limit Reached");
                  }
                  dataCandidates = data15;
                }

                const rawText = dataCandidates.candidates[0].content.parts[0].text;
                questions = JSON.parse(rawText.replace(/```json|```/g, "").trim());
              } catch (geminiErr) {
                console.warn("Gemini resume questions failed for loaded resume. Generating locally...", geminiErr);
                questions = generateLocalResumeQuestions(parsedText);
              }

              setAiChatMessages(questions);
              setResumeUploaded(true);
              setIsUploading(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load latest resume in InterviewPrep:", err);
      }
    };
    loadData();
  }, [currentUser]);

  // Save interview results to MongoDB when the session completes
  useEffect(() => {
    const saveResult = async () => {
      if (isSimulatorActive && currentQuestionIdx === aiChatMessages.length && completedAnswers.length > 0 && currentUser) {
        try {
          const finalScore = completedAnswers.reduce((sum, item) => sum + item.score, 0) / completedAnswers.length;
          const payload = {
            userId: currentUser.uid,
            category: resumeUploaded ? 'Resume-Based' : selectedSkill,
            averageScore: Number(finalScore.toFixed(1)),
            duration: interviewTime,
            answers: completedAnswers.map(ans => ({
              question: ans.question,
              userAnswer: ans.userAnswer,
              score: ans.score,
              evaluation: {
                score: ans.evaluation.score,
                strengths: ans.evaluation.strengths,
                missing: ans.evaluation.missing,
                model_answer: ans.evaluation.model_answer
              }
            }))
          };

          const res = await fetch('http://localhost:3000/api/interview/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
              setPreviousResults(prev => [data.result, ...prev]);
            }
          }
        } catch (err) {
          console.error("Failed to save mock interview result to MongoDB:", err);
        }
      }
    };
    saveResult();
  }, [currentQuestionIdx, aiChatMessages.length, completedAnswers, currentUser, isSimulatorActive]);

  // Timer effect for simulator
  useEffect(() => {
    let timer = null;
    if (isSimulatorActive && !evaluationFeedback) {
      timer = setInterval(() => {
        setInterviewTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSimulatorActive, evaluationFeedback]);

  const toggleAccordion = (index) => {
    setOpenAccordions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    let questions = null;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }

      const prompt = `Based on the following parsed resume text, generate 5 highly specific technical interview questions related to the projects and skills explicitly mentioned in it. Return ONLY a JSON array of objects formatted exactly like this: [{"question": "...", "answer_hint": "..."}]. No markdown code blocks. Resume Text: ${fullText.substring(0, 3000)}`;
      const apiKey = import.meta.env.VITE_API_KEY;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        
        let dataCandidates = data;
        if (!data.candidates || data.candidates.length === 0) {
          console.warn("Gemini 2.5-flash failed, trying 1.5-flash fallback...", data);
          const response15 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data15 = await response15.json();
          if (!data15.candidates || data15.candidates.length === 0) {
            throw new Error("API Limit Reached");
          }
          dataCandidates = data15;
        }

        const rawText = dataCandidates.candidates[0].content.parts[0].text;
        questions = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      } catch (geminiErr) {
        console.warn("Gemini resume questions failed. Generating locally...", geminiErr);
        questions = generateLocalResumeQuestions(fullText);
      }

      setAiChatMessages(questions);
      setResumeUploaded(true);

      // Convert file to base64
      const reader = new FileReader();
      const fileDataBase64 = await new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      // Save to MongoDB
      if (currentUser) {
        try {
          await fetch('http://localhost:3000/api/resume/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              fileName: file.name,
              fileData: fileDataBase64,
              parsedText: fullText,
              ats_score: 75,
              key_skills: [],
              missing_skills: [],
              tips: [],
              isOfflineMode: false
            })
          });
        } catch (dbErr) {
          console.error("Failed to save resume in InterviewPrep:", dbErr);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Please ensure it's a valid text-based PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const startSimulator = () => {
    setIsSimulatorActive(true);
    setCurrentQuestionIdx(0);
    setUserAnswer('');
    setInterviewTime(0);
    setCompletedAnswers([]);
    setEvaluationFeedback(null);
  };

  const stopSimulator = () => {
    setIsSimulatorActive(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setIsOfflineMode(false);
    const activeQuestion = aiChatMessages[currentQuestionIdx].question;
    const apiKey = import.meta.env.VITE_API_KEY;

    const prompt = `You are a strict technical recruiter evaluating a candidate's response to an interview question. 
    Question: "${activeQuestion}"
    Candidate Response: "${userAnswer}"
    
    Evaluate the response. Return ONLY a valid JSON object matching the structure: 
    {
      "score": number between 1 and 10,
      "strengths": "Short sentence explaining what was good in their answer.",
      "missing": "Short sentence explaining key details or concepts they missed.",
      "model_answer": "A concise, correct model answer for this question."
    }
    No extra text or markdown formatting.`;

    let evaluation = null;
    let offline = false;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      
      let dataCandidates = data;
      if (!data.candidates || data.candidates.length === 0) {
        console.warn("Gemini 2.5-flash failed, trying 1.5-flash fallback...", data);
        const response15 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data15 = await response15.json();
        if (!data15.candidates || data15.candidates.length === 0) {
          throw new Error("API Limit Reached");
        }
        dataCandidates = data15;
      }

      const rawText = dataCandidates.candidates[0].content.parts[0].text;
      evaluation = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch (err) {
      console.warn("Gemini evaluation failed, evaluating locally:", err);
      evaluation = evaluateAnswerLocally(activeQuestion, userAnswer);
      offline = true;
    }

    setEvaluationFeedback(evaluation);
    setIsOfflineMode(offline);
    setIsEvaluating(false);

    // Save answer
    setCompletedAnswers(prev => [
      ...prev,
      {
        question: activeQuestion,
        userAnswer: userAnswer,
        score: evaluation.score,
        evaluation: evaluation
      }
    ]);
  };

  const nextQuestion = () => {
    setEvaluationFeedback(null);
    setUserAnswer('');
    setCurrentQuestionIdx(prev => prev + 1);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
  };

  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const activeQuestion = aiChatMessages[currentQuestionIdx];
  const averageScore = completedAnswers.length > 0 
    ? (completedAnswers.reduce((sum, item) => sum + item.score, 0) / completedAnswers.length).toFixed(1)
    : 0;

  return (
    <div className="interview-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Ace Your Interview 💼</h1>
        <p className="page-subtitle">Master topical questions and practice targeted AI mocks based on your resume.</p>
      </div>

      {isSimulatorActive ? (
        /* Immersive Interview Simulator */
        <div className="simulator-console glass-card slide-up">
          <div className="simulator-header">
            <div className="sim-title">
              <span className="live-dot pulse"></span>
              <h3>Interactive Mock Interview</h3>
            </div>
            <div className="sim-meta">
              <div className="timer-badge">
                <Clock size={16} />
                <span>{formatTime(interviewTime)}</span>
              </div>
              <button className="btn-close" onClick={stopSimulator}>
                <XCircle size={22} />
              </button>
            </div>
          </div>

          <div className="sim-progress-bar">
            <div className="sim-progress-fill" style={{ width: `${((currentQuestionIdx + (evaluationFeedback ? 1 : 0)) / aiChatMessages.length) * 100}%` }}></div>
          </div>

          {currentQuestionIdx < aiChatMessages.length ? (
            <div className="sim-layout">
              {/* Left Column: Question Details */}
              <div className="sim-panel left">
                <span className="q-badge">Question {currentQuestionIdx + 1} of {aiChatMessages.length}</span>
                <h2 className="sim-question-text">{activeQuestion.question}</h2>
                
                {evaluationFeedback ? (
                  /* Answer Evaluation Results Card */
                  <div className="evaluation-report slide-up mt-4">
                    <div className="eval-score-header">
                      <div className="score-ring-wrap">
                        <span className="score-num">{evaluationFeedback.score}</span>
                        <span className="score-max">/10</span>
                      </div>
                      <div>
                        <h4>Technical Evaluation</h4>
                        <p className="text-secondary">AI feedback on correctness and coverage.</p>
                      </div>
                    </div>

                    {isOfflineMode && (
                      <div className="offline-mini-badge">
                        <AlertCircle size={14} /> Offline matching active
                      </div>
                    )}

                    <div className="feedback-section green mt-3">
                      <h5>✅ Key Strengths</h5>
                      <p>{evaluationFeedback.strengths}</p>
                    </div>

                    <div className="feedback-section red mt-3">
                      <h5>⚠️ Area of Improvement</h5>
                      <p>{evaluationFeedback.missing}</p>
                    </div>

                    <div className="feedback-section blue mt-3">
                      <h5>💡 Expected Recruiter Answer</h5>
                      <p className="model-ans-text">{evaluationFeedback.model_answer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="hint-dropdown-card mt-4">
                    <div className="hint-dropdown-header">
                      <BookOpen size={18} color="var(--primary)" />
                      <span>Stuck? View answer strategy hint</span>
                    </div>
                    <p className="hint-desc-text">{activeQuestion.answer_hint}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Editor & Submission */}
              <div className="sim-panel right">
                <label className="editor-label">Your Technical Response</label>
                <textarea
                  className="answer-editor glass-input"
                  placeholder="Type your detailed answer here... (use standard industry terms to score higher)"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isEvaluating || evaluationFeedback !== null}
                ></textarea>

                <div className="editor-footer">
                  <span className="word-counter">{wordCount} words</span>
                  
                  {isEvaluating ? (
                    <button className="btn btn-primary px-5 py-3 flex items-center gap-2" disabled>
                      <Loader2 className="spinner" size={18} /> Evaluating...
                    </button>
                  ) : evaluationFeedback ? (
                    currentQuestionIdx < aiChatMessages.length - 1 ? (
                      <button className="btn btn-primary px-5 py-3 flex items-center gap-2" onClick={nextQuestion}>
                        Next Question <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button className="btn btn-primary px-5 py-3 flex items-center gap-2 btn-glow" onClick={() => setCurrentQuestionIdx(aiChatMessages.length)}>
                        View Performance Report <ArrowRight size={18} />
                      </button>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-outline" onClick={nextQuestion}>
                        Skip Question
                      </button>
                      <button className="btn btn-primary px-5 py-3 flex items-center gap-2 btn-glow" onClick={submitAnswer} disabled={!userAnswer.trim()}>
                        Submit Answer <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Interview Report Card */
            <div className="report-card-container text-center py-5 slide-up">
              <Award className="mx-auto text-primary animate-bounce mb-3" size={64} />
              <h2>Interview Session Complete! 🎉</h2>
              <p className="text-secondary mt-2">Here is your technical interview report card based on benchmark standards.</p>

              <div className="score-stats-grid mt-4">
                <div className="score-stat-box glass-card">
                  <h4>Average Performance Score</h4>
                  <div className="big-score">{averageScore}<span>/10</span></div>
                  <span className={`pill ${averageScore >= 8 ? 'pill-green' : averageScore >= 6 ? 'pill-blue' : 'pill-red'}`}>
                    {averageScore >= 8 ? 'Strong Match' : averageScore >= 6 ? 'In Progress' : 'Action Required'}
                  </span>
                </div>
                <div className="score-stat-box glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4>Session Duration</h4>
                  <div className="time-display">{formatTime(interviewTime)}</div>
                  <p className="text-secondary mt-2">Questions Answered: {completedAnswers.length} of {aiChatMessages.length}</p>
                </div>
              </div>

              <div className="summary-list text-left mt-5">
                <h3 className="mb-4">Question Breakdown</h3>
                {completedAnswers.map((item, idx) => (
                  <div key={idx} className="review-item glass-card mb-3" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4>Q{idx + 1}: {item.question}</h4>
                      <span className="pill pill-blue" style={{ fontSize: '0.8rem' }}>Score: {item.score}/10</span>
                    </div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '10px' }}>
                      " {item.userAnswer} "
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <strong>Feedback:</strong> {item.evaluation.strengths} {item.evaluation.missing}
                    </p>
                  </div>
                ))}
              </div>

              <div className="report-actions mt-5">
                <button className="btn btn-outline" style={{ marginRight: '10px' }} onClick={startSimulator}>
                  <RefreshCw size={18} style={{ marginRight: '8px' }} /> Retry Mock Interview
                </button>
                <button className="btn btn-primary btn-glow" onClick={stopSimulator}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Question Bank & Resume Scanner Menu */}
          <div className="prep-grid">
          {/* Left Column: Question Bank */}
          <div className="prep-column glass-card">
            <div className="column-header">
              <h3><PlayCircle className="icon" /> Standard Question Bank</h3>
            </div>
            
            <div className="dropdown-container">
              <select 
                className="glass-input full-width skill-select" 
                value={selectedSkill} 
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {PREDEFINED_CATEGORIES.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="accordion-list">
              {loadingBank ? (
                <div className="flex-center p-8 text-secondary">
                  <Loader2 className="spinner mr-2" /> Generating AI Questions...
                </div>
              ) : bankQuestions.map((item, idx) => (
                <div key={idx} className={`accordion-item glass-card hover-lift ${openAccordions[idx] ? 'open' : ''}`}>
                  <div className="accordion-header" onClick={() => toggleAccordion(idx)}>
                    <span className="q-text">{idx + 1}. {item.question}</span>
                    {openAccordions[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  {openAccordions[idx] && (
                    <div className="accordion-body fade-in">
                      <p className="a-hint-label">Answer Hint:</p>
                      <p>{item.answer_hint}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Resume Based AI */}
          <div className="prep-column glass-card">
            <div className="column-header">
              <h3><Bot className="icon" /> Resume-Based Questions</h3>
            </div>

            {!resumeUploaded ? (
              <div className="upload-prompt text-center mt-4" style={{ cursor: 'pointer', position: 'relative' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <UploadCloud size={48} className="upload-icon mx-auto mb-3" />
                <h4>Upload your resume (PDF) to get personalized technical questions.</h4>
                <p className="text-secondary mt-2 mb-4">Our AI will scan your technical stack and project constraints.</p>
                
                <button className={`btn btn-primary btn-glow ${isUploading ? 'loading' : ''}`} disabled={isUploading}>
                  {isUploading ? <><Loader2 className="spinner inline mr-1" size={16}/> Analyzing...</> : 'Browse PDF File'}
                </button>
              </div>
            ) : (
              <div className="chat-interface slide-up">
                <div className="chat-notification">
                  <span className="noti-dot pulse"></span> AI Analysis Complete
                </div>

                <div className="chat-panel-description mb-4 text-center">
                  <p className="text-secondary">Based on your parsed projects and skills, the AI has compiled 5 mock questions.</p>
                  <button className="btn btn-primary btn-glow mt-3 px-5 py-3 flex items-center gap-2 mx-auto" onClick={startSimulator}>
                    Start Live Mock Interview <ArrowRight size={18} />
                  </button>
                </div>

                <div className="chat-bubbles">
                  {aiChatMessages.map((msg, i) => (
                    <React.Fragment key={i}>
                      <div className="chat-bubble question bot fade-in" style={{animationDelay: `${i*0.2}s`}}>
                        <Bot size={16} className="bubble-icon" />
                        <div className="bubble-text">{msg.question}</div>
                      </div>
                      <div className="chat-bubble hint user fade-in" style={{animationDelay: `${(i*0.2)+0.1}s`}}>
                        <MessageSquare size={16} className="bubble-icon" />
                        <div className="bubble-text"><span className="font-bold">Strategy Hint:</span> {msg.answer_hint}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="chat-actions mt-4 text-center">
                  <button className="btn btn-outline" onClick={() => setResumeUploaded(false)}>Upload Different Resume</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Previous Mock Interviews History Section */}
          <div className="interview-history-section glass-card mt-5" style={{ marginTop: '2rem', padding: '2rem' }}>
            <div className="column-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontSize: '1.3rem' }}>
                <Award className="icon" /> Previous Mock Interview Sessions
              </h3>
            </div>
            {loadingHistory ? (
              <div className="flex-center p-8 text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 className="spinner mr-2" style={{ display: 'inline', marginRight: '8px' }} /> Loading History...
              </div>
            ) : previousResults.length === 0 ? (
              <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No mock interviews taken yet. Try a resume-based interview above!
              </div>
            ) : (
              <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {previousResults.map((result, idx) => (
                  <div key={idx} className="history-item glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                          {result.category} Mock Session
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Taken on {new Date(result.takenAt).toLocaleDateString()} at {new Date(result.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div className="timer-badge" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <Clock size={14} style={{ marginRight: '5px' }} />
                          <span>{formatTime(result.duration)}</span>
                        </div>
                        <div className="score-ring-wrap" style={{ width: '45px', height: '45px', fontSize: '1.1rem', background: 'rgba(79, 142, 247, 0.1)', border: '1.5px solid var(--accent-blue)', boxShadow: 'none' }}>
                          <span className="score-num">{result.averageScore}</span>
                        </div>
                      </div>
                    </div>
                    
                    <details style={{ marginTop: '1rem', cursor: 'pointer' }}>
                      <summary style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 600, outline: 'none', listStyle: 'none' }}>
                        View Question Breakdown ({result.answers?.length || 0} questions)
                      </summary>
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default' }}>
                        {result.answers?.map((ans, qIdx) => (
                          <div key={qIdx} style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.15)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                              <span style={{ color: 'var(--text-main)' }}>Q{qIdx + 1}: {ans.question}</span>
                              <span style={{ color: 'var(--accent-blue)' }}>Score: {ans.score}/10</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '8px' }}>
                              " {ans.userAnswer} "
                            </p>
                            <div style={{ background: 'rgba(74, 222, 128, 0.05)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.1)', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <strong style={{ color: '#4ade80' }}>Strengths:</strong> {ans.evaluation?.strengths}
                            </div>
                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <strong style={{ color: '#f87171' }}>Missing:</strong> {ans.evaluation?.missing}
                            </div>
                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.1)', fontSize: '0.85rem' }}>
                              <strong style={{ color: '#60a5fa' }}>Recruiter Answer:</strong> {ans.evaluation?.model_answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewPrep;
