const Student = require("../models/Student");

const studentController = {
  getAllStudents: async (req, res, next) => {
    try {
      const { page, limit, status, class_id } = req.query;
      const filters = {};

      // Validate and apply filters
      if (status) {
        const validStatuses = ["active", "inactive"];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(", ")}`,
          });
        }
        filters.status = status.toLowerCase();
      }

      if (class_id) {
        if (isNaN(class_id)) {
          return res.status(400).json({
            success: false,
            error: "class_id must be a valid number",
          });
        }
        filters.class_id = parseInt(class_id);
      }

      // Validate and apply pagination
      const pagination = {};
      if (page && limit) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 1) {
          return res.status(400).json({
            success: false,
            error: "page must be a positive number",
          });
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          return res.status(400).json({
            success: false,
            error: "limit must be a number between 1 and 100",
          });
        }

        pagination.limit = limitNum;
        pagination.offset = (pageNum - 1) * limitNum;
      }

      const students = await Student.findAll(filters, pagination);
      const total = await Student.count(filters);

      res.status(200).json({
        success: true,
        count: students.length,
        total: total,
        page: page ? parseInt(page) : null,
        limit: limit ? parseInt(limit) : null,
        data: students,
      });
    } catch (error) {
      console.error("Error getting students:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve students",
      });
    }
  },

  getStudentById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Valid student ID is required",
        });
      }

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student not found",
        });
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Error getting student by ID:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve student",
      });
    }
  },

  createStudent: async (req, res, next) => {
    try {
      const {
        name,
        email,
        phone,
        class_id,
        enrollment_date,
        date_of_birth,
        gender,
        address,
        guardian_name,
        guardian_phone,
        status,
        password,
      } = req.body;

      // Validate required fields (student_code removed)
      if (!name || !class_id || !enrollment_date) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: name, class_id, and enrollment_date are required",
        });
      }

      // Validate name
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: "name must be at least 2 characters long",
        });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            error: "Invalid email format",
          });
        }
      }

      // Validate phone format if provided
      if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }

      // Validate guardian_phone format if provided
      if (guardian_phone && !/^[\d\s\-+()]+$/.test(guardian_phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid guardian phone number format",
        });
      }

      // Validate class_id
      if (isNaN(class_id)) {
        return res.status(400).json({
          success: false,
          error: "class_id must be a valid number",
        });
      }

      // Validate enrollment_date format
      if (isNaN(Date.parse(enrollment_date))) {
        return res.status(400).json({
          success: false,
          error: "Invalid enrollment_date format. Use YYYY-MM-DD",
        });
      }

      // Validate date_of_birth format if provided
      if (date_of_birth && isNaN(Date.parse(date_of_birth))) {
        return res.status(400).json({
          success: false,
          error: "Invalid date_of_birth format. Use YYYY-MM-DD",
        });
      }

      // Validate date_of_birth is in the past
      if (date_of_birth && new Date(date_of_birth) > new Date()) {
        return res.status(400).json({
          success: false,
          error: "date_of_birth cannot be in the future",
        });
      }

      // Validate gender if provided
      if (gender) {
        const validGenders = ["male", "female", "other"];
        if (!validGenders.includes(gender.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `gender must be one of: ${validGenders.join(", ")}`,
          });
        }
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ["active", "inactive"];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `status must be one of: ${validStatuses.join(", ")}`,
          });
        }
      }

      const newStudent = await Student.create(req.body);

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: newStudent,
      });
    } catch (error) {
      console.error("Error creating student:", error);

      // Handle duplicate entry errors
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      // Handle foreign key constraint errors
      if (error.message.includes("does not exist")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to create student",
      });
    }
  },

  updateStudent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        student_code,
        name,
        email,
        phone,
        class_id,
        enrollment_date,
        date_of_birth,
        gender,
        address,
        guardian_name,
        guardian_phone,
        status,
      } = req.body;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Valid student ID is required",
        });
      }

      // Validate at least one field to update
      if (
        !student_code &&
        !name &&
        !email &&
        !phone &&
        !class_id &&
        !enrollment_date &&
        !date_of_birth &&
        !gender &&
        !address &&
        !guardian_name &&
        !guardian_phone &&
        !status
      ) {
        return res.status(400).json({
          success: false,
          error: "At least one field must be provided for update",
        });
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }

      // Validate phone format if provided
      if (phone && !/^[\d\s\-+()]+$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }

      // Validate guardian_phone format if provided
      if (guardian_phone && !/^[\d\s\-+()]+$/.test(guardian_phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid guardian phone number format",
        });
      }

      // Validate class_id if provided
      if (class_id && isNaN(class_id)) {
        return res.status(400).json({
          success: false,
          error: "class_id must be a valid number",
        });
      }

      // Validate enrollment_date if provided
      if (enrollment_date && isNaN(Date.parse(enrollment_date))) {
        return res.status(400).json({
          success: false,
          error: "Invalid enrollment_date format. Use YYYY-MM-DD",
        });
      }

      // Validate date_of_birth if provided
      if (date_of_birth) {
        if (isNaN(Date.parse(date_of_birth))) {
          return res.status(400).json({
            success: false,
            error: "Invalid date_of_birth format. Use YYYY-MM-DD",
          });
        }
        if (new Date(date_of_birth) > new Date()) {
          return res.status(400).json({
            success: false,
            error: "date_of_birth cannot be in the future",
          });
        }
      }

      // Validate gender if provided
      if (gender) {
        const validGenders = ["male", "female", "other"];
        if (!validGenders.includes(gender.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `gender must be one of: ${validGenders.join(", ")}`,
          });
        }
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ["active", "inactive"];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `status must be one of: ${validStatuses.join(", ")}`,
          });
        }
      }

      // Validate name if provided
      if (name && (typeof name !== "string" || name.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: "name must be at least 2 characters long",
        });
      }

      const updatedStudent = await Student.update(id, req.body);

      res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error("Error updating student:", error);

      // Handle student not found
      if (error.message.includes("does not exist")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      // Handle duplicate entry errors
      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to update student",
      });
    }
  },

  deleteStudent: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Valid student ID is required",
        });
      }

      const result = await Student.delete(id);

      res.status(200).json({
        success: true,
        message: "Student deleted successfully (marked as inactive)",
        data: result,
      });
    } catch (error) {
      console.error("Error deleting student:", error);

      if (error.message.includes("does not exist")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete student",
      });
    }
  },

  hardDeleteStudent: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Valid student ID is required",
        });
      }

      const result = await Student.hardDelete(id);

      res.status(200).json({
        success: true,
        message: "Student permanently deleted",
        data: result,
      });
    } catch (error) {
      console.error("Error hard deleting student:", error);

      if (error.message.includes("does not exist")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to permanently delete student",
      });
    }
  },

  getStudentsByClass: async (req, res, next) => {
    try {
      const { classId } = req.params;

      // Validate classId
      if (!classId || isNaN(classId)) {
        return res.status(400).json({
          success: false,
          error: "Valid class ID is required",
        });
      }

      const students = await Student.findByClass(classId);

      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error("Error getting students by class:", error);

      if (error.message.includes("does not exist")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve students by class",
      });
    }
  },

  searchStudents: async (req, res, next) => {
    try {
      const { q } = req.query;

      // Validate search query
      if (!q || typeof q !== "string" || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Search query (q) is required and must be a non-empty string",
        });
      }

      if (q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: "Search query must be at least 2 characters long",
        });
      }

      const students = await Student.search(q.trim());

      res.status(200).json({
        success: true,
        count: students.length,
        query: q.trim(),
        data: students,
      });
    } catch (error) {
      console.error("Error searching students:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to search students",
      });
    }
  },

  getActiveStudents: async (req, res, next) => {
    try {
      const students = await Student.getActiveStudents();

      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error("Error getting active students:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve active students",
      });
    }
  },

  getInactiveStudents: async (req, res, next) => {
    try {
      const students = await Student.getInactiveStudents();

      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error("Error getting inactive students:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve inactive students",
      });
    }
  },
};

module.exports = studentController;
