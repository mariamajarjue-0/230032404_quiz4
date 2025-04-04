// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User', 
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true, 
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  category: {
    type: String,
    trim: true,
    default: 'General', 
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true 
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;