// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Requires login)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, category } = req.body;


  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  const task = new Task({
    user: req.user._id, 
    title,
    description: description || '', 
    dueDate, 
    priority: priority || 'medium', 
    category: category || 'General', 
    isCompleted: false,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});


// @desc    Get tasks for the logged-in user with filtering, sorting, pagination
// @route   GET /api/tasks
// @access  Private (Requires login)
const getUserTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, priority, category, sortBy, search, page = 1, limit = 10 } = req.query;

    const query = { user: userId };

    if (status === 'completed') query.isCompleted = true;
    if (status === 'pending') query.isCompleted = false;
    if (priority) query.priority = priority;
    if (category) query.category = { $regex: category, $options: 'i' };

    
    if (search) {
        query.$or = [ 
            { title: { $regex: search, $options: 'i' } }, 
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    let sortOptions = {};
    if (sortBy) {
        const [field, order] = sortBy.split(':');
        sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions = { createdAt: -1 }; 
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const tasks = await Task.find(query)
                          .sort(sortOptions)
                          .skip(skip)
                          .limit(limitNumber);

    const totalTasks = await Task.countDocuments(query);


    res.status(200).json({
        tasks,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTasks / limitNumber),
        totalTasks,
        count: tasks.length 
    });
});


// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private (Requires login)
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401); 
      throw new Error('Not authorized to access this task');
  }


  res.status(200).json(task);
});


// @desc    Update a task
// @route   PUT /api/tasks/:id (or PATCH)
// @access  Private (Requires login)
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update this task');
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.dueDate = req.body.dueDate ?? task.dueDate;
    task.priority = req.body.priority ?? task.priority;
    task.category = req.body.category ?? task.category;
    task.isCompleted = req.body.isCompleted ?? task.isCompleted;


    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
});


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Requires login)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

   if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401); 
      throw new Error('Not authorized to delete this task');
  }

  await Task.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: 'Task removed successfully', _id: req.params.id }); 
});


module.exports = {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
};