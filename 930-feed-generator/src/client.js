import { WebSocket } from "ws";
import "dotenv/config";

const PORT = process.env.PORT || "3001";

const socket = new WebSocket(`ws://localhost:${PORT}`);

// Executes when the connection is successfully established.
socket.addEventListener("open", (event) => {
  // this.#logger("WebSocket connection established!");
  // Sends a message to the WebSocket server.
  //   socket.send("Hello Server!");
  const data = { type: "message", content: "Hello from Node.js!" };
  socket.send(JSON.stringify(data));
});

// Listen for messages and executes when a message is received from the server.
socket.addEventListener("message", (event) => {
  // this.#logger("Message from server: ", event.data);
  // console.log("Message from server: ", event.type)
  // console.log("Message from server: ", event.target)
  // console.log("Message from server: ", event.data)

  try {
    const receivedData = JSON.parse(event.data);
    // this.#logger("Received JSON:", receivedData);
    console.log("Received JSON:", receivedData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // this.#logger("Received data was:", event.data);
  }
});

// Executes when the connection is closed, providing the close code and reason.
socket.addEventListener("close", (event) => {
  // this.#logger("WebSocket connection closed:", event.code, event.reason);
  console.error("WebSocket connection closed:", event.code, event.reason);
});

// Executes if an error occurs during the WebSocket communication.
socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});
