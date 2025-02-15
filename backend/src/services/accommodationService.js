const puppeteer = require("puppeteer");

class AccommodationService {
  async getAccommodation(place) {
    try {
      console.time("Scraping Time");

      const browser = await puppeteer.launch({
        headless: false, // Change to 'true' to run in the background
        args: ["--disable-blink-features=AutomationControlled"], // Helps bypass detection
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Constructing the search URL dynamically
      const url = `https://www.booking.com/searchresults.en-gb.html?ss=${encodeURIComponent(
        place
      )}&group_adults=2&no_rooms=1&group_children=0`;

      console.log("Navigating to the URL...");
      await page.goto(url, { timeout: 60000 });

      console.log("Waiting for property cards to load...");
      try {
        await page.waitForSelector('[data-testid="property-card"]', {
          timeout: 60000,
        });
      } catch (error) {
        console.error("❌ Property cards did not load in time. Exiting...");
        await browser.close();
        return;
      }

      console.log("Starting data scraping...");
      const hotels = await page.evaluate(() => {
        const hotels = [];
        const propertyCards = document.querySelectorAll(
          '[data-testid="property-card"]'
        );

        propertyCards.forEach((card) => {
          const name = card.querySelector(".aab71f8e4e")?.innerText || "N/A";
          const address = card.querySelector(".aee5343fdb")?.innerText || "N/A";
          const reviewScore =
            card.querySelector('[data-testid="review-score"]')?.innerText ||
            "N/A";
          const reviewCount =
            card.querySelector(".abf093bdfe.f45d8e4c32.d935416c47")
              ?.innerText || "N/A";
          const hotelLink =
            card.querySelector('a[data-testid="title-link"]')?.href || "N/A";

          hotels.push({ name, address, reviewScore, reviewCount, hotelLink });
        });

        return hotels;
      });

      console.log("✅ Data scraping completed. Results:", hotels);

      await browser.close();
      console.timeEnd("Scraping Time");

      return hotels;
    } catch (error) {
      console.log("Error in getAccommodation:", error);
      throw error;
    }
  }
}

module.exports = new AccommodationService();
