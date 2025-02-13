const translator = require("open-google-translator");

console.log(translator.supportedLanguages());

translator
  .TranslateLanguageData({
    listOfWordsToTranslate: ["hello here i am", "HI hello"],
    fromLanguage: "en",
    toLanguage: "ne",
  })
  .then((data) => {
    console.log(data);
  });

// const textToSpeech = require('@google-cloud/text-to-speech');
// const client = new textToSpeech.TextToSpeechClient();

// const request = {
//   input: { text: 'Hola, ¿cómo estás?' },
//   voice: { languageCode: 'es-ES', ssmlGender: 'NEUTRAL' },
//   audioConfig: { audioEncoding: 'MP3' },
// };

// client.synthesizeSpeech(request, (err, response) => {
//   if (err) {
//     console.error('ERROR:', err);
//     return;
//   }
//   const fs = require('fs');
//   fs.writeFileSync('output.mp3', response.audioContent, 'binary');
//   console.log('Audio content written to file: output.mp3');
// });
