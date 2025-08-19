// scripts/projects.js
window.PROJECTS = [
    {
        id: "mysh",
        title: "mysh — POSIX-style Unix shell",
        short: "A POSIX-style shell in C supporting pipelines, job control and a small integrated chat server.",
        tech: ["C", "POSIX"],
        impact: "Built a shell with job control, environment expansion, pipelines and an integrated TCP chat server — used for systems programming practice.",
        repo: "https://github.com/ahmadhrashid/mysh",
        mdPath: "projects/mysh.md",
        thumb: "assets/mysh.gif"
    },
    {
        id: "go-redis",
        title: "Go Redis — Redis clone features",
        short: "A Redis-like server in Go; implemented BLPOP, PUBLISH and basic replication.",
        tech: ["Go", "Networking"],
        impact: "Implemented BLPOP and PUBLISH; passed the provided unit tests for Stage NA2 and integrated replication ACKs.",
        repo: "https://github.com/ahmadhrashid/go-redis",
        mdPath: "projects/go-redis.md",
        thumb: "assets/go-redis.gif"
    },
    {
        id: "web-server",
        title: "Multithreaded Web Server (C)",
        short: "A performance-focused, multithreaded HTTP server in C for a summer project.",
        tech: ["C", "Concurrency"],
        impact: "Built a multithreaded server with worker pools and request parsing; used as a learning project for concurrency.",
        repo: "https://github.com/your-github/web-server",
        mdPath: "projects/web-server.md",
        thumb: "assets/web-server.gif"
    }
];
