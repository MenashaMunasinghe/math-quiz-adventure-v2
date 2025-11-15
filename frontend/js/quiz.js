import { startQuiz, submitQuiz } from "./api.js";

const qContainer = document.getElementById("quiz-container");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const progressBar = document.getElementById("progress");
const timerEl = document.getElementById("timer");

const count = 10;
let questions = [];
let answers = [];
let current = 0;
let startTime = 0;
let timerId = null;

async function main() {
  const data = await startQuiz({ count });
  questions = data.questions || [];
  answers = new Array(questions.length).fill(null);
  startTime = Date.now();
  timerId = setInterval(tick, 1000);

  // start with first question
  renderQuestion(0);
}

function renderQuestion(i) {
  // start timer for each question
  startTimer();

  const q = questions[i];

  qContainer.innerHTML = `
    <div class="quiz-container">

      <div class="level-box"> 
        Question ${i + 1} / ${questions.length}
      </div>

      <p class="question">
      	${q.text}
      </p>

      <div class="options">

        ${q.options
          .map(
            (opt, idx) => `
        	<label class="option">
            	<input type="radio" name="ans" value="${idx}">
            	<span>${opt}</span>
          	</label>
        `
          )
          .join("")}

      </div>

    </div>
	`;
}

function startTimer() {
  let time = 10;
  let width = 100;
  progressBar.style.width = "100%";

  let countdown = setInterval(() => {
    width -= 100 / time / 10;
    progressBar.style.width = width + "%";
    if (width <= 0) {
      clearInterval(countdown);

      alert("Time’s up... Ready for a bonus question!");

      // Once time is up, need to open a modal or a pop-up box.
      // then call the Banana API to fetch a additional question
      openBananaAPI();
    }
  }, 100);
}

async function openBananaAPI() {
  try {
    // Fetch the banana question from the API
    const response = await fetch("https://marcconrad.com/uob/banana/api.php");
    const data = await response.json();

    console.log(data);

    // Create modal overlay
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

    // Create modal content
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

    // Add image
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

    // Add input field
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

    // Add button container
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

    // Handle submit
    submitBtn.addEventListener("click", async () => {
      const userAnswer = Number(input.value);
      document.body.removeChild(modal);

      if (userAnswer === data.solution) {
        // Correct answer - move to next question
        current++;
        if (current >= questions.length) {
          clearInterval(timerId);
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
        // Incorrect answer - finish quiz
        clearInterval(timerId);
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

    // Handle skip
    skipBtn.addEventListener("click", async () => {
      document.body.removeChild(modal);
      // Finish quiz on skip
      clearInterval(timerId);
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

function getSelected() {
  const el = qContainer.querySelector("input[name=ans]:checked");
  if (!el) return null;
  return Number(el.value);
}

function tick() {
  const sec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  if (timerEl) timerEl.textContent = sec + "s";
}

document.addEventListener("click", async (e) => {
  if (e.target && e.target.matches("#next-btn")) {
    const sel = getSelected();
    if (sel === null) {
      alert("Select an option");
      return;
    }
    answers[current] = {
      questionId: questions[current].id,
      selectedIndex: sel,
    };
    current++;
    if (current >= questions.length) {
      clearInterval(timerId);
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
      return;
    }
    renderQuestion(current);
  }
});

// Auto-start
main().catch((err) => alert("Failed to load quiz: " + err.message));
