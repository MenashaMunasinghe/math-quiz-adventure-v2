/**
 * Quiz page: interactive quiz with per-question timers, navigation, and bonus banana API question.
 * Fetches random questions from backend, allows users to navigate and answer, and submits for scoring.
 */

import { startQuiz, submitQuiz } from "./api.js";

// ============ DOM Elements ============
const qContainer = document.getElementById("quiz-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress");
const timerEl = document.getElementById("timer");

// ============ Quiz State ============
const count = 10; // default number of questions to fetch
let questions = []; // fetched question objects: { id, text, options, category, difficulty }
let answers = []; // array of { questionId, selectedIndex } or null for unanswered
let current = 0; // current question index
let startTime = 0; // global quiz start timestamp
let globalTimerId = null; // interval ID for overall quiz elapsed time display (tick timer)
let questionTimerId = null; // interval ID for per-question countdown progress bar

// Per-question time limit (seconds) before timeout triggers bonus question
const QUESTION_TIME = 10;

// ============ Initialization ============

/**
 * Initialize quiz: fetch random questions from backend and start global timer.
 * Renders the first question.
 */
async function main() {
  const data = await startQuiz({ count });
  questions = data.questions || [];
  answers = new Array(questions.length).fill(null);
  startTime = Date.now();
  globalTimerId = setInterval(tick, 1000);

  // render first question
  renderQuestion(0);
}

// ============ Question Rendering ============

/**
 * Render question at index `i`. Clears previous timer and preserves any previously selected option.
 * @param {number} i - Question index
 */
function renderQuestion(i) {
  // clear any previous question timer to avoid overlapping timers
  if (questionTimerId) {
    clearInterval(questionTimerId);
    questionTimerId = null;
  }

  const q = questions[i];
  if (!q) {
    qContainer.innerHTML = "<p>No question available.</p>";
    return;
  }

  // Build options; if the user already answered this question, pre-check the radio
  const existing = answers[i];
  qContainer.innerHTML = `
    <div class="quiz-container">
      <div class="level-box">Question ${i + 1} / ${questions.length}</div>
      <p class="question">${q.text}</p>
      <div class="options">
        ${q.options
          .map(
            (opt, idx) => `
            <label class="option">
              <input type="radio" name="ans" value="${idx}" ${
              existing && existing.selectedIndex === idx ? "checked" : ""
            }>
              <span>${opt}</span>
            </label>
          `
          )
          .join("")}
      </div>
    </div>
  `;

  // Start per-question progress bar countdown
  startTimer(QUESTION_TIME);
}

// ============ Timers ============

/**
 * Start a per-question progress bar that lasts `seconds` seconds.
 * When time expires, show bonus question modal.
 * @param {number} seconds - Time limit in seconds
 */
function startTimer(seconds) {
  // reset progress bar to full width
  if (!progressBar) return;
  progressBar.style.width = "100%";
  let remaining = seconds;
  const stepMs = 200; // update every 200ms for smoother animation
  const totalSteps = Math.ceil((seconds * 1000) / stepMs);
  let step = 0;

  questionTimerId = setInterval(() => {
    step++;
    const pct = Math.max(0, 100 - (step / totalSteps) * 100);
    progressBar.style.width = pct + "%";
    if (step >= totalSteps) {
      clearInterval(questionTimerId);
      questionTimerId = null;
      // time's up: show bonus modal
      alert("Time's up — bonus question incoming!");
      openBananaAPI();
    }
  }, stepMs);
}

// ============ Bonus Question (Banana API) ============

/**
 * Open a modal with a bonus math question from the external Banana API.
 * User can submit the answer (correct = advance, incorrect = end quiz).
 * User can also skip the bonus question (ends quiz).
 */
async function openBananaAPI() {
  try {
    // Fetch the bonus question from the external API
    const response = await fetch("https://marcconrad.com/uob/banana/api.php");
    const data = await response.json();

    console.log(data);

    // Create modal overlay (fixed positioning, semi-transparent background)
    const modal = document.createElement("div");
    modal.id = "banana-modal";
    modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.7);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 1000;
		`;

    // Create modal content container
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
			background-color: #2f1a4d;
			border-radius: 20px;
			padding: 40px;
			text-align: center;
			max-width: 500px;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		`;

    // Add title
    const title = document.createElement("h2");
    title.textContent = "Bonus Question - Solve the Math Problem!";
    title.style.cssText = `
			color: #9dd6db;
			margin-bottom: 30px;
			font-size: 1.5em;
		`;
    modalContent.appendChild(title);

    // Add image (the math problem)
    const img = document.createElement("img");
    img.src = data.question;
    img.alt = "Math problem";
    img.style.cssText = `
			max-width: 100%;
			max-height: 300px;
			margin-bottom: 30px;
			border-radius: 10px;
		`;
    modalContent.appendChild(img);

    // Add input field for answer
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "Enter your answer";
    input.style.cssText = `
			width: 100%;
			padding: 12px;
			font-size: 1.1em;
			border: 2px solid #9dd6db;
			border-radius: 10px;
			background-color: #1a0f2e;
			color: #f1f4f9;
			margin-bottom: 20px;
			box-sizing: border-box;
		`;
    modalContent.appendChild(input);

    // Add button container (submit and skip)
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
			display: flex;
			gap: 10px;
			justify-content: center;
		`;

    // Add submit button
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Answer";
    submitBtn.style.cssText = `
			background-color: #51269b;
			color: #f1f4f9;
			border: none;
			border-radius: 10px;
			padding: 12px 30px;
			font-size: 1em;
			cursor: pointer;
			transition: 0.3s;
		`;
    submitBtn.addEventListener("mouseover", () => {
      submitBtn.style.backgroundColor = "#6b3ac0";
    });
    submitBtn.addEventListener("mouseout", () => {
      submitBtn.style.backgroundColor = "#51269b";
    });

    // Add skip button
    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Skip";
    skipBtn.style.cssText = `
			background-color: #8b0000;
			color: #f1f4f9;
			border: none;
			border-radius: 10px;
			padding: 12px 30px;
			font-size: 1em;
			cursor: pointer;
			transition: 0.3s;
		`;
    skipBtn.addEventListener("mouseover", () => {
      skipBtn.style.backgroundColor = "#a00000";
    });
    skipBtn.addEventListener("mouseout", () => {
      skipBtn.style.backgroundColor = "#8b0000";
    });

    buttonContainer.appendChild(submitBtn);
    buttonContainer.appendChild(skipBtn);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle submit button: check answer, advance if correct or end if incorrect
    submitBtn.addEventListener("click", async () => {
      const userAnswer = Number(input.value);
      document.body.removeChild(modal);

      if (userAnswer === data.solution) {
        // Correct answer - move to next question
        current++;
        if (current >= questions.length) {
          // Quiz complete after bonus
          clearInterval(globalTimerId);
          const durationSec = Math.floor((Date.now() - startTime) / 1000);
          try {
            normalizeAnswersBeforeSubmit();
            const res = await submitQuiz(answers, durationSec);
            localStorage.setItem("last_score", String(res.score || 0));
            localStorage.setItem(
              "last_total",
              String(res.total || answers.length)
            );
            window.location.href = "end.html";
          } catch (err) {
            alert("Submit failed: " + err.message);
          }
        } else {
          renderQuestion(current);
        }
      } else {
        // Incorrect answer - finish quiz immediately
        clearInterval(globalTimerId);
        const durationSec = Math.floor((Date.now() - startTime) / 1000);
        try {
          normalizeAnswersBeforeSubmit();
          const res = await submitQuiz(answers, durationSec);
          localStorage.setItem("last_score", String(res.score || 0));
          localStorage.setItem(
            "last_total",
            String(res.total || answers.length)
          );
          window.location.href = "end.html";
        } catch (err) {
          alert("Submit failed: " + err.message);
        }
      }
    });

    // Handle skip button: end quiz without attempting bonus
    skipBtn.addEventListener("click", async () => {
      document.body.removeChild(modal);
      // Finish quiz on skip
      clearInterval(globalTimerId);
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      try {
        normalizeAnswersBeforeSubmit();
        const res = await submitQuiz(answers, durationSec);
        localStorage.setItem("last_score", String(res.score || 0));
        localStorage.setItem("last_total", String(res.total || answers.length));
        window.location.href = "end.html";
      } catch (err) {
        alert("Submit failed: " + err.message);
      }
    });

    // Focus on input for better UX
    input.focus();
  } catch (err) {
    alert("Failed to load bonus question: " + err.message);
  }
}

// ============ Helper Functions ============

/**
 * Normalize answers array before submission: fill null entries with { questionId, selectedIndex: null }.
 * This ensures the answers array has the expected structure for the backend.
 */
function normalizeAnswersBeforeSubmit() {
  if (!questions || !questions.length) return;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === null || answers[i] === undefined) {
      answers[i] = {
        questionId: questions[i].id,
        selectedIndex: null,
      };
    }
  }
}

/**
 * Get the currently selected option from the DOM (radio button).
 * @returns {number|null} Selected option index or null if none selected
 */
function getSelected() {
  const el = qContainer.querySelector("input[name=ans]:checked");
  if (!el) return null;
  return Number(el.value);
}

/**
 * Update global quiz elapsed time display every second.
 * Called by globalTimerId interval.
 */
function tick() {
  const sec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  if (timerEl) timerEl.textContent = sec + "s";
}

// ============ Event Handlers ============

/**
 * Document-level click handler for navigation and submission.
 * Handles "Next" button: saves current answer, moves to next question or submits quiz.
 */
document.addEventListener("click", async (e) => {
  if (e.target && e.target.matches("#next-btn")) {
    const sel = getSelected();
    if (sel === null) {
      alert("Select an option");
      return;
    }
    // Save current answer
    answers[current] = {
      questionId: questions[current].id,
      selectedIndex: sel,
    };
    current++;
    if (current >= questions.length) {
      // All questions answered: submit quiz
      clearInterval(globalTimerId);
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      try {
        normalizeAnswersBeforeSubmit();
        const res = await submitQuiz(answers, durationSec);
        localStorage.setItem("last_score", String(res.score || 0));
        localStorage.setItem("last_total", String(res.total || answers.length));
        window.location.href = "end.html";
      } catch (err) {
        // If submission failed due to authentication, redirect to login
        if (err && /token|auth|missing/i.test(err.message)) {
          alert(
            "You need to login before submitting your score. Redirecting to login."
          );
          window.location.href = "login.html";
          return;
        }
        alert("Submit failed: " + err.message);
      }
      return;
    }
    // Move to next question
    renderQuestion(current);
  }
});

/**
 * Previous button handler: saves current answer and moves to previous question.
 */
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (current <= 0) return;
    // Save current selection (if any)
    const sel = getSelected();
    if (sel !== null) {
      answers[current] = {
        questionId: questions[current].id,
        selectedIndex: sel,
      };
    }
    current = Math.max(0, current - 1);
    renderQuestion(current);
  });
}

// ============ Auto-start on Page Load ============

// Initialize quiz when page loads
main().catch((err) => alert("Failed to load quiz: " + err.message));
