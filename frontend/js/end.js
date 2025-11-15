/**
 * End/Results page: display the final quiz score.
 * Reads score and total from localStorage (set by quiz.js after submission).
 */

// Retrieve quiz results from localStorage
const score = Number(localStorage.getItem("last_score") || "0");
const total = Number(localStorage.getItem("last_total") || "0");

// Display final score in the format "score / total"
document.getElementById("final-score")?.append(`${score} / ${total}`);
