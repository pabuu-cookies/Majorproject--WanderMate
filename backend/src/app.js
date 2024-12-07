const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectMongoDB = require('./services/connection');
const router = require('./routers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(router);

(async () => {
  try {
    await connectMongoDB(); 
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
})();