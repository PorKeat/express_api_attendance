const Subject = require('../models/Subject');

const subjectController = {
  getAllSubjects: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const pagination = {};
      if (page && limit) {
        pagination.limit = parseInt(limit, 10);
        pagination.offset = (parseInt(page, 10) - 1) * pagination.limit;
      }
      const subjects = await Subject.findAll({}, pagination);
      res.json(subjects);
    } catch (error) {
      next(error);
    }
  },

  getSubjectById: async (req, res, next) => {
    try {
      const subject = await Subject.findById(req.params.id);
      if (subject) {
        res.json(subject);
      } else {
        res.status(404).json({ message: 'Subject not found' });
      }
    } catch (error) {
      next(error);
    }
  },

  createSubject: async (req, res, next) => {
    try {
      // Basic validation
      const { subject_name, subject_code } = req.body;
      if (!subject_name || !subject_code) {
        return res.status(400).json({ message: 'Subject name and code are required' });
      }

      const newSubject = await Subject.create(req.body);
      res.status(201).json(newSubject);
    } catch (error) {
      next(error);
    }
  },

  updateSubject: async (req, res, next) => {
    try {
      const updatedSubject = await Subject.update(req.params.id, req.body);
      res.json(updatedSubject);
    } catch (error) {
      next(error);
    }
  },

  deleteSubject: async (req, res, next) => {
    try {
      await Subject.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = subjectController;
