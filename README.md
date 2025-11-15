## Math Quiz Adventure

A full-stack quiz game application with user registration, random question fetching, bonus math questions, and a leaderboard system.

**Tech Stack:**

- Backend: Node.js + Express + MongoDB
- Frontend: Vanilla HTML/CSS/JavaScript (ES6 modules)

---

## Quick Start

### Prerequisites

- Node.js v14+ and npm
- MongoDB running locally or connection string ready

### Backend Setup

1. Open a terminal and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend/` folder with:

```
MONGO_URI=mongodb://localhost:27017/space_quiz_db
JWT_SECRET=your_secret_here_change_in_production
PORT=8081
```

4. Seed the database with sample questions:

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev
```

The backend will run at `http://localhost:8081`.

### Frontend Setup

1. Navigate to the `frontend/` folder and serve it as static files. You can use any static server:

**Option A: Using `npx serve`** (requires npm installed)

```bash
cd frontend
npx serve
```

The frontend will typically run at `http://localhost:3000` (or a free port).

**Option B: VS Code Live Server Extension**

- Install "Live Server" extension in VS Code
- Right-click `frontend/home.html` → "Open with Live Server"

2. **(Optional) Configure backend URL:**
   If your backend is running on a different URL/port, open the browser console and set:

```js
localStorage.setItem("API_URL", "http://localhost:8081");
```

---

## How to Use

1. **Register:** Create a new account with username, email, and password.
2. **Login:** Authenticate with email and password (get JWT token).
3. **Quiz:** Answer 10 random questions. Each question has a 10-second timer.
4. **Bonus:** If time runs out on a question, a bonus math problem appears (external API).
5. **Results:** View your score and see the leaderboard rankings.

---

## API Endpoints

### Authentication

- `POST /auth/register` — Create new account
- `POST /auth/login` — Authenticate and get JWT token

### Quiz

- `GET /quiz/start?count=10&category=&difficulty=` — Fetch random questions
- `POST /quiz/submit` — Submit answers for scoring

### Leaderboard

- `GET /leaderboard/top?limit=20` — Top players by score
- `GET /leaderboard/me` — Authenticated user's profile and recent attempts

---

## Code Structure

```
backend/
  server.js                    # Express app entry point
  src/
    models/                    # Mongoose schemas (User, Question, QuizAttempt)
    routes/                    # Route handlers (auth, quiz, leaderboard)
    utils/                     # Utilities (JWT signing/verification)
  data/questions.json          # Sample question data
  seed/seedQuestions.js        # Database seeding script

frontend/
  home.html, login.html, register.html, quiz.html, end.html, leaderboard.html
  js/
    api.js                     # API client wrapper
    quiz.js                    # Quiz page logic (timers, navigation)
    login.js, register.js, end.js, leaderboard.js  # Page-specific logic
  *.css                        # Styling for each page
```

---

## Key Features

- **Authentication:** User registration with password hashing (bcryptjs) and JWT token-based auth
- **Quiz Engine:** Fetch random questions, per-question timers, navigation (prev/next), answer preservation
- **Bonus Question:** External math problem API integration (https://marcconrad.com/uob/banana/api.php)
- **Scoring:** Calculate accuracy, track attempts, update high scores
- **Leaderboard:** Rank users by highest score
- **Anonymous Play:** Quizzes can be taken without login (attempts not recorded in leaderboard)

---

## Development Notes

### Authentication Flow

1. User registers → `POST /auth/register` → JWT token + user info stored in localStorage
2. User logs in → `POST /auth/login` → JWT token saved in localStorage
3. Authenticated requests include `Authorization: Bearer <token>` header

### Quiz Submission

- Authenticated users: attempt recorded and high score updated if score is better
- Anonymous users: attempt recorded but not included in leaderboard

### Per-Question Timers

- Each question has a 10-second countdown timer (progress bar)
- When time expires, a bonus math question modal appears
- Correct bonus answer advances to next question; incorrect ends quiz

---

## Future Improvements

- [ ] Add unit/integration tests (Jest + Supertest)
- [ ] Frontend build tool (Vite/Webpack) for minification and bundling
- [ ] Difficulty selection and category filters on quiz start
- [ ] User profile page with attempt history
- [ ] Admin dashboard for managing questions
- [ ] Rate limiting on auth endpoints
- [ ] Input validation middleware (express-validator)
- [ ] Centralized error handling middleware

---

## Troubleshooting

**Backend won't connect to MongoDB:**

- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`

**Frontend can't reach backend:**

- Verify backend is running on the configured port
- Check CORS is enabled (should see `Access-Control-Allow-Origin: *` headers)
- Manually set API_URL in browser console: `localStorage.setItem('API_URL', 'http://localhost:8081')`

**JWT_SECRET warning:**

- Set `JWT_SECRET` in `.env` to a strong random string for production

**Port already in use:**

- Backend: Change `PORT` in `.env` or kill process on port 8081
- Frontend: The `serve` command will prompt for a different port if 3000 is taken
