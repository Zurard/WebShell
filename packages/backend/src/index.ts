import { WebSocketServer, WebSocket } from "ws";
import { executeCommand } from "./shell/executor.js";
import { InitialShellState } from "./shell/state.js";

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
    console.log(`Command output: ${output}`);

    // Send output back to client
    ws.send(JSON.stringify({ type: "output", data: output }));

  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
