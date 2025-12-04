/**
 * Login page handler: authenticate user and redirect to quiz on success.
 */

import { login, getToken } from "./api.js";

// Prevent access to login if already authenticated
if (getToken()) {
  window.location.href = "quiz.html";
}

// Get form element and attach submit handler
const form = document.querySelector("form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Extract email and password from form inputs
  const email = form.querySelector("input[name=email]")?.value?.trim();
  const password = form.querySelector("input[name=password]")?.value;
  const btn = form.querySelector("button[type=submit]");

  try {
    // Disable submit button during request to prevent double-submissions
    btn && (btn.disabled = true);

    // Attempt login (saves token & user to localStorage on success)
    await login(email, password);

    // Redirect to quiz page on successful login
    window.location.href = "quiz.html";
  } catch (err) {
    // Show error message if login fails
    alert("Login failed: " + err.message);
  } finally {
    // Re-enable button regardless of success/failure
    btn && (btn.disabled = false);
  }
});
