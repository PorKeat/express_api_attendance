const Teacher = require('../models/Teacher');

const teacherController = {
  getAllTeachers: async (req, res, next) => {
    try {
      const { page, limit, status, subject_id } = req.query;
      const filters = {};
      
      // Validate and apply filters
      if (status) {
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`
          });
        }
        filters.status = status.toLowerCase();
      }

      if (subject_id) {
        if (isNaN(subject_id)) {
          return res.status(400).json({
            success: false,
            error: 'subject_id must be a valid number'
          });
        }
        filters.subject_id = parseInt(subject_id);
      }

      // Validate and apply pagination
      const pagination = {};
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

      const teachers = await Teacher.findAll(filters, pagination);
      const total = await Teacher.count(filters);

      res.status(200).json({
        success: true,
        count: teachers.length,
        total: total,
        page: page ? parseInt(page) : null,
        limit: limit ? parseInt(limit) : null,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting teachers:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve teachers'
      });
    }
  },

  getTeacherById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid teacher ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'teacher ID must be a positive number'
        });
      }

      const teacher = await Teacher.findById(id);
      
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      res.status(200).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('Error getting teacher by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve teacher'
      });
    }
  },

  searchTeachers: async (req, res, next) => {
    try {
      const { q } = req.query;

      // Validate search query
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query (q) is required and must be a non-empty string'
        });
      }

      if (q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters long'
        });
      }

      const teachers = await Teacher.search(q.trim());
      
      res.status(200).json({
        success: true,
        count: teachers.length,
        query: q.trim(),
        data: teachers
      });
    } catch (error) {
      console.error('Error searching teachers:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search teachers'
      });
    }
  },

  getActiveTeachers: async (req, res, next) => {
    try {
      const teachers = await Teacher.getActiveTeachers();
      
      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting active teachers:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve active teachers'
      });
    }
  },

  getInactiveTeachers: async (req, res, next) => {
    try {
      const teachers = await Teacher.getInactiveTeachers();
      
      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting inactive teachers:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve inactive teachers'
      });
    }
  },

  createTeacher: async (req, res, next) => {
    try {
      const { name, email, phone, subject_id, hire_date, status } = req.body;

      // Validate required fields
      if (!name || !email || !subject_id || !hire_date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email, subject_id, and hire_date are required'
        });
      }

      // Validate name
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'name must be at least 2 characters long'
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          error: 'name must not exceed 100 characters'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate phone format if provided
      if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }

      // Validate subject_id
      if (isNaN(subject_id)) {
        return res.status(400).json({
          success: false,
          error: 'subject_id must be a valid number'
        });
      }

      if (parseInt(subject_id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'subject_id must be a positive number'
        });
      }

      // Validate hire_date format
      if (isNaN(Date.parse(hire_date))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hire_date format. Use YYYY-MM-DD'
        });
      }

      // Validate hire_date is not in the future
      if (new Date(hire_date) > new Date()) {
        return res.status(400).json({
          success: false,
          error: 'hire_date cannot be in the future'
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `status must be one of: ${validStatuses.join(', ')}`
          });
        }
      }

      const newTeacher = await Teacher.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: newTeacher
      });
    } catch (error) {
      console.error('Error creating teacher:', error);
      
      // Handle duplicate entry errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      // Handle foreign key constraint errors
      if (error.message.includes('does not exist')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create teacher'
      });
    }
  },

  updateTeacher: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, subject_id, hire_date, status } = req.body;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid teacher ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'teacher ID must be a positive number'
        });
      }

      // Validate at least one field to update
      if (!name && !email && !phone && !subject_id && !hire_date && !status) {
        return res.status(400).json({
          success: false,
          error: 'At least one field must be provided for update'
        });
      }

      // Validate name if provided
      if (name) {
        if (typeof name !== 'string' || name.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'name must be at least 2 characters long'
          });
        }
        if (name.trim().length > 100) {
          return res.status(400).json({
            success: false,
            error: 'name must not exceed 100 characters'
          });
        }
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate phone format if provided
      if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }

      // Validate subject_id if provided
      if (subject_id) {
        if (isNaN(subject_id)) {
          return res.status(400).json({
            success: false,
            error: 'subject_id must be a valid number'
          });
        }
        if (parseInt(subject_id) <= 0) {
          return res.status(400).json({
            success: false,
            error: 'subject_id must be a positive number'
          });
        }
      }

      // Validate hire_date if provided
      if (hire_date) {
        if (isNaN(Date.parse(hire_date))) {
          return res.status(400).json({
            success: false,
            error: 'Invalid hire_date format. Use YYYY-MM-DD'
          });
        }
        if (new Date(hire_date) > new Date()) {
          return res.status(400).json({
            success: false,
            error: 'hire_date cannot be in the future'
          });
        }
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `status must be one of: ${validStatuses.join(', ')}`
          });
        }
      }

      const updatedTeacher = await Teacher.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Teacher updated successfully',
        data: updatedTeacher
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      
      // Handle teacher not found
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
        error: error.message || 'Failed to update teacher'
      });
    }
  },

  deleteTeacher: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid teacher ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'teacher ID must be a positive number'
        });
      }

      await Teacher.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Cannot delete teacher')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete teacher'
      });
    }
  },

  getTeachersBySubject: async (req, res, next) => {
    try {
      const { subjectId } = req.params;

      // Validate subjectId
      if (!subjectId || isNaN(subjectId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid subject ID is required'
        });
      }

      if (parseInt(subjectId) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'subject ID must be a positive number'
        });
      }

      const teachers = await Teacher.findBySubject(subjectId);
      
      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting teachers by subject:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve teachers by subject'
      });
    }
  }
};

module.exports = teacherController;