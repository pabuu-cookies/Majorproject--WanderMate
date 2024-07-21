const rasaService = require('../services/rasaService');

async function sendMessage(req, res, next){
    const message  = req.body.message;
    console.log(message);
    const results = await rasaService.sendMessage(message);
    res.locals.responseData = results;
    next();
}

module.exports = {
    sendMessage,
}