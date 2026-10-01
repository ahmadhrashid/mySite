document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get("id");
    const view = urlParams.get("view") || "post"; // Defaults to blog post

    if (!id) {
        document.getElementById("markdown-content").innerText = "No project specified.";
        return;
    }
    const project = (window.PROJECTS || []).find(p => p.id === id);
    if (!project) {
        document.getElementById("markdown-content").innerText = `Project "${id}" not found.`;
        return;
    }

    document.title = `Ahmad Rashid | ${project.title}`;
    document.getElementById("project-title").innerText = project.title;
    document.getElementById("project-sub").innerText = project.short;
    
    // Hide the GitHub header button if there is no repo (e.g., for internships)
    const repoLink = document.getElementById("repo-link");
    if (project.repo) {
        repoLink.href = project.repo;
        repoLink.style.display = "inline-flex";
    } else {
        repoLink.style.display = "none";
    }

    // Apply layout based on view type
    const mainContainer = document.getElementById("main-container");
    const tocAside = document.getElementById("toc");
    const targetPath = (view === "doc") ? project.docPath : project.postPath;
    
    if (view === "post") {
        mainContainer.className = "container post-container";
        tocAside.style.display = "none";
    } else {
        mainContainer.className = "container project-container";
        tocAside.style.display = "block";
    }

    if (!targetPath) {
        document.getElementById("markdown-content").innerText = "Document not found.";
        return;
    }

    fetch(targetPath)
        .then(r => {
            if (!r.ok) throw new Error("Failed to load markdown");
            return r.text();
        })
        .then(md => renderMarkdown(md, view))
        .catch(err => {
            document.getElementById("markdown-content").innerText = `Error loading file: ${err.message}`;
        });
});

// Update renderMarkdown to accept the view parameter
function renderMarkdown(md, view) {
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
    
    const doc = document.getElementById("doc");
    doc.style.minWidth = "0";
    
    addCopyButtons(container);
    
    // Only generate the sidebar if the user clicked Docs
    if (view === "doc") {
        buildTOC(container);
    }
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
    }

    btn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "dark" ? "" : "dark";
        if (next) document.documentElement.setAttribute("data-theme", next);
        else document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", next);
    });
}
