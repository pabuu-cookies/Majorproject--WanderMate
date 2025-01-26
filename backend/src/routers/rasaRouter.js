const express  = require('express');
const router = express.Router();
const rasaController = require('../controllers/rasaController');
const handleResponse = require('../middlewares/handleResponse');
const authenticateToken = require('../middlewares/isAuthenticated');

router.post('/query', authenticateToken, rasaController.sendMessage, handleResponse);
router.post('/suggestions/:location', authenticateToken , rasaController.getSuggestions, handleResponse);

module.exports = router;