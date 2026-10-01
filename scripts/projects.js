window.PROJECTS = [
    {
    id: "mongodb-search-sync",
    title: "My MongoDB Internship Experience",
    short: "My experience building Go-based infrastructure to synchronize search indexes across MongoDB clusters",
    tech: ["Go", "Distributed Systems", "Infrastructure"],
    repo: "", 
    postPath: "posts/mongodb.md",
    date: "August 2026"
},
    {
        id: "go-redis",
        title: "Redis Clone in Go",
        short: "Built a high-performance Redis clone in Go with replication, concurrency, and core key-value operations.",
        tech: ["Go", "Networking", "RESP"],
        impact: "Implemented BLPOP and PUBLISH; passed the provided unit tests for Stage NA2 and integrated replication ACKs.",
        repo: "https://github.com/ahmadhrashid/go-redis",
        postPath: "posts/redis.md",
        docPath: "projects/redis.md",
        date: "August 2025"
    },
    {
        id: "web-server",
        title: "Multithreaded Web Server",
        short: "A minimal HTTP web server designed to serve static files concurrently using a configurable thread pool.",
        tech: ["C", "Concurrency", "HTTP"],
        impact: "Built a multithreaded server with worker pools and request parsing; used as a learning project for concurrency.",
        repo: "https://github.com/ahmadhrashid/webserver",
        postPath: "posts/webserver.md",
        docPath: "projects/webserver.md",
        date: "June 2025"
    },
    {
        id: "mysh",
        title: "mysh - Unix Shell in C",
        short: "A POSIX-style shell in C supporting pipelines, job control and an integrated TCP chat server.",
        tech: ["C", "CLI", "POSIX"],
        impact: "Built a shell with job control, environment expansion, pipelines and an integrated TCP chat server — used for systems programming practice.",
        repo: "",
        postPath: "posts/mysh.md",
        docPath:"projects/mysh.md",
        date: "March 2025"
    }
];
