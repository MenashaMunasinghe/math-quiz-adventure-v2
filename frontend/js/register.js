/**
 * Registration page handler: create account and redirect to quiz on success.
 */

import { register, getToken } from "./api.js";

// Prevent access to register if already authenticated
if (getToken()) {
  window.location.href = "quiz.html";
}

// Get form element and attach submit handler
const form = document.querySelector("form");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Extract username, email, and password from form inputs
  const username = form.querySelector("input[name=username]")?.value?.trim();
  const email = form.querySelector("input[name=email]")?.value?.trim();
  const password = form.querySelector("input[name=password]")?.value;
  const btn = form.querySelector("button[type=submit]");

  try {
    // Disable submit button during request to prevent double-submissions
    btn && (btn.disabled = true);

    // Attempt registration (saves token & user to localStorage on success)
    await register(username, email, password);

    // Redirect to quiz page on successful registration
    window.location.href = "quiz.html";
  } catch (err) {
    // Show error message if registration fails
    alert("Register failed: " + err.message);
  } finally {
    // Re-enable button regardless of success/failure
    btn && (btn.disabled = false);
  }
});
