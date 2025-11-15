
import { login } from './api.js';

const form = document.querySelector('form');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.querySelector('input[name=email]')?.value?.trim();
  const password = form.querySelector('input[name=password]')?.value;
  const btn = form.querySelector('button[type=submit]');
  try {
    btn && (btn.disabled = true);
    await login(email, password);
    window.location.href = 'quiz.html';
  } catch (err) {
    alert('Login failed: ' + err.message);
  } finally {
    btn && (btn.disabled = false);
  }
});
