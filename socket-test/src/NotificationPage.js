import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Notification Component for each User/Guide
const NotificationComponent = ({ userId, userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:5500"); // Your WebSocket server URL

    // Listen for successful connection
    socket.on("connect", () => {
      console.log(`${userType} connected to WebSocket server!`);
      setConnected(true);

      // Join the user-specific room after connection
      socket.emit("joinRoom", { roomId: userId }); // Emit to join the room with user ID
    });

    // Listen for notification messages
    socket.on("notification", (data) => {
      console.log(`${userType} received notification:`, data);
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
      console.log(`${userType} disconnected from WebSocket server!`);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, userType]); // Re-run effect if userId or userType changes

  return (
    <div style={{ marginBottom: "30px" }}>
      <h2>{userType} Notifications</h2>
      <p>{connected ? "Connected to WebSocket" : "Connecting..."}</p>
      <h3>Notifications:</h3>
      {notifications.length === 0 ? (
        <p>No notifications received yet.</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>
              <strong>{notification.type}</strong>: {notification.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const NotificationPage = () => {
  const userId = "67ab20faccc2d8f67d689f71"; // User ID (This can be dynamically fetched from user context)
  const guideId = "67ce420cbf967a3ef10f5c77"; // Guide ID

  return (
    <div>
      <h1>Notifications Page</h1>

      {/* User Notifications Component */}
      <NotificationComponent userId={userId} userType="User" />

      {/* Guide Notifications Component */}
      <NotificationComponent userId={guideId} userType="Guide" />
    </div>
  );
};

export default NotificationPage;
