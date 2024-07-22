const express = require('express');
const bodyParser  = require('body-parser');
const cors = require('cors');
const app = express();
const chatbotRoute = require('./routes/rasaRoutes.js');

console.log('require mai xam ajhai');
app.use(bodyParser.json());
app.use(cors());

app.use('/chatbot',chatbotRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});