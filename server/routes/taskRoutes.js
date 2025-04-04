// routes/taskRoutes.js
const express = require('express');
const {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');   
const { authorize } = require('../middleware/roleMiddleware'); 

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTask)       
  .get(getUserTasks);     

router.route('/:id')
  .get(getTaskById)     
  .put(updateTask)      
  .delete(deleteTask);  

module.exports = router;