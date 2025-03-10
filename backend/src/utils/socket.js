const { Server } = require("socket.io");
const http = require("http");

let io;

const initializeSocket = (server) => {
  console.log("Initializing Socket.IO...");

  // Ensure server is of type http.Server
  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your client URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle user authentication (e.g., joining room with user ID)
    socket.on("authenticate", (userId) => {
      console.log(`User authenticated with ID: ${userId}`);
      socket.join(userId); // Join the user to a room with their user ID
      console.log(`User ${userId} joined their private room.`);
    });

    // Handle joinRoom event (for admins or specific users)
    socket.on("joinRoom", ({ roomId }) => {
      console.log(`Socket ${socket.id} joining room: ${roomId}`);
      socket.join(roomId); // Join the specified room
      console.log(`Socket ${socket.id} successfully joined room ${roomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.IO is ready and listening for connections.");
};

// Export the instance to use it in other files
const getSocketIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Please call initializeSocket first."
    );
  }
  console.log("Returning initialized Socket.IO instance.");
  return io;
};

module.exports = {
  initializeSocket,
  getSocketIO,
};
