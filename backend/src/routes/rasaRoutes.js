const express  = require('express');
const router = express.Router();
const rasaController = require('../controllers/rasaController');
const handleResponse = require('../middlewares/handleResponse');

router.post('/query', rasaController.sendMessage, handleResponse);

module.exports = router;