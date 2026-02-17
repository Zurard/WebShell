import { WebSocketServer, WebSocket } from "ws";
import { executeCommand } from "./shell/executor.js";
import { InitialShellState } from "./shell/state.js";
import type { CommandResponse } from "@webshell/shared/src/types.js";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  // Create state ONCE per connection - persists across commands
  const state = { ...InitialShellState };

  ws.on("message", (command: string) => {
    const cmd = command.toString().trim();
    console.log(`Received command: ${cmd}`);

    // Execute custom shell command 
    const output = executeCommand(cmd, state);
    console.log(`Command output:`, output);

    // Send structured output back to client
    const response: CommandResponse = {
      type: output.success ? "output" : "error",
      data: output.message,
      ...(output.structured && { structured: output.structured }),
      timestamp: Date.now()
    };
    
    ws.send(JSON.stringify(response));
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
