const Class = require('../models/Class');

const classController = {
  getAllClasses: async (req, res, next) => {
    try {
      const classes = await Class.findAll();
      res.status(200).json({
        success: true,
        count: classes.length,
        data: classes
      });
    } catch (error) {
      console.error('Error getting classes:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve classes'
      });
    }
  },

  getClassById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid class ID is required'
        });
      }

      const classInfo = await Class.findById(id);
      
      if (!classInfo) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      res.status(200).json({
        success: true,
        data: classInfo
      });
    } catch (error) {
      console.error('Error getting class by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve class'
      });
    }
  },

  createClass: async (req, res, next) => {
    try {
      const { class_name, grade_level, section, teacher_id, academic_year } = req.body;

      // Validate required fields
      if (!class_name || !grade_level || !academic_year) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: class_name, grade_level, and academic_year are required'
        });
      }

      // Validate class_name
      if (typeof class_name !== 'string' || class_name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'class_name must be at least 2 characters long'
        });
      }

      // Validate class_name length
      if (class_name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          error: 'class_name must not exceed 100 characters'
        });
      }

      // Validate grade_level
      if (typeof grade_level !== 'string' || grade_level.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'grade_level must be a non-empty string'
        });
      }

      // Validate grade_level format (optional: check if it's a valid grade)
      const validGradeLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
                                'Kindergarten', 'Pre-K', 'K', 'KG'];
      if (!validGradeLevels.includes(grade_level.trim())) {
        return res.status(400).json({
          success: false,
          error: `grade_level must be one of: ${validGradeLevels.join(', ')}`
        });
      }

      // Validate section if provided
      if (section) {
        if (typeof section !== 'string' || section.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'section must be a non-empty string'
          });
        }
        if (section.trim().length > 10) {
          return res.status(400).json({
            success: false,
            error: 'section must not exceed 10 characters'
          });
        }
      }

      // Validate teacher_id if provided
      if (teacher_id !== null && teacher_id !== undefined) {
        if (isNaN(teacher_id)) {
          return res.status(400).json({
            success: false,
            error: 'teacher_id must be a valid number'
          });
        }
        if (parseInt(teacher_id) <= 0) {
          return res.status(400).json({
            success: false,
            error: 'teacher_id must be a positive number'
          });
        }
      }

      // Validate academic_year format (e.g., "2025-2026")
      const academicYearRegex = /^\d{4}-\d{4}$/;
      if (!academicYearRegex.test(academic_year)) {
        return res.status(400).json({
          success: false,
          error: 'academic_year must be in format YYYY-YYYY (e.g., 2025-2026)'
        });
      }

      // Validate academic_year logic (second year should be first year + 1)
      const [startYear, endYear] = academic_year.split('-').map(Number);
      if (endYear !== startYear + 1) {
        return res.status(400).json({
          success: false,
          error: 'academic_year end year must be start year + 1 (e.g., 2025-2026)'
        });
      }

      // Validate academic_year is not too far in the past or future
      const currentYear = new Date().getFullYear();
      if (startYear < currentYear - 5 || startYear > currentYear + 5) {
        return res.status(400).json({
          success: false,
          error: 'academic_year must be within 5 years of current year'
        });
      }

      const newClass = await Class.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: newClass
      });
    } catch (error) {
      console.error('Error creating class:', error);
      
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
        error: error.message || 'Failed to create class'
      });
    }
  },

  updateClass: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { class_name, grade_level, section, teacher_id, academic_year } = req.body;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid class ID is required'
        });
      }

      // Validate at least one field to update
      if (!class_name && !grade_level && !section && 
          teacher_id === undefined && !academic_year) {
        return res.status(400).json({
          success: false,
          error: 'At least one field must be provided for update'
        });
      }

      // Validate class_name if provided
      if (class_name) {
        if (typeof class_name !== 'string' || class_name.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: 'class_name must be at least 2 characters long'
          });
        }
        if (class_name.trim().length > 100) {
          return res.status(400).json({
            success: false,
            error: 'class_name must not exceed 100 characters'
          });
        }
      }

      // Validate grade_level if provided
      if (grade_level) {
        if (typeof grade_level !== 'string' || grade_level.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'grade_level must be a non-empty string'
          });
        }
        const validGradeLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
                                  'Kindergarten', 'Pre-K', 'K', 'KG'];
        if (!validGradeLevels.includes(grade_level.trim())) {
          return res.status(400).json({
            success: false,
            error: `grade_level must be one of: ${validGradeLevels.join(', ')}`
          });
        }
      }

      // Validate section if provided
      if (section) {
        if (typeof section !== 'string' || section.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'section must be a non-empty string'
          });
        }
        if (section.trim().length > 10) {
          return res.status(400).json({
            success: false,
            error: 'section must not exceed 10 characters'
          });
        }
      }

      // Validate teacher_id if provided
      if (teacher_id !== undefined && teacher_id !== null) {
        if (isNaN(teacher_id)) {
          return res.status(400).json({
            success: false,
            error: 'teacher_id must be a valid number'
          });
        }
        if (parseInt(teacher_id) <= 0) {
          return res.status(400).json({
            success: false,
            error: 'teacher_id must be a positive number'
          });
        }
      }

      // Validate academic_year format if provided
      if (academic_year) {
        const academicYearRegex = /^\d{4}-\d{4}$/;
        if (!academicYearRegex.test(academic_year)) {
          return res.status(400).json({
            success: false,
            error: 'academic_year must be in format YYYY-YYYY (e.g., 2025-2026)'
          });
        }

        const [startYear, endYear] = academic_year.split('-').map(Number);
        if (endYear !== startYear + 1) {
          return res.status(400).json({
            success: false,
            error: 'academic_year end year must be start year + 1 (e.g., 2025-2026)'
          });
        }

        const currentYear = new Date().getFullYear();
        if (startYear < currentYear - 5 || startYear > currentYear + 5) {
          return res.status(400).json({
            success: false,
            error: 'academic_year must be within 5 years of current year'
          });
        }
      }

      const updatedClass = await Class.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Class updated successfully',
        data: updatedClass
      });
    } catch (error) {
      console.error('Error updating class:', error);
      
      // Handle class not found
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
        error: error.message || 'Failed to update class'
      });
    }
  },

  deleteClass: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid class ID is required'
        });
      }

      if (parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'class ID must be a positive number'
        });
      }

      await Class.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Cannot delete class')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete class'
      });
    }
  },

  getClassesByTeacher: async (req, res, next) => {
    try {
      const { teacherId } = req.params;

      // Validate teacherId
      if (!teacherId || isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          error: 'Valid teacher ID is required'
        });
      }

      if (parseInt(teacherId) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'teacher ID must be a positive number'
        });
      }

      const classes = await Class.findByTeacher(teacherId);
      
      res.status(200).json({
        success: true,
        count: classes.length,
        data: classes
      });
    } catch (error) {
      console.error('Error getting classes by teacher:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve classes by teacher'
      });
    }
  }
};

module.exports = classController;