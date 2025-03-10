const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectMongoDB = require("./services/connection");
const router = require("./routers");
const { initializeSocket } = require("./utils/socket");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

(async () => {
  try {
    await connectMongoDB();
    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`server is running on port http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
