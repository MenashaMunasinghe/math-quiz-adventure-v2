
import { startQuiz, submitQuiz } from './api.js';

const qContainer = document.getElementById('quiz-container') || document.body;
const startBtn = document.getElementById('start-quiz-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const count = 10;
let questions = [];
let answers = [];
let current = 0;
let startTime = 0;
let timerId = null;

function renderQuestion(i) {
  const q = questions[i];
  qContainer.innerHTML = `
    <div class="question-card">
      <h2>Question ${i+1} / ${questions.length}</h2>
      <p class="q-text">${q.text}</p>
      <div class="options">
        ${q.options.map((opt, idx) => `
          <label class="opt">
            <input type="radio" name="ans" value="${idx}">
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  if (progressBar) progressBar.style.width = (((i)/questions.length) * 100) + '%';
}

function getSelected() {
  const el = qContainer.querySelector('input[name=ans]:checked');
  if (!el) return null;
  return Number(el.value);
}

function tick() {
  const sec = Math.max(0, Math.floor((Date.now() - startTime)/1000));
  if (timerEl) timerEl.textContent = sec + 's';
}

async function main() {
  const data = await startQuiz({ count });
  questions = data.questions || [];
  answers = new Array(questions.length).fill(null);
  startTime = Date.now();
  timerId = setInterval(tick, 1000);
  renderQuestion(0);
}

document.addEventListener('click', async (e) => {
  if (e.target && e.target.matches('#next-btn')) {
    const sel = getSelected();
    if (sel === null) { alert('Select an option'); return; }
    answers[current] = { questionId: questions[current].id, selectedIndex: sel };
    current++;
    if (current >= questions.length) {
      clearInterval(timerId);
      const durationSec = Math.floor((Date.now() - startTime)/1000);
      try {
        const res = await submitQuiz(answers, durationSec);
        localStorage.setItem('last_score', String(res.score || 0));
        localStorage.setItem('last_total', String(res.total || answers.length));
        window.location.href = 'end.html';
      } catch (err) {
        alert('Submit failed: ' + err.message);
      }
      return;
    }
    renderQuestion(current);
  }
});

// Auto-start
main().catch(err => alert('Failed to load quiz: ' + err.message));
