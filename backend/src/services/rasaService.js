const axios =  require('axios');
require('dotenv').config();
const rasa_url = process.env.RASA_URL;

class rasaService{
    async sendMessage(message){
        try{
            console.log(process.env.RASA_URL);
            const results = await axios.post(rasa_url,{message});
            return results.data;
        }catch(error){
            console.log(error);
            throw(error);
        }
    }

    async getSuggestions(location) {
        try {
          const message = `What famous things do people do in ${location}?`;
          const results = await this.sendMessage(message);
          const suggestions = results?.text || [];
    
          if (suggestions.length === 0) {
            return { message: `Sorry, I couldn't find any suggestions for ${location}.` };
          }
    
          return { suggestions };
        } catch (error) {
          console.log(error);
          return { error: error.message };
        }
    }
}


module.exports = new rasaService();