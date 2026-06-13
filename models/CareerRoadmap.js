import mongoose from 'mongoose';

const careerRoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  months: { type: Number, default: 3 },
  roadmapData: { type: Array, default: [] }, // 12-week custom schedule list
  completedTasks: { type: Map, of: Boolean, default: {} }, // check marks tracking
  progress: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
});

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);
export default CareerRoadmap;
