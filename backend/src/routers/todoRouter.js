const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authenticateToken = require('../middlewares/isAuthenticated');
const handleResponse = require('../middlewares/handleResponse');

router.post('', authenticateToken , todoController.createTodo, handleResponse );

router.patch('/status/:todoId', authenticateToken,  todoController.updateTodoStatus, handleResponse);

router.get('/user/', authenticateToken,  todoController.getTodosByUser, handleResponse);

router.get('/:todoId',authenticateToken, todoController.getTodoById, handleResponse);

router.delete('/:todoId', authenticateToken , todoController.deleteTodoById , handleResponse);

module.exports = router;
