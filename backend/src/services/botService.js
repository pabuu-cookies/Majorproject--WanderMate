const translator = require("open-google-translator");
const Fuse = require("fuse.js");

const suggestionsData = {
  kathmandu_durbar_square: [
    "Take a guided tour of Hanuman Dhoka Palace to learn about Nepal's royal history.",
    "Visit Kumari Ghar to catch a glimpse of the Living Goddess.",
    "Climb Basantapur Tower for panoramic views of the square.",
    "Offer prayers to the Kal Bhairav Statue for protection and justice.",
    "Walk around the square and admire the intricate carvings of Jagannath Temple.",
    "Visit during Indra Jatra Festival to enjoy the Lakhey Dance and chariot processions.",
    "Explore the Hanuman Dhoka Palace Museum to view artifacts from Nepal’s monarchy.",
  ],
  swayambhunath: [
    "Climb the steps to the top of the hill for breathtaking views of Kathmandu Valley.",
    "Walk around the stupa and spin the prayer wheels for blessings.",
    "Visit Harati Devi Temple and offer prayers for health and happiness.",
    "Watch the monkeys playing around the temple area.",
    "Admire the giant golden Buddha statue near the stupa.",
    "Relax in the peaceful environment of the Tibetan Monastery.",
    "Take photos at the Vajra Thunderbolt, symbolizing wisdom and compassion.",
  ],
  pashupatinath_temple: [
    "Attend the evening aarti ceremony on the Bagmati River for a spiritual experience.",
    "Pay respects at the main shrine of Pashupatinath, dedicated to Lord Shiva.",
    "Watch cremation rituals at Arya Ghat and learn about Nepalese traditions.",
    "Visit Guhyeshwari Temple to pay homage to Goddess Parvati.",
    "Stroll through Shlesmantak Forest and spot deer roaming in the area.",
    "Explore the temple complex and marvel at its architecture.",
    "Join the Maha Shivaratri festival celebrations if visiting during the season.",
  ],
  boudhanath_stupa: [
    "Circumambulate the stupa clockwise, spinning prayer wheels as you go.",
    "Visit nearby monasteries to observe Tibetan Buddhist rituals.",
    "Light a butter lamp for blessings and make a wish.",
    "Enjoy traditional Tibetan food at surrounding restaurants.",
    "Shop for handicrafts and souvenirs in the local shops.",
    "Participate in meditation sessions offered by local centers.",
    "Observe monks chanting prayers during their daily rituals.",
  ],
  thamel_market: [
    "Shop for pashmina shawls, handicrafts, and souvenirs.",
    "Sample traditional Nepali cuisine at local restaurants.",
    "Enjoy live music at one of the many bars and pubs.",
    "Book a trekking or adventure tour with a local agency.",
    "Explore bookstores for maps and literature on Nepal.",
    "Relax with a spa treatment or traditional Nepali massage.",
    "Experience the vibrant nightlife and meet fellow travelers.",
  ],
  bhaktapur_durbar_square: [
    "Visit the 55-Window Palace, a masterpiece of woodwork.",
    "Admire the Nyatapola Temple, the tallest pagoda in Nepal.",
    "Explore the Pottery Square and try your hand at pottery making.",
    "Taste the famous Juju Dhau, a traditional sweet yogurt.",
    "Observe local artisans crafting traditional artworks.",
    "Wander through the narrow alleys and discover hidden temples.",
    "Visit the National Art Gallery to see ancient paintings and manuscripts.",
  ],
  patan_durbar_square: [
    "Explore the Patan Museum to learn about Nepalese art and history.",
    "Visit the Krishna Mandir, known for its stone carvings.",
    "Admire the intricate architecture of Hiranya Varna Mahavihar (Golden Temple).",
    "Stroll through the square and observe local life and activities.",
    "Shop for traditional metal crafts and jewelry in nearby shops.",
    "Relax at a rooftop café with views of the square.",
    "Participate in workshops to learn traditional crafts like pottery or painting.",
  ],
  swayambhunath_hike: [
    "Begin your hike early to enjoy the sunrise over Kathmandu Valley.",
    "Carry water and wear comfortable shoes for the uphill climb.",
    "Observe various species of birds and butterflies along the trail.",
    "Take rest at viewpoints to capture panoramic photographs.",
    "Learn about the history and legends associated with Swayambhunath.",
    "Visit the World Peace Pond and make a wish.",
    "Enjoy the serene environment away from the city's hustle and bustle.",
  ],
  champadevi_hike: [
    "Start the hike from Pharping, a town rich in cultural heritage.",
    "Enjoy panoramic views of the Himalayas, including Langtang and Gauri Shankar ranges.",
    "Visit the Champadevi Temple at the summit, a pilgrimage site for locals.",
    "Observe diverse flora and fauna along the trail.",
    "Pack a picnic to enjoy at the top with scenic views.",
    "Capture the beauty of Kathmandu Valley from the hilltop.",
    "Consider hiring a local guide for insights into the area's history and culture.",
  ],
  rock_climbing_nagarjun: [
    "Enroll in a rock climbing course suitable for your skill level.",
    "Use proper climbing gear and ensure all safety measures are in place.",
    "Explore various climbing routes, ranging from easy to challenging.",
    "Enjoy the natural surroundings of Nagarjun Forest Reserve.",
    "Spot wildlife such as birds and monkeys during breaks.",
    "Join group climbs to meet fellow climbing enthusiasts.",
    "Stay hydrated and carry snacks for energy during climbs.",
  ],
  mountain_biking_kathmandu_valley: [
    "Rent a mountain bike from a reputable shop in Thamel.",
    "Explore trails leading to Nagarkot for sunrise views.",
    "Ride through the ancient town of Kirtipur and visit its temples.",
    "Cycle to Godavari Botanical Garden for a nature retreat.",
    "Join guided biking tours to discover hidden trails and local villages.",
    "Ensure your bike is equipped with proper gear for hilly terrains.",
    "Wear appropriate safety equipment, including a helmet and gloves.",
  ],
  paragliding_godavari: [
    "Book a tandem paragliding flight with experienced instructors.",
    "Enjoy aerial views of the lush Godavari area and surrounding hills.",
    "Experience the thrill of soaring above the landscape like a bird.",
    "Capture your flight with in-air photographs or videos.",
    "Wear comfortable clothing and secure footwear for the flight.",
    "Check weather conditions in advance to ensure optimal flying conditions.",
    "Combine the experience with a visit to the Godavari Botanical Garden.",
  ],
  hiking_shivapuri_national_park: [
    "Start your hike from Budhanilkantha, visiting the temple of the Sleeping Vishnu.",
    "Follow trails leading to Nagi Gompa, a Buddhist monastery with serene surroundings.",
    "Reach the summit of Shivapuri Peak for stunning views of the Himalayas.",
    "Observe diverse wildlife, including various bird species and butterflies.",
    "Carry sufficient water and snacks, as there are limited facilities inside the park.",
    "Hire a local guide for detailed insights into the flora, fauna, and trails.",
    "Adhere to park regulations to preserve its natural beauty.",
  ],
  canyoningSundarijal: [
    "Join a canyoning expedition with a certified adventure company.",
    "Navigate through waterfalls, natural slides, and rock pools.",
    "Hike through the lush forests of Shivapuri National Park to reach the canyoning site.",
    "Learn and practice abseiling techniques under professional guidance.",
    "Experience the thrill of rappelling down cascading waterfalls.",
    "Enjoy swimming in natural pools formed within the canyon.",
    "Observe diverse flora and fauna native to the national park.",
    "Capture stunning photographs of the rugged canyon landscapes.",
    "Participate in cliff jumping under the supervision of experienced guides.",
    "Relish a packed lunch amidst the serene natural surroundings.",
    "Engage in team-building activities with fellow adventurers.",
    "Conclude the adventure with a short hike back, reflecting on the exhilarating experience.",
  ],
};

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
