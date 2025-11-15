import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'general', index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy', index: true }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Question', QuestionSchema);
