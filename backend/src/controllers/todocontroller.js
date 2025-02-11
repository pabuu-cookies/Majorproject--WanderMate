const TodoService = require("../services/todoService");

class todoController {
  async createTodo(req, res, next) {
    const { task } = req.body;
    const userId = req.userId;
    try {
      const newTodo = await TodoService.createTodo(userId, task);
      res.locals.responseData = newTodo;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
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
      res.locals.responseData = { error: error };
      next();
    }
  }

  async getTodosByUser(req, res, next) {
    const { userId } = req;
    try {
      const todos = await TodoService.getTodosByUser(userId);
      res.locals.responseData = todos;
      console.log(todos);
      next();
    } catch (error) {
      console.log("Error while fetching user tasks", error);
      res.locals.responseData = { error: error };
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
      res.locals.responseData = { error: error };
      next();
    }
  }

  async deleteTodoById(req, res, next) {
    const { todoId } = req.params;
    console.log(todoId);
    try {
      const deletedTodo = await TodoService.deleteTodoById(todoId);
      res.locals.responseData = deletedTodo;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      next();
    }
  }
}

module.exports = new todoController();
