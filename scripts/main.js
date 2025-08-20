// --- DEFAULT THEME: dark ---
// If the user hasn't chosen a theme yet, default to dark.
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark");
  document.documentElement.setAttribute("data-theme", "dark");
}

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
  const btn = document.getElementById("theme-toggle");
  const applied = localStorage.getItem("theme");
  if (applied) {
    document.documentElement.setAttribute("data-theme", applied);
    btn.innerText = applied === "dark" ? "Light" : "Dark";
  } else {
    // default label is "Dark" meaning clicking will switch to dark
    btn.innerText = "Dark";
  }

  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "" : "dark";
    if (next) document.documentElement.setAttribute("data-theme", next);
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", next);
    btn.innerText = next === "dark" ? "Light" : "Dark";
  });
}
