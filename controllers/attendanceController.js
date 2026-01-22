const Attendent = require('../models/Attendent');

const attendanceController = {
  getAttendance: async (req, res, next) => {
    try {
      const { date, class_id, status } = req.query;
      const filters = {};
      if (date) filters.date = date;
      if (class_id) filters.class_id = class_id;
      if (status) filters.status = status;

      const attendance = await Attendent.findAll(filters);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  },

  getStudentAttendanceHistory: async (req, res, next) => {
    try {
      const { from, to } = req.query;
      const attendance = await Attendent.getStudentHistory(req.params.studentId, from, to);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  },

  getStudentAttendanceSummary: async (req, res, next) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }
      const summary = await Attendent.getStudentSummary(req.params.studentId, month, year);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },

  getClassAttendanceByDate: async (req, res, next) => {
    try {
      const attendance = await Attendent.getClassAttendanceByDate(req.params.classId, req.params.date);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  },

  markAttendance: async (req, res, next) => {
    try {
      const { student_id, class_id, date, status } = req.body;
      if (!student_id || !class_id || !date || !status) {
        return res.status(400).json({ message: 'student_id, class_id, date, and status are required' });
      }
      const newAttendance = await Attendent.create(req.body);
      res.status(201).json(newAttendance);
    } catch (error) {
      next(error);
    }
  },

  markBulkAttendance: async (req, res, next) => {
    try {
      const attendanceData = req.body;
      if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ message: 'Attendance data must be a non-empty array' });
      }
      const result = await Attendent.createBulk(attendanceData);
      res.status(201).json({ message: 'Attendance marked successfully', affectedRows: result.affectedRows });
    } catch (error) {
      next(error);
    }
  },

  updateAttendance: async (req, res, next) => {
    try {
      const updatedAttendance = await Attendent.update(req.params.id, req.body);
      res.json(updatedAttendance);
    } catch (error) {
      next(error);
    }
  },

  deleteAttendance: async (req, res, next) => {
    try {
      await Attendent.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  getClassAttendanceReport: async (req, res, next) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }
      const report = await Attendent.getClassReport(req.params.classId, month, year);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = attendanceController;
