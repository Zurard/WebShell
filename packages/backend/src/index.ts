import { WebSocketServer, WebSocket } from "ws";
import { executeCommand } from "./shell/executor.js";
import { InitialShellState } from "./shell/state.js";
import type { CommandResponse } from "@webshell/shared/src/types.js";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Map to store per-client session state
const clientSessions = new Map<WebSocket, { id: string; state: typeof InitialShellState }>();

// console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  // Generate unique session ID for this connection
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  // console.log(`Client connected with session: ${sessionId}`);

  // Create DEEP COPY of state for this client - prevents shared references
  const clientState = JSON.parse(JSON.stringify(InitialShellState));
  clientSessions.set(ws, { id: sessionId, state: clientState });

  // Send session ID to client
  const initResponse: CommandResponse = {
    type: "output",
    data: `Connected with session: ${sessionId}`,
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(initResponse));

  ws.on("message", (command: string) => {
    const cmd = command.toString().trim();
    const session = clientSessions.get(ws);
    
    if (!session) return;
    
    // console.log(`[${session.id}] Received command: ${cmd}`);

    // Execute command with this client's state
    const output = executeCommand(cmd, session.state);
    // console.log(`[${session.id}] Command output:`, output);

    // Send response ONLY to this client
    const response: CommandResponse = {
      type: output.success ? "output" : "error",
      data: output.message,
      ...(output.structured && { structured: output.structured }),
      timestamp: Date.now()
    };
    
    ws.send(JSON.stringify(response));
  });

  ws.on("close", () => {
    const session = clientSessions.get(ws);
    // console.log(`Client disconnected: ${session?.id}`);
    clientSessions.delete(ws);
  });
});

