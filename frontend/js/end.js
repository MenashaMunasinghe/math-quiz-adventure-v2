
const score = Number(localStorage.getItem('last_score') || '0');
const total = Number(localStorage.getItem('last_total') || '0');
document.getElementById('final-score')?.append(`${score} / ${total}`);
