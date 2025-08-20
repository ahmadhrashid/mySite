window.PROJECTS = [
    {
        id: "go-redis",
        title: "Redis Clone in Go",
        short: "A Redis-like server in Go; implemented BLPOP, PUBLISH and basic replication.",
        tech: ["Go", "Networking", "RESP"],
        impact: "Implemented BLPOP and PUBLISH; passed the provided unit tests for Stage NA2 and integrated replication ACKs.",
        repo: "https://github.com/your-github/go-redis",
        mdPath: "projects/redis.md",
        date: "August 2025"
    },
    {
        id: "web-server",
        title: "Multithreaded Web Server",
        short: "A minimal HTTP web server designed to serve static files concurrently using a configurable thread pool.",
        tech: ["C", "Concurrency", "HTTP"],
        impact: "Built a multithreaded server with worker pools and request parsing; used as a learning project for concurrency.",
        repo: "https://github.com/your-github/web-server",
        mdPath: "projects/webserver.md",
        date: "June 2025"
    },
    {
        id: "mysh",
        title: "mysh — POSIX-style Unix shell",
        short: "A POSIX-style shell in C supporting pipelines, job control and an integrated TCP chat server.",
        tech: ["C", "CLI", "POSIX"],
        impact: "Built a shell with job control, environment expansion, pipelines and an integrated TCP chat server — used for systems programming practice.",
        repo: "https://github.com/your-github/mysh",
        mdPath: "projects/mysh.md",
        date: "March 2025"
    }
];
