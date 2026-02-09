import { WebSocketServer, WebSocket } from "ws";
import { exec } from "child_process";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("message", (message: string) => {
    const command = message.toString().trim();
    console.log(`Received command: ${command}`);

    // Handle built-in commands
    if (command === "clear") {
      ws.send(JSON.stringify({ type: "clear" }));
      console.log(JSON.stringify({ type: "clear" }));
      return;
    }

    if (command === "help") {
      ws.send(
        JSON.stringify({
          type: "output",
          data: "Available commands: clear, help, echo, ls, pwd, whoami echo ",
        }),
      );
      return;
    }

    // Execute real Linux commands (⚠️ Be careful with security!)
    exec(command, (error, stdout, stderr) => {
      if (error) {
        ws.send(
          JSON.stringify({ type: "error", data: stderr || error.message }),
        );
        return;
      }
      ws.send(JSON.stringify({ type: "output", data: stdout }));
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
