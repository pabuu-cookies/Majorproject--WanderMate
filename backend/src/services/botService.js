const translator = require("open-google-translator");
const Fuse = require("fuse.js");
const suggestionsData = require("../middlewares/suggestionData");

const locationsArray = Object.keys(suggestionsData).map((key) => ({
  location: key,
  suggestions: suggestionsData[key],
}));

// Set up Fuse.js options
const fuse = new Fuse(locationsArray, {
  keys: ["location"],
  threshold: 0.3, // Adjust similarity threshold (0 = exact, 1 = broad)
});

class rasaService {
  async getSuggestions(location) {
    try {
      const result = fuse.search(location);

      if (result.length > 0) {
        const bestMatch = result[0].item;
        return { tasks: bestMatch.suggestions }; // ✅ Keeping the expected structure
      } else {
        return { tasks: [] }; // ✅ Ensures frontend compatibility
      }
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  async translate(translatefrom, text, translateTo) {
    try {
      if (!translatefrom || !translateTo || !text) {
        throw new Error(
          "Missing required fields: 'fromLanguage', 'toLanguage', or 'text'"
        );
      }
      const supportedLanguages = await translator.supportedLanguages();
      console.log(
        supportedLanguages,
        "user this list to map language with their code"
      );

      const data = await translator.TranslateLanguageData({
        listOfWordsToTranslate: [text],
        fromLanguage: translatefrom,
        toLanguage: translateTo,
      });

      return { translatedText: data };
    } catch (error) {
      console.log("Error during translation:", error);
      return { error: error.message };
    }
  }
}

module.exports = new rasaService();
