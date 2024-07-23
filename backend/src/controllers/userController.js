const UserService =  require('../services/userService')

class userController{
    async registerUser(req, res, next){
        const {name, email, password} = req.body;
        try{
            const results = await UserService.registerUser(name, email, password);
            res.locals.responseData = results;
        next();
        }catch(error){
            res.locals.responseData = { error: error }; 
            next();
        }
    }
    
    async loginUser(req, res, next){
        const {email, password} = req.body;
        try{
            const results = await UserService.loginUser(email, password);
            res.locals.responseData = results;
            console.log(results );
            res.cookie('userId', results.id, {
                httpOnly: true,
                secure: true, 
                sameSite: 'lax' 
            });
            next();
        }catch(error){
            res.locals.responseData = { error: error };
            console.log(error);
            next();
        }
    }
}

module.exports = new userController();