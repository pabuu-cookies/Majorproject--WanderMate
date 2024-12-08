const { NlpManager } = require('node-nlp');
const fs = require('fs');

// Initialize the NLP manager
const manager = new NlpManager({ languages: ['en'] });

// Load the data from intents.json
fs.readFile('bhaktapur.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading bhaktapur.json:', err);
    return;
  }

  const intentsData = JSON.parse(data);
  
  // Add intents and examples to the NLP manager
  intentsData.data.forEach(item => {
    manager.addDocument('en', item.question, item.intent);
    manager.addAnswer('en', item.intent, item.answer);
  });

  // Train the model
  (async () => {
    await manager.train();
    manager.save(); // Save the trained model
    console.log('Model trained and saved!');
  })();
});

// Function to handle real-time user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion() {
  rl.question('You: ', async (input) => {
    const response = await manager.process('en', input);
    console.log('Bot:', response.answer);
    askQuestion(); // Keep the conversation going
  });
}

askQuestion(); // Start the conversation loop
