# Math Quiz Adventure — Application Requirements

## Purpose

This document describes the end-to-end functional and non-functional requirements for the "Math Quiz Adventure" web application. It captures application features, user journeys, API contracts, data models, security considerations, testing, deployment, and acceptance criteria.

## Project Overview

- Name: Math Quiz Adventure
- Repo layout: frontend/ and backend/ (Node/Express)
- Primary features: user registration/login, quiz play (multiple-choice questions), leaderboard, basic admin/seed tooling.

## Target Users

- Students and learners practicing math quizzes.
- Teachers or parents reviewing leaderboards.
- Admin (developer) who can seed questions.

## Goals

- Provide a lightweight, responsive quiz app with persistent user accounts and attempt tracking.
- Secure authentication using JWTs.
- Track and rank players on a leaderboard.
- Simple seed tooling to populate questions.

## High-level Architecture

- Frontend: static HTML/CSS/JS in `frontend/` directory. Key pages: `index.html`, `quiz.html`, `login.html`, `register.html`, `leaderboard.html`, `end.html`.
- Backend: Node.js + Express in `backend/`.
  - Entry: `server.js`
  - Routes: `backend/src/routes/auth.js`, `backend/src/routes/quiz.js`, `backend/src/routes/leaderboard.js`
  - Models: `backend/src/models/User.js`, `backend/src/models/Question.js`, `backend/src/models/QuizAttempt.js`
  - Data: `backend/data/questions.json` and `backend/seed/seedQuestions.js` for seeding.
- Storage: a simple file-based JSON store or a small DB (current repo uses file-based or whatever `models` expect).

## End-to-end Features (Functional)

1. User Registration

   - Page: `frontend/register.html`
   - Fields: `username`, `email`, `password` (and confirm in UI if desired)
   - Backend: `POST /api/auth/register` in `auth.js` (creates user, hashes password)
   - Validations: unique email/username, password length/strength
   - Success: returns user object and JWT token

2. User Login

   - Page: `frontend/login.html`
   - Fields: `email` (or `username`), `password`
   - Backend: `POST /api/auth/login` (validates credentials, issues JWT)
   - On success: store JWT in client (localStorage/sessionStorage) and redirect to quiz or home

3. JWT-based Authentication

   - Backend middleware verifies token for protected endpoints (`quiz`, `leaderboard` submission if required)
   - Tokens stored client-side in `localStorage` or `sessionStorage` via `frontend/js/auth-ui.js` and `frontend/js/api.js`

4. Quiz Flow

   - Page: `frontend/quiz.html`
   - Fetch quiz questions via `GET /api/quiz` or similar
   - Present multiple-choice questions, collect answers, compute score and correct count
   - On completion, create a `QuizAttempt` record via `POST /api/quiz/attempts` or similar
   - Redirect to `end.html` to show results and option to submit to leaderboard

5. Leaderboard

   - Page: `frontend/leaderboard.html`
   - Backend: `GET /api/leaderboard` returning sorted top scores and optionally user ranks
   - Display: username, score, date/time, and possibly accuracy/time taken

6. Seed/Admin Tooling

   - Script: `backend/seed/seedQuestions.js`
   - Data source: `backend/data/questions.json`
   - Allows seeding questions into the datastore used by `Question` model

7. Basic User Profile and Attempt History (Minimal)
   - `User` model links to `QuizAttempt` records
   - Endpoint suggestions: `GET /api/users/:id/attempts` to fetch a user's past attempts

## Non-functional Requirements

- Security: passwords stored hashed (bcrypt or similar), JWT secrets stored in environment variables.
- Performance: app lightweight; server responds under reasonable latency for small user base.
- Reliability: seed tooling and data backups recommended.
- Maintainability: clear separation between frontend static assets and backend API.

## Data Models (existing / recommended fields)

1. User (`backend/src/models/User.js`)

   - id: string / ObjectId
   - username: string (unique)
   - email: string (unique)
   - passwordHash: string
   - createdAt: datetime
   - optionally: avatar, roles (e.g., admin)

2. Question (`backend/src/models/Question.js`)

   - id: string
   - text: string
   - choices: array of strings (length >= 2)
   - answerIndex: integer (index into `choices`) or `correctAnswer` key
   - difficulty / tags (optional)

3. QuizAttempt (`backend/src/models/QuizAttempt.js`)
   - id: string
   - userId: reference to `User`
   - score: integer (or percentage)
   - correctCount: integer
   - totalQuestions: integer
   - timeTaken: integer (seconds) (optional)
   - answers: [{ questionId, selectedIndex, correct }] (optional)
   - createdAt: datetime

## API Specification (recommended / inferred from repo)

Base path: `/api`

Auth

- `POST /api/auth/register`

  - Auth: public
  - Body: { username, email, password }
  - Success: 201 { user: { id, username, email }, token }
  - Errors: 400 validation errors, 409 conflict

- `POST /api/auth/login`
  - Auth: public
  - Body: { email, password }
  - Success: 200 { user: { id, username, email }, token }
  - Errors: 401 unauthorized

Quiz

- `GET /api/quiz` or `GET /api/questions`

  - Auth: optional/public (but can require JWT if personalized)
  - Query: `?limit=10&difficulty=easy`
  - Success: 200 [{ id, text, choices }] (do not return correct answers)

- `POST /api/quiz/attempts`
  - Auth: required
  - Body: { answers: [{ questionId, selectedIndex }], timeTaken }
  - Success: 201 { attempt: QuizAttempt }
  - Writes score and stores attempt for user

Leaderboard

- `GET /api/leaderboard`
  - Auth: public
  - Query: `?limit=50` `?period=week|month|all`
  - Success: 200 [{ userId, username, score, date }]

Optional Admin

- `POST /api/admin/questions` (protected by admin role or local-only)
  - Auth: admin
  - Body: { text, choices, answerIndex }
  - Success: 201 { question }

## Frontend Pages & Behavior

- `index.html`:

  - Landing page, links to login/register/quiz

- `register.html`:

  - Register form and client-side validation

- `login.html`:

  - Login form; on success sets JWT and redirects

- `quiz.html`:

  - Loads questions from API and runs quiz UI
  - Keeps progress state, timer (optional), and submits attempt

- `end.html`:

  - Show detailed results, share/submit to leaderboard

- `leaderboard.html`:
  - Shows top players via `GET /api/leaderboard`

## UX / User Flows

1. New user

   - Visits `register.html` -> fills form -> receives JWT -> lands on `quiz.html`.

2. Returning user

   - Goes to `login.html` -> receives JWT -> sees start quiz option -> plays -> sees `end.html` -> optional leaderboard.

3. Anonymous quick play (optional)
   - Allow play without registering; store attempts locally or prompt to sign up to save score.

## Validation & Error Handling

- Client-side: basic input checks (email format, password length, required fields).
- Server-side: validate all payloads, return helpful error messages and status codes (400/401/403/409/500).
- Rate limiting: optionally protect auth endpoints against brute-force.

## Security Considerations

- Passwords: store hashed with bcrypt (salted). Never store plaintext.
- JWT: use strong secret from environment variable (e.g., `JWT_SECRET`). Set token expiration (e.g., 1h or 7d as appropriate).
- HTTPS: require TLS in production.
- CORS: restrict origins to the frontend domain in production.
- Input sanitization: avoid injection attacks; validate and sanitize fields.

## Testing & QA

- Unit tests: for backend models and auth logic.
- Integration tests: API endpoints (login, register, submit attempt, leaderboard).
- Manual QA: run through each frontend page (login, register, full quiz flow, leaderboard).
- Seed tests: ensure `backend/seed/seedQuestions.js` creates questions as expected.

## Deployment & Environment

Environment variables (recommended):

- `PORT` – server listening port
- `JWT_SECRET` – secret for signing JWTs
- `NODE_ENV` – `development` or `production`
- `DB_URL` – if moving to a DB (Mongo/Postgres)

Run locally (recommended commands)

- Install backend deps and seed data

```bash
cd backend
npm install
npm run seed   # runs seedQuestions.js and populates questions
npm start      # runs server.js
```

- Serve frontend (static files) or open `frontend/index.html` in browser

## Acceptance Criteria

- Users can register and login; JWTs issued and validated.
- Quizzes present questions without revealing answers and record attempts.
- Leaderboard shows aggregated top results and updates after attempts.
- Seed script loads question set into app datastore.
- Basic security: passwords hashed and JWT used with env secret.

## Observations specific to this repository

- Backend routes and models exist in `backend/src/` as listed above — confirm any field names exactly by inspecting the files before making changes.
- Frontend is a static JS/CSS/HTML set under `frontend/`; API client code lives in `frontend/js/` (`api.js`, `auth-ui.js`, `quiz.js`, etc.) and will need to store tokens correctly to call protected endpoints.

## Future Enhancements (roadmap)

- Add timed quizzes and per-question timers, persist timeTaken.
- Add roles and an admin panel to create/edit/delete questions via UI.
- Add per-question explanations and results review.
- Add social/login (OAuth) and email verification.
- Add more analytics: per-question difficulty, user progress trends.

## Appendix: Quick API Examples

- Register request:

  - POST `/api/auth/register`
  - Body: {"username":"alice","email":"alice@example.com","password":"s3cr3t"}

- Login response (success):

  - { "user": { "id": "...", "username": "alice" }, "token": "<JWT>" }

- Submit attempt:
  - POST `/api/quiz/attempts` (Authorization: `Bearer <JWT>`)
  - Body: { "answers": [{ "questionId": "q1", "selectedIndex": 2 }], "timeTaken": 95 }

File added: `application-requirement.md`

-- End of document
