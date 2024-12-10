const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");
  
    ws.on("message", (message) => {
      let parsedMessage;
  
      try {
        parsedMessage = JSON.parse(message);
      } catch (err) {
        console.error("Invalid message format:", message);
        return;
      }
  
      console.log("Received from client:", parsedMessage);
  
      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage)); // Broadcast the message
        }
      });
    });
  
    ws.on("close", () => {
      console.log("Client disconnected");
    });
  
    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });
  });

console.log("WebSocket server is running on ws://localhost:8080");
