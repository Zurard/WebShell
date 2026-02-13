import { WebSocketServer, WebSocket } from "ws";
import { exec } from "child_process";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("message", (command: string) => {
    const cmd = command.toString().trim();
    console.log(`Received command: ${cmd}`);


    // Execute real Linux command   
    exec(cmd, (error, stdout, stderr) => {
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
