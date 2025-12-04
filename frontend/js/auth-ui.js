import { getToken, getUser, logout } from "./api.js";

// Inject a simple common header at the top of the page.
function buildHeader() {
  const token = getToken();
  const user = getUser();

  const header = document.createElement("header");
  header.className = "site-header";
  header.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #eee;background:#fff;";

  const left = document.createElement("div");
  left.innerHTML = `<a href="home.html" style="font-weight:700;text-decoration:none;color:#111">Math Quiz Adventure</a>`;

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "12px";

  if (token && user) {
    const name = document.createElement("span");
    name.textContent = user.username || "Player";
    name.style.fontWeight = "600";

    const outBtn = document.createElement("button");
    outBtn.textContent = "Logout";
    outBtn.style.padding = "6px 10px";
    outBtn.addEventListener("click", () => logout(true));

    right.appendChild(name);
    right.appendChild(outBtn);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.textContent = "Login";
    loginLink.style.textDecoration = "none";

    const regLink = document.createElement("a");
    regLink.href = "register.html";
    regLink.textContent = "Register";
    regLink.style.textDecoration = "none";

    right.appendChild(loginLink);
    right.appendChild(regLink);
  }

  header.appendChild(left);
  header.appendChild(right);

  // Insert header as first child of body
  document.body.insertBefore(header, document.body.firstChild);
}

// Run on load
document.addEventListener("DOMContentLoaded", buildHeader);

// Export nothing; this module runs for side effects.
