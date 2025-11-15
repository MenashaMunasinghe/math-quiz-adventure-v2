import { register } from "./api.js";

const form = document.querySelector("form");

form?.addEventListener("submit", async (e) => {

	e.preventDefault();

	const username = form.querySelector("input[name=username]")?.value?.trim();
	const email = form.querySelector("input[name=email]")?.value?.trim();
	const password = form.querySelector("input[name=password]")?.value;
	const btn = form.querySelector("button[type=submit]");

	try {
		btn && (btn.disabled = true);
		await register(username, email, password);
		window.location.href = "quiz.html";

	} catch (err) {
		alert("Register failed: " + err.message);
		
	} finally {
		btn && (btn.disabled = false);
	}
});
