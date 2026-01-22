const Teacher = require('../models/Teacher');

const teacherController = {
  getAllTeachers: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const pagination = {};
      if (page && limit) {
        pagination.limit = parseInt(limit, 10);
        pagination.offset = (parseInt(page, 10) - 1) * pagination.limit;
      }
      const teachers = await Teacher.findAll({}, pagination);
      res.json(teachers);
    } catch (error) {
      next(error);
    }
  },

  getTeacherById: async (req, res, next) => {
    try {
      const teacher = await Teacher.findById(req.params.id);
      if (teacher) {
        res.json(teacher);
      } else {
        res.status(404).json({ message: 'Teacher not found' });
      }
    } catch (error) {
      next(error);
    }
  },

  createTeacher: async (req, res, next) => {
    try {
      // Basic validation
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const newTeacher = await Teacher.create(req.body);
      res.status(201).json(newTeacher);
    } catch (error) {
      next(error);
    }
  },

  updateTeacher: async (req, res, next) => {
    try {
      const updatedTeacher = await Teacher.update(req.params.id, req.body);
      res.json(updatedTeacher);
    } catch (error) {
      next(error);
    }
  },

  deleteTeacher: async (req, res, next) => {
    try {
      await Teacher.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  getTeachersBySubject: async (req, res, next) => {
    try {
      const teachers = await Teacher.findBySubject(req.params.subjectId);
      res.json(teachers);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = teacherController;
