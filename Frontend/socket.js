import { io } from "socket.io-client";

// Replace with your server's URL
const SERVER_URL = "http://localhost:5500";
const socket = io(SERVER_URL, {
  transports: ["websocket"],
  // Additional configurations as needed
});

// Listen for the connect event
socket.on("connect", () => {
  console.log("Socket connected to backend with ID:", socket.id);
});

// Optionally, listen for disconnection
socket.on("disconnect", () => {
  console.log("Socket disconnected from backend");
});

export default socket;
