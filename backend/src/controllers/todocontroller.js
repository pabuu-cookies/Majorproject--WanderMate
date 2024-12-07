const TodoService = require('../services/todoService');

class todoController {
  async createTodo(req, res, next) {
    const {task} = req.body;
    const userId = req.userId ;
    try {
      const newTodo = await TodoService.createTodo(userId, task);
      res.locals.responseData = newTodo;
      next();
    } catch (error) {
      console.log(error);
      const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
    };

    res.locals.responseData = { error: responseError };
      next();
    }
  }

  async updateTodoStatus(req, res, next) {
    const { status } = req.body;
    const todoId = req.params.todoId;
    try {
      const updatedTodo = await TodoService.updateTodoStatus(todoId, status);
      res.locals.responseData = updatedTodo;
      next();
    } catch (error) {
      console.log(error);
      const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
    };

    res.locals.responseData = { error: responseError };
      next();
    }
  }

  async getTodosByUser(req, res, next) {
    const { userId } = req ;
    try {
      const todos = await TodoService.getTodosByUser(userId);
      res.locals.responseData = todos;
      next();
    } catch (error) {
      console.log(error, JSON.stringify(error.message , null, 2));
      const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
    };

    res.locals.responseData = { error: responseError };
      next();
    }
  }

  async getTodoById(req, res, next) {
    const { todoId } = req.params;
    try {
      const todo = await TodoService.getTodoById(todoId);
      res.locals.responseData = todo;
      next();
    } catch (error) {
      console.log(error);
      const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
    };

    res.locals.responseData = { error: responseError };
      next();
    }
  }

  async deleteTodoById(req, res, next) {
    const { todoId } = req.params;
    try {
      const deletedTodo = await TodoService.deleteTodoById(todoId);
      res.locals.responseData = deletedTodo;
      next();
    } catch (error) {
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

module.exports = new todoController();
