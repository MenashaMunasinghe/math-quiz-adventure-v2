
# Space Game + Quiz Fullstack

This package contains:
- **frontend/**: your HTML/CSS game and pages (login, register, quiz, leaderboard, end)
- **backend/**: Express + MongoDB API (auth, random quiz, leaderboard)

## Run backend
```bash
cd backend
cp .env.example .env  # set MONGO_URI and JWT_SECRET
npm install
npm run seed
npm run dev   # http://localhost:8081
```

## Open frontend
Simply open `frontend/Final Game/home.html` in your browser (or serve the folder with any static server).
- Login / Register pages call the backend at `http://localhost:8081`
- Quiz page fetches random questions every time
- End page shows your score
- Leaderboard page fetches `/leaderboard/top`

> If your backend runs on another URL/port, set it in the browser console once:
```js
localStorage.setItem('API_URL', 'http://127.0.0.1:8081')
```

## Pages
- `login.html` — authenticates with backend and stores token in localStorage
- `register.html` — creates account then sends you to quiz
- `quiz.html` — pulls random questions via `/quiz/start` and submits answers to `/quiz/submit`
- `leaderboard.html` — shows top players by high score
- `end.html` — shows final quiz score
