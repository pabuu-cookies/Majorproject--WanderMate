const UserService =  require('../services/userService')

class userController{
    async registerUser(req, res, next){
        const {name, email, password} = req.body;
        try{
            const results = await UserService.registerUser(name, email, password);
            res.locals.responseData = results;
        next();
        }catch (error) {
            console.log(error);
            const responseError = {
              statusCode: error.statusCode || 500,
              message: error.message || "An unexpected error occurred",
          };
      
          res.locals.responseData = { error: responseError };
            next();
          }
    }
    
    async loginUser(req, res, next){
        const {email, password} = req.body;
        try{
            const results = await UserService.loginUser(email, password);
            res.locals.responseData = results;
            console.log(results );
            next();
        }catch (error) {
            console.log(error);
            const responseError = {
              statusCode: error.statusCode || 500,
              message: error.message || "An unexpected error occurred",
          };
      
          res.locals.responseData = { error: responseError };
            next();
          }
    }
}

module.exports = new userController();