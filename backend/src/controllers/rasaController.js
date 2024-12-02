const rasaService = require('../services/rasaService');

class rasaController{
    async sendMessage(req, res, next){
        const message  = req.body.message;
        console.log(message);
        const results = await rasaService.sendMessage(message);
        res.locals.responseData = results;
        next();
    }
    async getSuggestions(req, res, next) {
        const { location } = req.params;
    
        try {
          const result = await rasaService.getSuggestions(location);
          res.locals.responseData = result;
          next();
        } catch (error) {
          res.locals.responseData = { error: error.message };
          next();
        }
      }
}

module.exports = new rasaController();