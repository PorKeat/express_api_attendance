const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAttendance);
router.post('/bulk', attendanceController.markBulkAttendance);
router.post('/', attendanceController.markAttendance);
router.get('/student/:studentId', attendanceController.getStudentAttendanceHistory);
router.get('/student/:studentId/summary', attendanceController.getStudentAttendanceSummary);
router.get('/class/:classId/date/:date', attendanceController.getClassAttendanceByDate);
router.get('/report/class/:classId', attendanceController.getClassAttendanceReport);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);


module.exports = router;
