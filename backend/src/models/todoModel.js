const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,       
  },
  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed'],  
    default: 'pending' 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now  
  },
  updatedAt: {
    type: Date,
    default: Date.now 
  }
});

todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();  
  next();
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
