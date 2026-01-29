const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Specific routes MUST come FIRST before /:id
router.get('/search', teacherController.searchTeachers);
router.get('/subject/:subjectId', teacherController.getTeachersBySubject);
router.get('/active', teacherController.getActiveTeachers);
router.get('/inactive', teacherController.getInactiveTeachers);

// General CRUD routes
router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;