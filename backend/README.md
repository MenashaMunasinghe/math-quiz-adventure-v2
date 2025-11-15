# Space Quiz Backend (Express + MongoDB)

**What you get**
- Login/Register (JWT)
- Random quiz every time using MongoDB `$sample`
- Submit answers server-side, compute score securely
- Leaderboard by highest score

## Quick start
1. Install Node.js (v18+ recommended) and MongoDB.
2. Copy `.env.example` to `.env` and set values:
   ```env
   PORT=8081
   MONGO_URI=mongodb://localhost:27017/space_quiz_db
   JWT_SECRET=change_me
   ```
3. Install deps and seed questions:
   ```bash
   npm install
   npm run seed
   npm run dev
   ```
4. Test endpoints:
   - `POST /auth/register` `{ "username": "player1", "email": "p1@mail.com", "password": "secret" }`
   - `POST /auth/login` -> returns `{ token }`
   - `GET  /quiz/start?count=10&category=space&difficulty=easy` -> returns randomized questions (no answers)
   - `POST /quiz/submit` with header `Authorization: Bearer <token>`:
     ```json
     {
       "answers": [
         { "questionId": "<id>", "selectedIndex": 2 },
         { "questionId": "<id>", "selectedIndex": 1 }
       ],
       "durationSec": 45
     }
     ```
   - `GET /leaderboard/top?limit=20`
   - `GET /leaderboard/me` (requires Bearer token)

## Database schemas (MongoDB)
**User**
```js
{
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  highScore: Number
}
```

**Question**
```js
{
  text: String,
  options: [String],
  correctIndex: Number,
  category: String,
  difficulty: 'easy'|'medium'|'hard'
}
```

**QuizAttempt**
```js
{
  userId: ObjectId(User),
  score: Number,
  total: Number,
  durationSec: Number,
  createdAt: Date
}
```

> Randomization is done with MongoDB aggregation: `[{ $match }, { $sample: { size: N } }]`.

## Frontend integration (example fetch)
```js
// Get token from login, then:
const res = await fetch('http://localhost:8081/quiz/start?count=10');
const { questions } = await res.json();

// Submit (with auth)
await fetch('http://localhost:8081/quiz/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ answers, durationSec: 42 })
});
```

## Notes
- Server never exposes the correct answer in `/quiz/start`.
- Leaderboard uses `User.highScore` (updated on submit if beaten).
- You can categorize questions by `category` or `difficulty` and still get random selection.
