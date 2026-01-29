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
      
      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error) {
      console.error('Error getting attendance:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve attendance records'
      });
    }
  },

  getStudentAttendanceHistory: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { from, to } = req.query;

      // Validate studentId
      if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid student ID is required'
        });
      }

      // Validate date range if provided
      if ((from && !to) || (!from && to)) {
        return res.status(400).json({
          success: false,
          error: 'Both from and to dates are required for date range filtering'
        });
      }

      if (from && to && new Date(from) > new Date(to)) {
        return res.status(400).json({
          success: false,
          error: 'From date cannot be after to date'
        });
      }

      const attendance = await Attendent.getStudentHistory(studentId, from, to);
      
      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error) {
      console.error('Error getting student attendance history:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve student attendance history'
      });
    }
  },

  getStudentAttendanceSummary: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { month, year } = req.query;

      // Validate studentId
      if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid student ID is required'
        });
      }

      // Validate month and year
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          error: 'Month and year are required'
        });
      }

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: 'Month must be a number between 1 and 12'
        });
      }

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({
          success: false,
          error: 'Year must be a valid number between 2000 and 2100'
        });
      }

      const summary = await Attendent.getStudentSummary(studentId, monthNum, yearNum);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting student attendance summary:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve attendance summary'
      });
    }
  },

  getClassAttendanceByDate: async (req, res, next) => {
    try {
      const { classId, date } = req.params;

      // Validate classId
      if (!classId || isNaN(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid class ID is required'
        });
      }

      // Validate date format
      if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({
          success: false,
          error: 'Valid date is required (format: YYYY-MM-DD)'
        });
      }

      const attendance = await Attendent.getClassAttendanceByDate(classId, date);
      
      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error) {
      console.error('Error getting class attendance by date:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve class attendance'
      });
    }
  },

  markAttendance: async (req, res, next) => {
    try {
      const { student_id, class_id, date, status, remarks } = req.body;

      // Validate required fields
      if (!student_id || !class_id || !date || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: student_id, class_id, date, and status are required'
        });
      }

      // Validate data types
      if (isNaN(student_id)) {
        return res.status(400).json({
          success: false,
          error: 'student_id must be a valid number'
        });
      }

      if (isNaN(class_id)) {
        return res.status(400).json({
          success: false,
          error: 'class_id must be a valid number'
        });
      }

      // Validate date format
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const newAttendance = await Attendent.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: newAttendance
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      
      // Handle foreign key constraint errors
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message.includes('does not exist')) {
        return res.status(400).json({
          success: false,
          error: error.message || 'Invalid student_id or class_id. The referenced student or class does not exist.'
        });
      }
      
      // Handle duplicate entry errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'Attendance record already exists for this student, class, and date'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark attendance'
      });
    }
  },

  markBulkAttendance: async (req, res, next) => {
    try {
      const attendanceData = req.body;

      // Validate array
      if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Attendance data must be a non-empty array'
        });
      }

      // Validate each record
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      const errors = [];

      attendanceData.forEach((record, index) => {
        if (!record.student_id || !record.class_id || !record.date || !record.status) {
          errors.push(`Record ${index + 1}: Missing required fields`);
        }
        if (record.student_id && isNaN(record.student_id)) {
          errors.push(`Record ${index + 1}: student_id must be a number`);
        }
        if (record.class_id && isNaN(record.class_id)) {
          errors.push(`Record ${index + 1}: class_id must be a number`);
        }
        if (record.date && isNaN(Date.parse(record.date))) {
          errors.push(`Record ${index + 1}: Invalid date format`);
        }
        if (record.status && !validStatuses.includes(record.status.toLowerCase())) {
          errors.push(`Record ${index + 1}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }

      const result = await Attendent.createBulk(attendanceData);
      
      res.status(201).json({
        success: true,
        message: 'Bulk attendance marked successfully',
        affectedRows: result.affectedRows
      });
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      
      if (error.message.includes('do not exist')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark bulk attendance'
      });
    }
  },

  updateAttendance: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { student_id, class_id, date, status, remarks } = req.body;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid attendance ID is required'
        });
      }

      // Validate at least one field to update
      if (!student_id && !class_id && !date && !status && remarks === undefined) {
        return res.status(400).json({
          success: false,
          error: 'At least one field must be provided for update'
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['present', 'absent', 'late', 'excused'];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`
          });
        }
      }

      // Validate date if provided
      if (date && isNaN(Date.parse(date))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      // Check if record exists
      const existing = await Attendent.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Attendance record not found'
        });
      }

      const updatedAttendance = await Attendent.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: updatedAttendance
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update attendance'
      });
    }
  },

  deleteAttendance: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid attendance ID is required'
        });
      }

      // Check if record exists
      const existing = await Attendent.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Attendance record not found'
        });
      }

      await Attendent.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Attendance deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete attendance'
      });
    }
  },

  getClassAttendanceReport: async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      // Validate classId
      if (!classId || isNaN(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid class ID is required'
        });
      }

      // Validate month and year
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          error: 'Month and year are required'
        });
      }

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: 'Month must be a number between 1 and 12'
        });
      }

      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({
          success: false,
          error: 'Year must be a valid number between 2000 and 2100'
        });
      }

      const report = await Attendent.getClassReport(classId, monthNum, yearNum);
      
      res.status(200).json({
        success: true,
        count: report.length,
        data: report
      });
    } catch (error) {
      console.error('Error getting class attendance report:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve class attendance report'
      });
    }
  }
};

module.exports = attendanceController;