/**
 * Leaderboard page: display top 20 users by highest score.
 */

import { leaderboardTop } from "./api.js";

// Get table body element where leaderboard rows will be inserted
const tbody = document.querySelector("tbody");

/**
 * Fetch and render leaderboard.
 */
async function main() {
  // Fetch top 20 users from backend
  const { top } = await leaderboardTop(20);

  // Render table rows (rank, username, high score)
  tbody.innerHTML = top
    .map(
      (row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${row.username}</td>
      <td>${row.highScore ?? 0}</td>
    </tr>
  `
    )
    .join("");
}

// Initialize leaderboard on page load
main().catch((err) => {
  alert("Failed to load leaderboard: " + err.message);
});
