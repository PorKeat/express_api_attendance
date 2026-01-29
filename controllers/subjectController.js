const Subject = require('../models/Subject');

const subjectController = {
  getAllSubjects: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const pagination = {};
      
      // Validate and apply pagination
      if (page && limit) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 1) {
          return res.status(400).json({
            success: false,
            error: 'page must be a positive number'
          });
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          return res.status(400).json({
            success: false,
            error: 'limit must be a number between 1 and 100'
          });
        }

        pagination.limit = limitNum;
        pagination.offset = (pageNum - 1) * limitNum;
      }

      const subjects = await Subject.findAll({}, pagination);
      const total = await Subject.count();

      res.status(200).json({
        success: true,
        count: subjects.length,
        total: total,
        page: page ? parseInt(page) : null,
        limit: limit ? parseInt(limit) : null,
        data: subjects
      });
    } catch (error) {
      console.error('Error getting subjects:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve subjects'
      });
    }
  },

  getSubjectById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid subject ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'subject ID must be a positive number'
        });
      }

      const subject = await Subject.findById(id);
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Error getting subject by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve subject'
      });
    }
  },

  createSubject: async (req, res, next) => {
    try {
      const { subject_name, subject_code, description } = req.body;

      // Validate required fields
      if (!subject_name || !subject_code) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: subject_name and subject_code are required'
        });
      }

      // Validate subject_name
      if (typeof subject_name !== 'string' || subject_name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'subject_name must be at least 2 characters long'
        });
      }

      if (subject_name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          error: 'subject_name must not exceed 100 characters'
        });
      }

      // Validate subject_code
      if (typeof subject_code !== 'string' || subject_code.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'subject_code must be at least 2 characters long'
        });
      }

      if (subject_code.trim().length > 20) {
        return res.status(400).json({
          success: false,
          error: 'subject_code must not exceed 20 characters'
        });
      }

      // Validate subject_code format (alphanumeric with optional hyphens/underscores)
      if (!/^[A-Za-z0-9_-]+$/.test(subject_code.trim())) {
        return res.status(400).json({
          success: false,
          error: 'subject_code can only contain letters, numbers, hyphens, and underscores'
        });
      }

      // Validate description length if provided
      if (description) {
        if (typeof description !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'description must be a string'
          });
        }
        if (description.trim().length > 500) {
          return res.status(400).json({
            success: false,
            error: 'description must not exceed 500 characters'
          });
        }
      }

      const newSubject = await Subject.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      
      // Handle duplicate entry errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subject'
      });
    }
  },

  updateSubject: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { subject_name, subject_code, description } = req.body;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid subject ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'subject ID must be a positive number'
        });
      }

      // Validate at least one field to update
      if (!subject_name && !subject_code && description === undefined) {
        return res.status(400).json({
          success: false,
          error: 'At least one field must be provided for update'
        });
      }

      // Validate subject_name if provided
      if (subject_name) {
        if (typeof subject_name !== 'string' || subject_name.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'subject_name must be at least 2 characters long'
          });
        }
        if (subject_name.trim().length > 100) {
          return res.status(400).json({
            success: false,
            error: 'subject_name must not exceed 100 characters'
          });
        }
      }

      // Validate subject_code if provided
      if (subject_code) {
        if (typeof subject_code !== 'string' || subject_code.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'subject_code must be at least 2 characters long'
          });
        }
        if (subject_code.trim().length > 20) {
          return res.status(400).json({
            success: false,
            error: 'subject_code must not exceed 20 characters'
          });
        }
        if (!/^[A-Za-z0-9_-]+$/.test(subject_code.trim())) {
          return res.status(400).json({
            success: false,
            error: 'subject_code can only contain letters, numbers, hyphens, and underscores'
          });
        }
      }

      // Validate description if provided
      if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'description must be a string'
          });
        }
        if (description.trim().length > 500) {
          return res.status(400).json({
            success: false,
            error: 'description must not exceed 500 characters'
          });
        }
      }

      const updatedSubject = await Subject.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: updatedSubject
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      
      // Handle subject not found
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      // Handle duplicate entry errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update subject'
      });
    }
  },

  deleteSubject: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid subject ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'subject ID must be a positive number'
        });
      }

      await Subject.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Cannot delete subject')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete subject'
      });
    }
  }
};

module.exports = subjectController;