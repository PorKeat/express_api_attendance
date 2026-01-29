const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Specific routes MUST come FIRST
router.get('/teacher/:teacherId', classController.getClassesByTeacher);

// General CRUD routes
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;