# 🖥️ WebShell - Interactive Terminal Emulator

A full-stack web-based file system simulator with a beautiful, interactive terminal interface. Built with TypeScript, Node.js WebSockets, and React with Next.js.

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup & Configuration](#setup--configuration)
- [Running the Project](#running-the-project)
- [Available Commands](#available-commands)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Development](#development)

---

## ✨ Features

- **Real-time Terminal Interface**: Interactive terminal with cursor support
- **Virtual File System**: Create, manage, and navigate files and directories
- **WebSocket Communication**: Real-time bidirectional communication between frontend and backend
- **Beautifully Formatted Output**: 
  - List formatting with item counts
  - Path highlighting
  - Success/error indicators
  - JSON and table displays
- **Command History**: Persistent command history across sessions
- **Responsive Design**: Works on desktop and tablet
- **Modern UI**: Dark terminal theme with color-coded responses

---

## 📁 Project Structure

```
webshell-monorepo/
├── packages/
│   ├── backend/              # Node.js WebSocket server
│   │   ├── src/
│   │   │   ├── index.ts      # WebSocket server entry point
│   │   │   └── shell/
│   │   │       ├── executor.ts    # Command execution logic
│   │   │       ├── parser.ts      # Command parsing
│   │   │       ├── registry.ts    # Command handlers
│   │   │       └── state.ts       # Virtual file system state
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/             # Next.js React application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globals.css
│   │   │   │   └── components/
│   │   │   │       └── terminal.tsx    # Main terminal component
│   │   │   └── hooks/
│   │   │       └── webSocket.ts        # WebSocket hook
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.ts
│   │
│   └── shared/               # Shared type definitions
│       ├── src/
│       │   ├── index.ts
│       │   └── types.ts      # Shared TypeScript types
│       ├── package.json
│       └── tsconfig.json
│
├── package.json              # Root workspace config
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **ws (WebSockets)** - Real-time bidirectional communication
- **npm workspaces** - Monorepo management

### Frontend
- **React 18** - UI library
- **Next.js** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Shared
- **TypeScript Types** - Centralized type definitions for backend & frontend

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)

Check your versions:
```bash
node --version
npm --version
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd terminal
```

### 2. Install Dependencies

Install root-level dependencies and all workspace packages:

```bash
npm install
```

This will automatically install dependencies for:
- `packages/backend`
- `packages/frontend`
- `packages/shared`

### 3. Verify Installation

Check that all packages are installed:

```bash
npm list --depth=0
```

---

## 🔧 Setup & Configuration

### Backend Configuration

The backend server runs on **port 8080** by default. To change it:

1. Open [packages/backend/src/index.ts](packages/backend/src/index.ts)
2. Modify the `PORT` variable:

```typescript
const PORT = 8080; // Change this value
```

### Frontend Configuration

The frontend connects to the WebSocket server at `ws://localhost:8080`. To change it:

1. Open [packages/frontend/src/app/hooks/webSocket.ts](packages/frontend/src/app/hooks/webSocket.ts)
2. Modify the WebSocket URL:

```typescript
const { command, isConnected, sendCommand } = useWebSocket('ws://localhost:8080');
```

---

## 🚀 Running the Project

### Option 1: Run Everything (Recommended)

Start both frontend and backend simultaneously:

```bash
npm run dev
```

This command:
- Starts the backend on `ws://localhost:8080`
- Starts the frontend on `http://localhost:3000`

### Option 2: Run Backend Only

```bash
npm run dev:backend
```

The backend will be available at `ws://localhost:8080`

### Option 3: Run Frontend Only

```bash
npm run dev:frontend
```

The frontend will be available at `http://localhost:3000` (requires backend running separately)

### Build for Production

Build all packages:

```bash
npm run build
```

Build specific packages:

```bash
npm run build:frontend
npm run build:backend
```

---

## 📝 Available Commands

The terminal supports the following commands:

### File System Navigation

| Command | Syntax | Description |
|---------|--------|-------------|
| `scan` | `scan` | List all files and directories in current directory |
| `warp` | `warp <directory>` | Change to a different directory |
| `pwd` | `pwd` | Print current working directory path |

### Directory Operations

| Command | Syntax | Description |
|---------|--------|-------------|
| `forge` | `forge <dirname>` | Create a new directory |
| `murderdir` | `murderdir <dirname>` | Remove a directory |

### File Operations

| Command | Syntax | Description |
|---------|--------|-------------|
| `spawn` | `spawn <filename>` | Create a new file |
| `inject` | `inject <filename> <content>` | Write content to a file |
| `read` | `read <filename>` | Display file contents |
| `murder` | `murder <filename>` | Delete a file |

### Utility Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `help` | `help` | Show all available commands |
| `clear` | `clear` | Clear terminal history |

### Example Usage

```bash
# Navigate file system
forge myproject
warp myproject
pwd

# Create and edit files
spawn README.md
inject README.md "Hello World"
read README.md

# List contents
scan

# Go back
warp ..

# Get help
help
```

---

## 🔄 How It Works

### Communication Flow

```
User Input (Frontend)
    ↓
Terminal Component (React)
    ↓
WebSocket Send (Hook)
    ↓
Backend Server (WebSocket)
    ↓
Command Parser → Command Registry → Handler
    ↓
Execute on Virtual FS (State)
    ↓
Format Output (Executor)
    ↓
WebSocket Response
    ↓
OutputRenderer Component
    ↓
Display to User (Pretty Formatted)
```

### Step-by-Step Process

#### 1. **User Input**
User types a command in the terminal and presses Enter.

#### 2. **Frontend Processing**
- Input captured by hidden textarea in [terminal.tsx](packages/frontend/src/app/components/terminal.tsx)
- Command added to history display
- Sent to backend via WebSocket

#### 3. **Backend Parsing**
[parser.ts](packages/backend/src/shell/parser.ts) tokenizes the command:
```
"spawn hello.txt" → { cmd: "spawn", args: ["hello.txt"] }
```

#### 4. **Command Execution**
[registry.ts](packages/backend/src/shell/registry.ts) looks up the handler function for the command and executes it with current state.

#### 5. **Format Output**
[executor.ts](packages/backend/src/shell/executor.ts) formats the raw output into structured data:
```typescript
{
  format: "list",           // Type of format
  content: ["file1", "file2"],  // Actual content
  metadata: { itemCount: 2 }    // Additional info
}
```

#### 6. **State Management**
[state.ts](packages/backend/src/shell/state.ts) maintains the virtual file system tree with file and directory nodes.

#### 7. **Response to Frontend**
Backend sends structured response:
```json
{
  "type": "output",
  "data": "...",
  "structured": {
    "format": "list",
    "content": [...],
    "metadata": {...}
  },
  "timestamp": 1234567890
}
```

#### 8. **Frontend Rendering**
[OutputRenderer](packages/frontend/src/app/components/terminal.tsx#L56) component interprets format and renders beautifully:
- **list** → Formatted with arrows (→)
- **path** → Blue highlighted box
- **success** → Green checkmark (✓)
- **error** → Red X (✗)
- **table** → Bordered table
- **json** → Code block with syntax

---

## 🏗️ Architecture

### Type System

All types are defined in [packages/shared/src/types.ts](packages/shared/src/types.ts):

```typescript
// Command input from frontend
type CommandMessage = {
  command: string;
  timestamp: number;
};

// Structured output format
type StructuredOutput = {
  format: OutputFormat;  // "text" | "list" | "table" | "json" | "path" | "success" | "error"
  content: string | string[] | Record<string, string>;
  metadata?: {
    itemCount?: number;
    isEmpty?: boolean;
  };
};

// Response from backend
type CommandResponse = {
  type: "output" | "error" | "clear";
  data?: string;
  structured?: StructuredOutput;
  timestamp: number;
};
```

### Virtual File System

Files and directories are represented as nodes:

```typescript
type FileNode = {
  id: string;                    // Unique identifier
  name: string;                  // File/directory name
  type: "file" | "directory";
  parent: FileNode | null;       // Parent directory
  children?: FileNode[];         // For directories only
  content?: string;              // For files only
};
```

### State Management

Backend maintains state per connection:

```typescript
type ShellState = {
  cwd: FileNode;           // Current working directory
  history: string[];       // Command history
};
```

---

## 💻 Development

### Project Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start both backend and frontend in dev mode |
| `npm run dev:backend` | Start only backend dev server |
| `npm run dev:frontend` | Start only frontend dev server |
| `npm run build` | Build all packages for production |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |

### Adding New Commands

To add a new command:

1. **Create Handler** in [packages/backend/src/shell/registry.ts](packages/backend/src/shell/registry.ts):

```typescript
export const myCommandHandler: CommandHandler = (args, state) => {
  // Command logic here
  return "Output message";
};
```

2. **Register Command** in `commandRegistry`:

```typescript
export const commandRegistry: Record<string, CommandHandler> = {
  mycommand: myCommandHandler,
  // ... other commands
};
```

3. **Add Format Logic** in [packages/backend/src/shell/executor.ts](packages/backend/src/shell/executor.ts):

```typescript
} else if (cmdName === "mycommand") {
  // Format output as desired
  structured = { format: "list", content: [...] };
}
```

4. **Test** by running and trying the command:

```bash
npm run dev
# Terminal: mycommand
```

### Debugging

Enable console logs in:
- **Backend**: [packages/backend/src/index.ts](packages/backend/src/index.ts)
- **Frontend**: [packages/frontend/src/app/hooks/webSocket.ts](packages/frontend/src/app/hooks/webSocket.ts)

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Problem**: "WebSocket is not connected" in browser console

**Solutions**:
1. Ensure backend is running: `npm run dev:backend`
2. Check WebSocket URL in [webSocket.ts](packages/frontend/src/app/hooks/webSocket.ts)
3. Verify backend port matches (default 8080)
4. Check browser console for CORS errors

### Commands not found

**Problem**: "Command not found" error

**Solutions**:
1. Check command spelling (case-sensitive)
2. Verify command is registered in `commandRegistry`
3. Check handler function exists and is exported
4. Restart both frontend and backend

### Port already in use

**Problem**: `Error: listen EADDRINUSE`

**Solutions**:
1. Find process using port: `lsof -i :8080`
2. Kill process: `kill -9 <PID>`
3. Or change PORT in [index.ts](packages/backend/src/index.ts)

---



---

**Built with ❤️ using TypeScript, Node.js, and React**
