const axios =  require('axios');
require('dotenv').config();
const rasa_url = process.env.RASA_URL;

async function sendMessage(message){
    try{
        console.log(process.env.RASA_URL);
        const results = await axios.post(rasa_url,{message});
        return results.data;
    }catch(error){
        return(error);
    }
}

module.exports = {
    sendMessage,
}