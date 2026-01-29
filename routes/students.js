const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Specific routes MUST come FIRST before /:id
router.get('/search', studentController.searchStudents);
router.get('/active', studentController.getActiveStudents);
router.get('/inactive', studentController.getInactiveStudents);
router.get('/class/:classId', studentController.getStudentsByClass);

// General CRUD routes (/:id comes LAST)
router.get('/', studentController.getAllStudents);
router.post('/', studentController.createStudent);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.delete('/:id/hard', studentController.hardDeleteStudent);

module.exports = router;