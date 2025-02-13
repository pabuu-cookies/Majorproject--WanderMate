const axios = require("axios");
require("dotenv").config();
const translator = require("open-google-translator");
const rasa_url = process.env.RASA_URL;

class rasaService {
  async sendMessage(message) {
    try {
      console.log(process.env.RASA_URL);
      const results = await axios.post(rasa_url, { message });
      return results.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSuggestions(location) {
    try {
      // Actionable tasks for specific locations in Nepal
      const suggestionsData = {
        "kathmandu_durbar_square": [
          "Take a guided tour of Hanuman Dhoka Palace to learn about Nepal's royal history.",
          "Visit Kumari Ghar to catch a glimpse of the Living Goddess.",
          "Climb Basantapur Tower for panoramic views of the square.",
          "Offer prayers to the Kal Bhairav Statue for protection and justice.",
          "Walk around the square and admire the intricate carvings of Jagannath Temple.",
          "Visit during Indra Jatra Festival to enjoy the Lakhey Dance and chariot processions.",
          "Explore the Hanuman Dhoka Palace Museum to view artifacts from Nepal’s monarchy.",
        ],
        "PashupatinathTemple": [
          "Attend the evening aarti ceremony on the Bagmati River for a spiritual experience.",
          "Pay respects at the main shrine of Pashupatinath, dedicated to Lord Shiva.",
          "Watch cremation rituals at Arya Ghat and learn about Nepalese traditions.",
          "Visit Guhyeshwari Temple to pay homage to Goddess Parvati.",
          "Stroll through Shlesmantak Forest and spot deer roaming in the area.",
          "Explore the temple complex and marvel at its architecture.",
          "Join the Maha Shivaratri festival celebrations if visiting during the season.",
        ],
        "swayambhunath (Monkey Temple)": [
          "Climb the steps to the top of the hill for breathtaking views of Kathmandu Valley.",
          "Walk around the stupa and spin the prayer wheels for blessings.",
          "Visit Harati Devi Temple and offer prayers for health and happiness.",
          "Watch the monkeys playing around the temple area.",
          "Admire the giant golden Buddha statue near the stupa.",
          "Relax in the peaceful environment of the Tibetan Monastery.",
          "Take photos at the Vajra Thunderbolt, symbolizing wisdom and compassion.",
        ],
      };

      // Check if the location exists in the hardcoded data
      const suggestions = suggestionsData[location];

      if (!suggestions || suggestions.length === 0) {
        return { message: `Sorry, I couldn't find any tasks for ${location}.` };
      }
      console.log(`suggestion for  the ${location}: ${suggestions}`);
      return { tasks: suggestions };
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
      console.log(supportedLanguages);

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
