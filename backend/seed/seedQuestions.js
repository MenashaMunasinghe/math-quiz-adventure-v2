import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../src/models/Question.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/space_quiz_db';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const file = path.join(process.cwd(), 'data', 'questions.json');
  const raw = fs.readFileSync(file, 'utf-8');
  const docs = JSON.parse(raw);

  // Clear and insert
  await Question.deleteMany({});
  await Question.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} questions.`);

  await mongoose.disconnect();
  console.log('✅ Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
