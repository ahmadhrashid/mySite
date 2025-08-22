// Ensure theme is canonical and applied on load
// If the user hasn't chosen a theme yet, default to dark.
if (localStorage.getItem("theme") === null) {
  localStorage.setItem("theme", "dark");
}

// Apply whatever is stored (either "dark" or "light")
(function applyStoredTheme() {
  const t = localStorage.getItem("theme");
  if (t === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    // light = remove the attribute so CSS falls back to light vars
    document.documentElement.removeAttribute("data-theme");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  populateProjects();
  setupThemeToggle();
});

function populateProjects() {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";
  (window.PROJECTS || []).forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    // card inner HTML minimal layout
    card.innerHTML = `
      <div class="card-body">
        <h4 class="project-title"><a href="project.html?id=${encodeURIComponent(p.id)}">${p.title}</a></h4>
        <div class="small project-desc">${p.short}</div>

        <div class="meta project-badges" style="margin-top:10px;">
          ${p.tech.map(t => `<span class="tech">${t}</span>`).join(" ")}
        </div>

        <div class="actions" style="margin-top:12px;">
          <a class="btn" href="project.html?id=${encodeURIComponent(p.id)}">Docs</a>
          <a class="btn ghost" href="${p.repo}" target="_blank" rel="noopener">Code</a>
        </div>
      </div>

      <div class="card-footer">
        <div></div>
        <div class="project-date small">${p.date || ""}</div>
      </div>
    `;

    grid.appendChild(card);
  });
}


function setupThemeToggle() {
  // support both id names used across pages
  const btn = document.getElementById("theme-toggle") || document.getElementById("theme-toggle-2");
  if (!btn) return;

  // Read applied theme and set button label
  const applied = localStorage.getItem("theme");
  btn.innerText = applied === "dark" ? "Light" : "Dark";

  btn.addEventListener("click", () => {
    // Determine current theme from DOM (if data-theme="dark" present it's dark)
    const currentlyDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = currentlyDark ? "light" : "dark";

    // Apply next theme
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    // Persist canonical string
    localStorage.setItem("theme", next);

    // Update button label to indicate the action (click to switch to other)
    btn.innerText = next === "dark" ? "Light" : "Dark";
  });
}
