// --- DEFAULT THEME: dark ---
// If the user hasn't chosen a theme yet, default to dark.
if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
}

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
        document.getElementById("markdown-content").innerText = "No project specified.";
        return;
    }
    const project = (window.PROJECTS || []).find(p => p.id === id);
    if (!project) {
        document.getElementById("markdown-content").innerText = `Project "${id}" not found.`;
        return;
    }

    // fill header meta
    document.getElementById("project-title").innerText = project.title;
    document.getElementById("project-sub").innerText = project.short;
    const repoLink = document.getElementById("repo-link");
    repoLink.href = project.repo;

    // fetch and render markdown
    fetch(project.mdPath)
        .then(r => {
            if (!r.ok) throw new Error("Failed to load markdown");
            return r.text();
        })
        .then(md => renderMarkdown(md))
        .catch(err => {
            document.getElementById("markdown-content").innerText = `Error loading project doc: ${err.message}`;
        });
});

function renderMarkdown(md) {
    // Use marked to parse markdown to HTML
    marked.setOptions({
        gfm: true,
        headerIds: true,
        mangle: false,
        highlight: function (code, lang) {
            try {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            } catch (e) {
                return code;
            }
        }
    });

    const html = marked.parse(md);
    const container = document.getElementById("markdown-content");
    container.innerHTML = html;

    // Make sure doc won't force page width to expand
    // (ensures children can shrink)
    const doc = document.getElementById("doc");
    doc.style.minWidth = "0";

    // Add copy buttons for code blocks
    addCopyButtons(container);

    // Build TOC
    buildTOC(container);
}

function addCopyButtons(container) {
    const pres = container.querySelectorAll("pre");
    pres.forEach(pre => {
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.innerText = "Copy";
        btn.title = "Copy code";
        btn.addEventListener("click", () => {
            const code = pre.querySelector("code");
            if (!code) return;
            navigator.clipboard.writeText(code.innerText).then(() => {
                btn.innerText = "Copied!";
                setTimeout(() => (btn.innerText = "Copy"), 1400);
            }).catch(() => {
                btn.innerText = "Failed";
                setTimeout(() => (btn.innerText = "Copy"), 1200);
            });
        });
        pre.style.position = "relative";
        btn.style.position = "absolute";
        btn.style.top = "8px";
        btn.style.right = "8px";
        pre.appendChild(btn);
    });

    // Activate highlight.js on all code blocks
    document.querySelectorAll('pre code').forEach(el => {
        try { hljs.highlightElement(el); } catch (e) { }
    });
}

function buildTOC(container) {
    const headings = container.querySelectorAll("h1, h2, h3");
    const tocList = document.getElementById("toc-list");
    tocList.innerHTML = "";
    if (headings.length === 0) {
        tocList.innerHTML = "<p class='small'>No TOC available.</p>";
        return;
    }
    headings.forEach(h => {
        if (!h.id) {
            h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
        }
        const a = document.createElement("a");
        a.href = "#" + h.id;
        a.innerText = h.textContent;
        a.style.marginLeft = (h.tagName === "H2" ? "8px" : h.tagName === "H3" ? "14px" : "0");
        tocList.appendChild(a);
    });
}

function setupThemeToggle() {
    const btn = document.getElementById("theme-toggle-2");
    const applied = localStorage.getItem("theme");
    if (applied) {
        document.documentElement.setAttribute("data-theme", applied);
        btn.innerText = applied === "dark" ? "Light" : "Dark";
    } else {
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
