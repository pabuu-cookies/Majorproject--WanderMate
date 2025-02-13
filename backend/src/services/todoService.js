const Todo = require("../models/todoModel");
const HttpMessage = require("../middlewares/HttpMessage");

class TodoService {
  async createTodo(userId, task) {
    try {
      const newTodo = new Todo({
        task,
        user: userId,
      });
      await newTodo.save();
      return newTodo;
    } catch (error) {
      throw error;
    }
  }

  async updateTodoStatus(todoId, status) {
    try {
      console.log(todoId, status);
      const validStatuses = ["pending", "in progress", "completed"];
      if (!validStatuses.includes(status)) {
        console.log("invalid status");
        throw HttpMessage.INVALID_STATUS;
      }
      const todo = await Todo.findById(todoId);
      if (!todo) {
        console.log("not found");
        throw HttpMessage.NOT_FOUND;
      }
      todo.status = status;
      todo.updatedAt = Date.now();
      await todo.save();
      return todo;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTodosByUser(userId) {
    try {
      const todos = await Todo.find({ user: userId });
      if (!todos || todos.length === 0) {
        throw HttpMessage.NOT_FOUND;
      }
      return todos;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTodoById(todoId) {
    try {
      const todo = await Todo.findById(todoId).populate("user");
      if (!todo) {
        throw HttpMessage.NOT_FOUND;
      }
      return todo;
    } catch (error) {
      throw error;
    }
  }

  async deleteTodoById(todoId) {
    try {
      const todo = await Todo.findByIdAndDelete(todoId);
      if (!todo) {
        throw HttpMessage.NOT_FOUND;
      }
      return todo;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TodoService();
