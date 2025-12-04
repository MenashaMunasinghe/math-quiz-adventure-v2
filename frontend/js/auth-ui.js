import { getToken, getUser, logout } from "./api.js";

// Inject a simple common header at the top of the page.
function buildHeader() {
  const token = getToken();
  const user = getUser();

  // Inject minimal CSS for the header and page spacing so header is consistent across pages
  if (!document.getElementById("_site_header_styles")) {
    const s = document.createElement("style");
    s.id = "_site_header_styles";
    s.textContent = `
      :root{--header-height:64px}
      html,body{height:100%;margin:0;padding:0;overflow-x:hidden}
      body{padding-top:var(--header-height)}
      header.site-header{position:fixed;top:0;left:0;right:0;height:var(--header-height);display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #eee;background:rgba(255,255,255,0.98);backdrop-filter:saturate(120%) blur(4px);z-index:1000}
      header.site-header a{color:#111;text-decoration:none;font-weight:700}
      header.site-header .site-header-right{display:flex;gap:12px;align-items:center}
      .site-logout{padding:6px 10px;cursor:pointer;border-radius:6px;border:1px solid #ddd;background:#fff}
      .site-logout:hover{background:#f5f5f5}
      .site-link{color:#111;text-decoration:none}
      /* Only adjust the main hero section on the home page to account for header height */
      body.home-page section{height:calc(100vh - var(--header-height));width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;}
      body.home-page h1{font-size:clamp(2rem,6vw,4rem);margin-bottom:18px}
      body.home-page .student-img{width:clamp(100px,28vw,220px);height:auto}
    `;
    document.head.appendChild(s);
  }

  const header = document.createElement("header");
  header.className = "site-header";

  const left = document.createElement("div");
  left.className = "site-header-left";
  left.innerHTML = `<a href="index.html">Math Quiz Adventure</a>`;

  const right = document.createElement("div");
  right.className = "site-header-right";

  if (token && user) {
    const name = document.createElement("span");
    name.className = "site-username";
    name.textContent = user.username || "Player";

    const outBtn = document.createElement("button");
    outBtn.className = "site-logout";
    outBtn.textContent = "Logout";
    outBtn.addEventListener("click", () => logout(true));

    right.appendChild(name);
    right.appendChild(outBtn);
  } else {
    const loginLink = document.createElement("a");
    loginLink.className = "site-link";
    loginLink.href = "login.html";
    loginLink.textContent = "Login";

    const regLink = document.createElement("a");
    regLink.className = "site-link";
    regLink.href = "register.html";
    regLink.textContent = "Register";

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
