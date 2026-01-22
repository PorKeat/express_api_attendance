const Class = require('../models/Class');

const classController = {
  getAllClasses: async (req, res, next) => {
    try {
      const classes = await Class.findAll();
      res.json(classes);
    } catch (error) {
      next(error);
    }
  },

  getClassById: async (req, res, next) => {
    try {
      const classInfo = await Class.findById(req.params.id);
      if (classInfo) {
        res.json(classInfo);
      } else {
        res.status(404).json({ message: 'Class not found' });
      }
    } catch (error) {
      next(error);
    }
  },

  createClass: async (req, res, next) => {
    try {
      // Basic validation
      const { class_name } = req.body;
      if (!class_name) {
        return res.status(400).json({ message: 'Class name is required' });
      }
      const newClass = await Class.create(req.body);
      res.status(201).json(newClass);
    } catch (error) {
      next(error);
    }
  },

  updateClass: async (req, res, next) => {
    try {
      const updatedClass = await Class.update(req.params.id, req.body);
      res.json(updatedClass);
    } catch (error) {
      next(error);
    }
  },

  deleteClass: async (req, res, next) => {
    try {
      await Class.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  getClassesByTeacher: async (req, res, next) => {
    try {
      const classes = await Class.findByTeacher(req.params.teacherId);
      res.json(classes);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = classController;
