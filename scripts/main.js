// scripts/main.js
document.addEventListener("DOMContentLoaded", () => {
    populateProjects();
    setupThemeToggle();
});

function populateProjects() {
    const grid = document.getElementById("project-grid");
    grid.innerHTML = "";
    window.PROJECTS.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <div class="thumb" style="background-image:url('${p.thumb}')" aria-hidden="true"></div>
      <h4>${p.title}</h4>
      <div class="small">${p.short}</div>
      <div class="meta">
        ${p.tech.map(t => `<span class="tech">${t}</span>`).join(" ")}
      </div>
      <div class="small">${p.impact}</div>
      <div class="actions">
        <a class="btn" href="project.html?id=${encodeURIComponent(p.id)}">Docs</a>
        <a class="btn ghost" href="${p.repo}" target="_blank" rel="noopener">Code</a>
      </div>
    `;
        grid.appendChild(card);
    });
}

function setupThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    const applied = localStorage.getItem("theme");
    if (applied) document.documentElement.setAttribute("data-theme", applied);

    btn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "dark" ? "" : "dark";
        if (next) document.documentElement.setAttribute("data-theme", next);
        else document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", next);
    });
}
