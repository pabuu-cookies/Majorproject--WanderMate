const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectMongoDB = require('./services/connection');
const { chatbotRoute, userRoute } = require('./routers/index');
const User = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use('/chatbot', chatbotRoute);
app.use('/user', userRoute);

(async () => {
  try {
    await connectMongoDB(); 
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
})();