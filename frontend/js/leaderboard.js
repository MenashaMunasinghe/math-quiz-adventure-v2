
import { leaderboardTop } from './api.js';

const tbody = document.querySelector('tbody');
async function main() {
  const { top } = await leaderboardTop(20);
  tbody.innerHTML = top.map((row, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${row.username}</td>
      <td>${row.highScore ?? 0}</td>
    </tr>
  `).join('');
}
main().catch(err => {
  alert('Failed to load leaderboard: ' + err.message);
});
