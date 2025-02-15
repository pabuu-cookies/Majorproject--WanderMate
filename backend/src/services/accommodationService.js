const puppeteer = require("puppeteer");

class accommodationService {
  async getAccommodation(place) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      // Set the URL of the search results page
      const url = `https://www.booking.com/searchresults.en-gb.html?ss=${place}+&ssne=Parati-Mirim&ssne_untouched=Parati-Mirim&label=gen173nr-1BCAEoggI46AdIM1gEaKsBiAEBmAEJuAEXyAEM2AEB6AEBiAIBqAIDuAKrrby9BsACAdICJDI2OGNmYmJlLTBmNmEtNDQ5Ni1iNDY1LTZhYjAyYjQ5YWNkYtgCBeACAQ&sid=6e1f9b416c425a763b04bd0a5d01e5b8&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=index&group_adults=2&no_rooms=1&group_children=0`;

      // Navigate to the Booking.com URL
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

      // Wait for the page to load the necessary elements
      await page.waitForSelector('[data-testid="property-card"]', {
        timeout: 60000,
      });

      // Scrape hotel data
      const hotels = await page.evaluate(() => {
        const hotels = [];

        // Select each property card
        const propertyCards = document.querySelectorAll(
          '[data-testid="property-card"]'
        );

        propertyCards.forEach((card) => {
          const name = card.querySelector(".aab71f8e4e")
            ? card.querySelector(".aab71f8e4e").innerText
            : null;
          const address = card.querySelector(".aee5343fdb")
            ? card.querySelector(".aee5343fdb").innerText
            : null;
          const reviewScore = card.querySelector('[data-testid="review-score"]')
            ? card.querySelector('[data-testid="review-score"]').innerText
            : null;
          const reviewCount = card.querySelector(
            ".abf093bdfe.f45d8e4c32.d935416c47"
          )
            ? card.querySelector(".abf093bdfe.f45d8e4c32.d935416c47").innerText
            : null;
          const hotelLink = card.querySelector('a[data-testid="title-link"]')
            ? card.querySelector('a[data-testid="title-link"]').href
            : null;

          if (name && address && reviewScore && hotelLink) {
            hotels.push({
              name,
              address,
              reviewScore,
              reviewCount,
              hotelLink,
            });
          }
        });

        return hotels;
      });

      // Close the browser once scraping is done
      await browser.close();

      return hotels;
    } catch (error) {
      console.log("Error in getAccommodation:", error);
      throw error; // Re-throw the error for further handling in the controller
    }
  }
}

module.exports = new accommodationService();
