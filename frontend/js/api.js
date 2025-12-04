/**
 * Frontend API wrapper for communicating with the backend quiz API.
 * Handles JWT token storage/retrieval and standard HTTP requests with error handling.
 */

// Read backend URL from localStorage (allows runtime configuration), default to localhost:8081
const API_URL = localStorage.getItem("API_URL") || "http://localhost:8081";

/**
 * Save JWT token to localStorage for authenticated requests.
 * @param {string} token - JWT token from backend
 */
export function saveToken(token) {
  localStorage.setItem("auth_token", token);
}

/**
 * Retrieve JWT token from localStorage (returns null if not found).
 * @returns {string|null} JWT token or null
 */
export function getToken() {
  return localStorage.getItem("auth_token");
}

/**
 * Save authenticated user info to localStorage (as JSON string).
 * @param {object} u - User object { id, username, email, highScore }
 */
export function saveUser(u) {
  localStorage.setItem("user", JSON.stringify(u));
}

/**
 * Retrieve user info from localStorage (parses JSON, returns null on error or if not found).
 * @returns {object|null} User object or null
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export async function api(path, opts = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };

  const res = await fetch(API_URL + path, { ...opts, headers });
  if (!res.ok) {
    // If token is invalid or missing, force logout and redirect to login
    if (res.status === 401) {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      } catch {}
      // Redirect user to login page so they can re-authenticate
      if (typeof window !== "undefined") window.location.href = "login.html";
    }
    let msg = await res.text();
    try {
      const j = JSON.parse(msg);
      msg = j.error || JSON.stringify(j);
    } catch {}
    throw new Error(msg || res.statusText);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function login(email, password) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) saveToken(data.token);
  if (data.user) saveUser(data.user);
  return data;
}

export async function register(username, email, password) {
  const data = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  if (data.token) saveToken(data.token);
  if (data.user) saveUser(data.user);
  return data;
}

export async function startQuiz(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api("/quiz/start" + (qs ? "?" + qs : ""));
}

export async function submitQuiz(answers, durationSec = 0) {
  return api("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ answers, durationSec }),
  });
}

export async function leaderboardTop(limit = 20) {
  return api("/leaderboard/top?limit=" + limit);
}

export async function leaderboardMe() {
  return api("/leaderboard/me");
}

/**
 * Clear auth state (token + user) from localStorage and optionally navigate.
 */
export function logout(redirect = true) {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  if (redirect) window.location.href = "login.html";
}
