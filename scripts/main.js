document.addEventListener("DOMContentLoaded", () => {
  populateProjects();
  setupThemeToggle();
});

function populateProjects() {
    const list = document.getElementById("project-list"); 
    if (!list) return;
    list.innerHTML = "";

    (window.PROJECTS || []).forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";

        // Build secondary links
        let linksHtml = "";
        if (p.docPath) {
            linksHtml += `<a href="project.html?id=${encodeURIComponent(p.id)}&view=doc">Docs &rarr;</a>`;
        }
        if (p.repo) {
            linksHtml += `<a href="${p.repo}" target="_blank" rel="noopener">Source Code &rarr;</a>`;
        }

        item.innerHTML = `
            <div class="post-header">
                <span class="post-date">${p.date || ""}</span>
                <h4 class="post-title">
                    <!-- Main title links to the blog post view -->
                    <a href="project.html?id=${encodeURIComponent(p.id)}&view=post">${p.title}</a>
                </h4>
            </div>
            <p class="post-desc">${p.short}</p>
            ${linksHtml ? `<div class="post-links">${linksHtml}</div>` : ""}
        `;
        list.appendChild(item);
    });
}


function setupThemeToggle() {
  // support both id names used across pages
  const btn = document.getElementById("theme-toggle") || document.getElementById("theme-toggle-2");
  if (!btn) return;

  // Read applied theme and set button label
  const applied = localStorage.getItem("theme");

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

  });
}
