const Student = require('../models/Student');

const studentController = {
  getAllStudents: async (req, res, next) => {
    try {
      const { page, limit, status } = req.query;
      const filters = {};
      if (status) {
        filters.status = status;
      }

      const pagination = {};
      if (page && limit) {
        pagination.limit = parseInt(limit, 10);
        pagination.offset = (parseInt(page, 10) - 1) * pagination.limit;
      }

      const students = await Student.findAll(filters, pagination);
      res.json(students);
    } catch (error) {
      next(error);
    }
  },

  getStudentById: async (req, res, next) => {
    try {
      const student = await Student.findById(req.params.id);
      if (student) {
        res.json(student);
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      next(error);
    }
  },

  createStudent: async (req, res, next) => {
    try {
      // Basic validation
      const { name, email, student_code } = req.body;
      if (!name || !email || !student_code) {
        return res.status(400).json({ message: 'Name, email, and student code are required' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const newStudent = await Student.create(req.body);
      res.status(201).json(newStudent);
    } catch (error) {
      next(error);
    }
  },

  updateStudent: async (req, res, next) => {
    try {
      const updatedStudent = await Student.update(req.params.id, req.body);
      res.json(updatedStudent);
    } catch (error) {
      next(error);
    }
  },

  deleteStudent: async (req, res, next) => {
    try {
      await Student.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  getStudentsByClass: async (req, res, next) => {
    try {
      const students = await Student.findByClass(req.params.classId);
      res.json(students);
    } catch (error) {
      next(error);
    }
  },

  searchStudents: async (req, res, next) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const students = await Student.search(q);
      res.json(students);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = studentController;
