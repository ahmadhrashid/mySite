# mysh - a POSIX-style Unix shell (C)

A small, POSIX-style Unix shell implemented in C.
`mysh` supports pipelines, background jobs, environment-variable expansion, a set of builtin utilities, job control (foreground/background), and a small integrated TCP chat server/client. It was implemented as a systems programming exercise to practice process control, I/O multiplexing, signal handling, and tokenization.

---

## Table of contents

* [Highlights / Features](#highlights--features)
* [Build & Run](#build--run)
* [Quick examples](#quick-examples)

  * [Simple commands](#simple-commands)
  * [Pipelines](#pipelines)
  * [Background jobs](#background-jobs)
  * [Builtins](#builtins)
  * [Chat server / client](#chat-server--client)
* [Design & Internals](#design--internals)

  * [Main loop & input handling](#main-loop--input-handling)
  * [Tokenization & environment expansion](#tokenization--environment-expansion)
  * [Pipelines & process groups](#pipelines--process-groups)
  * [Job management](#job-management)
  * [Builtins: behavior & notable implementations](#builtins-behavior--notable-implementations)
  * [I/O multiplexing & chat integration](#io-multiplexing--chat-integration)
  * [Signal handling and reaping](#signal-handling-and-reaping)
* [Code map (files & responsibilities)](#code-map-files--responsibilities)
* [Testing & debugging tips](#testing--debugging-tips)
* [Limitations & TODOs](#limitations--todos)
* [Contact](#contact)

---

## Highlights / Features

* POSIX-style job control and pipeline execution.
* Background execution with job table and job numbering.
* Builtin commands: `cd`, `ls` (with recursive + filter options), `cat`, `wc`, `kill`, `ps`, `start-server`, `start-client`, `send`, and more.
* Environment-variable expansion and tokenization.
* Robust pipeline semantics using `fork()`, `execvp()`, `dup2()`, and `setpgid()`.
* SIGCHLD reaper that reaps background jobs and prints `[N]+ Done` messages.
* `select()`-based I/O multiplexing to handle `stdin` simultaneously with a non-blocking chat server / multiple clients.
* Careful memory management and defensive error reporting to reduce leaks and improve diagnosability.

---

## Build & run

### Requirements

* Linux or macOS (POSIX APIs): fork/exec, pipes, `select()`.
* `gcc` (or other C compiler) supporting C11 is recommended.

### Build

The Makefile compiles with debugging symbols and a set of sanitizers to catch memory errors and undefined behaviour.

Build Steps:
```bash
# ensure you have cd'd into the src directory
# build mysh
make

# or (same as `make all`)
make mysh

# clean build artifacts
make clean

```

### Run

```bash
./mysh
```

You will see the prompt `mysh$ ` and can enter commands interactively.

---

## Quick examples

### Simple commands

```
mysh$ echo hello world
hello world
mysh$ ls
... directory listing ...
mysh$ cd ..
mysh$ pwd   # will use /bin/pwd
```

### Pipelines

```bash
mysh$ ls | grep src | wc
# Executes `ls`, pipes to `grep src`, pipes to `wc`. Foreground pipeline: mysh waits.
```

* The shell supports multiple pipeline stages and uses `dup2()` to wire pipes correctly.
* Process groups are assigned so a pipeline behaves as a single job (signal semantics preserved).

### Background jobs

```bash
mysh$ sleep 10 &
[1] 12345
mysh$ ps
sleep 10 12345
# When a background job completes, the shell’s SIGCHLD handler prints a job-completion notification (e.g., [1]+ Done ...).
```

* Background jobs are stored in a job list with job numbers; `add_job()` prints the job header.

### Builtins

Examples:

* `cd path` - supports `.`, `..`, and multi-dot shorthands like `...` → `../..`.
* `ls [path] [--f filter] [--rec] [--d depth]` - non-recursive or recursive listing with optional filtering and depth.
* `cat file` or `cat` with stdin - works with files and piped input.
* `wc file` or `wc` with stdin - counts characters, words, and newlines without using high-level string functions.
* `kill pid [signum]` - sends a signal (default `SIGTERM`) with helpful error messages.
* `ps` - prints jobs recorded by the shell.
* `start-server port` / `start-client host port` / `send port host message` - lightweight chat server/client utilities integrated into the shell (see Chat section).

### Chat server / client

Start the server (background builtin):

```bash
mysh$ start-server 12345
# "Chat server started" message (stdout)
```

Connect a client:

```bash
mysh$ start-client 127.0.0.1 12345
# Then you can type messages which are sent to the server
```

Or, from another machine:

```bash
nc 127.0.0.1 12345
# or use the built-in send helper
mysh$ send 12345 127.0.0.1 "hello world"
```

The server broadcasts messages to all connected clients and supports a `\connected` command to query current client count.

---

## Design & Internals

This section is a compact mapping from code to behavior. I read your code and derived the following detailed behavior and decisions.

### Main loop & input handling

* `main()` sets up `SIGINT` handling (`sighandler`) to prevent Ctrl-C from killing the shell and sets up a `SIGCHLD` handler (`sigchld_handler`) to reap background children.
* The shell prints the prompt via `display_message(prompt)` and then uses `select()` to wait for:

  * stdin input
  * server socket activity (if a chat server is running)
  * client sockets activity (if there are chat clients connected)
* When stdin is ready, `get_input()` reads the raw line (with a MAX length defined in your headers), then the shell:

  * trims trailing whitespace
  * checks for pipelines (`|`) and calls `execute_pipeline()` if present
  * tokenizes the input (`tokenize_input`) and performs environment variable expansion (`expand_vars`)

### Tokenization & environment expansion

* Tokenization:

  * `tokenize_input()` uses `strtok_r` with a `DELIMITERS` set to split the input into tokens and `strdup`s each token into memory that is later freed by `free_tokens()`.
  * The tokenizer limits token count to `MAX_TOKENS - 1`.
* Environment expansion:

  * `expand_env_vars()` expands `$VAR` occurrences within a token. It produces a new string limited to 128 characters for the fully expanded token.
  * `expand_vars()` replaces tokens that have `$` expansions with the expanded strings and enforces the 128-char cumulative limit across tokens (it truncates and replaces remaining tokens with an empty string if exceeded).
  * Environment variables are stored in a linked list in `variables.c` with `set_variable()` and `get_value()`.

### Pipelines & process groups

* `execute_pipeline()`:

  * Splits the input on `|` into segments up to `MAX_PIPE_CMDS`.
  * Creates `num_cmds - 1` pipes, then forks `num_cmds` children.
  * In each child:

    * Restores default `SIGINT` handling (so Ctrl-C can interrupt the pipeline children).
    * Sets process group: the first child becomes the group leader, others join that PGID using `setpgid()`. Parents also set PGIDs to keep group consistent.
    * Redirects stdin/stdout for the stage using `dup2()` to pipe fds and closes all pipe fds before exec.
    * Tokenizes and expands variables for that stage and then runs either a builtin (via `check_builtin`) or `execvp()` for external commands.
  * Parent:

    * Closes all pipe fds.
    * If pipeline is background (`&`), `add_job(pgid, input_line)` records it and the shell does **not** wait.
    * If foreground, parent waits for children to finish (`wait(NULL)` per child).
* This design ensures pipelines act as a single job (process group), allowing signals (like SIGINT) to affect the whole pipeline correctly.

### Job management

* Background jobs are tracked via a singly-linked list of `job_t` structures (`commands.c`) with fields: `job_number`, `pid`, `command`, and `next`.
* `add_job(pid, command)` adds a job to the list, assigns a `job_number`, and prints a startup line like `[1] 25787`.
* `remove_job(pid)` removes a job node and returns it for cleanup.
* `sigchld_handler()`:

  * Reaps all terminated children using `waitpid(-1, NULL, WNOHANG)` in a loop.
  * For each reaped background pid found in the job list, it prints `[N]+  Done <command>` and frees the job node.
  * Resets `next_job_number` to 1 if there are no jobs left.

### Builtins: behavior & notable implementations

* `check_builtin(cmd)` finds a builtin function by comparing `BUILTINS` table strings. Returns a function pointer (`bn_ptr`) or `NULL`.
* Builtin highlights:

  * `bn_ls`:

    * Supports `ls [path] [--f filter] [--rec] [--d depth]`.
    * Implements non-recursive listing and recursive traversal with bounded `depth`.
    * Uses `opendir/readdir` to list directory entries safely and supports a simple substring filter
  * `bn_cd`:

    * Supports `.` and `..` and multi-dot shortcuts like `...` -> `../..`, `....` -> `../../..`.
    * Returns helpful errors when path invalid.
  * `bn_cat` and `bn_wc`:

    * `cat` opens a file or reads from `stdin` (fdopen) and writes to stdout using `write()` for low-level correctness with piped input.
    * `wc` counts characters, words, and newlines by reading characters and tracking transitions for word counting (no reliance on high-level functions).
  * `bn_kill`:

    * Parses PID and optional signum and calls `kill(pid, signum)` with robust error messages.
  * `bn_ps`:

    * Iterates job table and prints `command pid` pairs.
  * `bn_start_server`, `bn_start_client`, `bn_send`:

    * `bn_start_server(port)` sets up a non-blocking TCP server socket (fcntl + `SO_REUSEADDR`) and stores it in `chat_server_socket`. `process_chat_server_activity()` will then accept connections.
    * `bn_start_client(host, port)` runs a blocking chat client (`run_chat_client`) that connects to a host and uses `select()` to multiplex stdin and socket.
    * `bn_send` is a convenience client that opens a socket, writes a message, and closes the socket.

### I/O multiplexing & chat integration

* The main loop uses `select()` to wait on:

  * `STDIN_FILENO`
  * `chat_server_socket` (if running)
  * client sockets stored in `chat_clients[]`
* `process_chat_server_activity(&read_fds)`:

  * Accepts new clients and adds them to the `chat_clients` array.
  * Reads client messages and does broadcasting; handles `\connected` special message to reply with the active client count.
  * Manages client removal and socket closing.
* `run_chat_client(host, port)`:

  * Connects to a server and uses `select()` to monitor both `sock_fd` and `stdin`, forwarding user input to the server and printing incoming messages.

### Signal handling and reaping

* `SIGINT`:

  * `sighandler()` prints a newline (via `display_message("\n")`) so Ctrl-C doesn't kill the shell process (children get default `SIGINT` in pipelines).
* `SIGCHLD`:

  * A dedicated handler `sigchld_handler()` reaps children and prints job completion messages. It uses `waitpid` in a loop and safely restores `errno`.
* In child processes, the code sets `signal(SIGINT, SIG_DFL)` so child processes receive default behavior for Ctrl-C.

---

## Code map (files & responsibilities)

* `mysh.c` - `main()` loop, `execute_pipeline()`, prompt handling, high-level flow.
* `builtins.c` - builtin implementations (`bn_ls`, `bn_cd`, `bn_cat`, `bn_wc`, `bn_kill`, `bn_ps`, chat server/client helpers, `bn_start_server`, `bn_start_client`, `bn_send`, etc.)
* `commands.c` - job list, `add_job`, `remove_job`, `sigchld_handler`.
* `io_helpers.c` - `get_input()`, `display_message()`, `display_error()`, `tokenize_input()`, `expand_vars()`, `expand_env_vars()`, `free_tokens()`.
* `variables.c` - environment variable linked-list storage and lookup (`set_variable`, `get_value`, `free_env_vars`).

---

## Testing & debugging tips

* Use `strace` (Linux) or `dtruss` (macOS) to trace `fork`/`exec`/`setpgid`/`waitpid` syscalls when troubleshooting pipeline behavior.
* To debug job control:

  * Run a pipeline with `sleep` and `sleep` and send Ctrl-C to verify only children die and shell remains.
  * Start a background job and inspect `ps` output to confirm background PID is recorded.
* For tokenization and environment expansion edge-cases:

  * Test `$VAR` expansions, long expansions (over 128 char limit), and mixed text such as `echo $A$B`.
* For chat server/client:

  * Start server (`start-server 12345`) then open multiple `nc` clients and try broadcasting. Test `\connected`.
* Turn on extra logging by inserting `display_message()` or `fprintf(stderr, ...)` at critical points (e.g., before/after `fork`, during `setpgid`, and in the SIGCHLD handler).
* Use `valgrind` or `AddressSanitizer` to validate memory usage:

  * Compile with `-fsanitize=address,undefined -g` and run a few interactive sessions.

---

## Limitations & TODOs

* **Quoting and advanced shell parsing:** Command parsing relies on `DELIMITERS` and `strtok_r`. Quoting (`"..."` or `'...'`) and escape handling are not fully implemented (unless provided in headers). This can break complex argument patterns.
* **Job control features:** There is no `fg`, `bg`, or `jobs` builtin implemented (aside from `ps` which prints job entries). You may want to add `fg`/`bg` for full shell ergonomics.
* **Signal race windows:** While `SIGCHLD` is handled, fine-grained synchronization when mutating the job list concurrently with the main loop can be improved.
* **Command line editing / history:** No readline-like editing or history support.
* **Edge-case robustness:** Some builtins handle many options (`ls`), but extreme path lengths or highly nested recursion may be limited by `PATH_MAX` and other constants.
* **Thread-safety:** The shell is single-threaded (uses signals and children). Avoid lengthy blocking operations in the main thread without backgrounding them.
* **Portability:** Code uses POSIX-specific calls; portability to Windows is not targeted.

---

## Contact

**Author:** Ahmad Rashid
**Contact:** `ahmad.rashid@mail.utoronto.ca`
**LinkedIn:** `linkedin.com/in/ahmadhrashid`
