const express  = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const handleResponse = require('../middlewares/handleResponse');

router.post('/register', userController.registerUser, handleResponse);
router.post('/login', userController.loginUser, handleResponse);

module.exports = router;