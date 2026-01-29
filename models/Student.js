const { executeQuery } = require("../config/db");

const Student = {
  findAll: async (filters = {}, pagination = {}) => {
    let sql =
      "SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id";
    const params = [];

    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `s.${key} = ?`;
    });

    if (filterConditions.length) {
      sql += " WHERE " + filterConditions.join(" AND ");
    }

    // Add ORDER BY for consistent results
    sql += " ORDER BY s.id ASC";

    if (pagination.limit) {
      if (pagination.offset) {
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(pagination.limit), parseInt(pagination.offset));
      } else {
        sql += " LIMIT ?";
        params.push(parseInt(pagination.limit));
      }
    }

    return await executeQuery(sql, params);
  },

  findById: async (id) => {
    const studentSql =
      "SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?";
    const attendanceSql =
      "SELECT * FROM attendents WHERE student_id = ? ORDER BY date DESC";

    const [student] = await executeQuery(studentSql, [id]);
    if (!student) return null;

    const attendance = await executeQuery(attendanceSql, [id]);
    return { ...student, attendance };
  },

  create: async (data) => {
    const {
      name,
      email = null,
      phone = null,
      class_id,
      enrollment_date,
      date_of_birth = null,
      gender = null,
      address = null,
      guardian_name = null,
      guardian_phone = null,
      status = "active",
      password = null,
    } = data;

    // Validate required fields (student_code removed)
    if (!name || !class_id || !enrollment_date) {
      throw new Error(
        "Missing required fields: name, class_id, and enrollment_date are required",
      );
    }

    // Validate class exists
    const classCheck = await executeQuery(
      "SELECT id FROM classes WHERE id = ?",
      [class_id],
    );
    if (!classCheck || classCheck.length === 0) {
      throw new Error(`Class with ID ${class_id} does not exist`);
    }

    // Generate unique student code
    let student_code;
    let isUnique = false;

    while (!isUnique) {
      // Generate student code (e.g., STU2026001, STU2026002, etc.)
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0");
      student_code = `STU${year}${randomNum}`;

      // Check if this code already exists
      const duplicateCheck = await executeQuery(
        "SELECT id FROM students WHERE student_code = ?",
        [student_code],
      );
      if (!duplicateCheck || duplicateCheck.length === 0) {
        isUnique = true;
      }
    }

    // Check for duplicate email if provided
    if (email) {
      const emailCheck = await executeQuery(
        "SELECT id FROM students WHERE email = ?",
        [email],
      );
      if (emailCheck && emailCheck.length > 0) {
        throw new Error(`Email ${email} already exists`);
      }
    }

    const sql = `
    INSERT INTO students (
      student_code, name, email, phone, class_id, enrollment_date, 
      date_of_birth, gender, address, guardian_name, guardian_phone, status, password
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const params = [
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
      password,
    ];

    const result = await executeQuery(sql, params);
    return { id: result.insertId, student_code, ...data };
  },

  update: async (id, data) => {
    // Check if student exists
    const existingStudent = await executeQuery(
      "SELECT * FROM students WHERE id = ?",
      [id],
    );
    if (!existingStudent || existingStudent.length === 0) {
      throw new Error(`Student with ID ${id} does not exist`);
    }

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
    } = data;

    // Validate class if being updated
    if (class_id) {
      const classCheck = await executeQuery(
        "SELECT id FROM classes WHERE id = ?",
        [class_id],
      );
      if (!classCheck || classCheck.length === 0) {
        throw new Error(`Class with ID ${class_id} does not exist`);
      }
    }

    // Check for duplicate student_code (excluding current student)
    if (student_code) {
      const duplicateCheck = await executeQuery(
        "SELECT id FROM students WHERE student_code = ? AND id != ?",
        [student_code, id],
      );
      if (duplicateCheck && duplicateCheck.length > 0) {
        throw new Error(`Student code ${student_code} already exists`);
      }
    }

    // Check for duplicate email (excluding current student)
    if (email) {
      const emailCheck = await executeQuery(
        "SELECT id FROM students WHERE email = ? AND id != ?",
        [email, id],
      );
      if (emailCheck && emailCheck.length > 0) {
        throw new Error(`Email ${email} already exists`);
      }
    }

    const sql = `
      UPDATE students SET 
        student_code = ?, 
        name = ?, 
        email = ?, 
        phone = ?, 
        class_id = ?, 
        enrollment_date = ?, 
        date_of_birth = ?, 
        gender = ?, 
        address = ?, 
        guardian_name = ?, 
        guardian_phone = ?, 
        status = ? 
      WHERE id = ?
    `;

    const params = [
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
      id,
    ];

    await executeQuery(sql, params);
    return { id, ...data };
  },

  delete: async (id) => {
    // Check if student exists
    const existingStudent = await executeQuery(
      "SELECT id FROM students WHERE id = ?",
      [id],
    );
    if (!existingStudent || existingStudent.length === 0) {
      throw new Error(`Student with ID ${id} does not exist`);
    }

    // Soft delete - set status to inactive
    const sql = "UPDATE students SET status = ? WHERE id = ?";
    await executeQuery(sql, ["inactive", id]);
    return { id, message: "Student marked as inactive" };
  },

  hardDelete: async (id) => {
    // Check if student exists
    const existingStudent = await executeQuery(
      "SELECT id FROM students WHERE id = ?",
      [id],
    );
    if (!existingStudent || existingStudent.length === 0) {
      throw new Error(`Student with ID ${id} does not exist`);
    }

    // Hard delete - permanently remove from database
    const sql = "DELETE FROM students WHERE id = ?";
    await executeQuery(sql, [id]);
    return { id, message: "Student permanently deleted" };
  },

  findByClass: async (classId) => {
    // Validate class exists
    const classCheck = await executeQuery(
      "SELECT id FROM classes WHERE id = ?",
      [classId],
    );
    if (!classCheck || classCheck.length === 0) {
      throw new Error(`Class with ID ${classId} does not exist`);
    }

    const sql =
      "SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.class_id = ? ORDER BY s.name ASC";
    return await executeQuery(sql, [classId]);
  },

  search: async (query) => {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    const sql = `
      SELECT s.*, c.class_name 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id 
      WHERE s.name LIKE ? OR s.student_code LIKE ? OR s.email LIKE ?
      ORDER BY s.name ASC
    `;
    const searchParam = `%${query}%`;
    const params = [searchParam, searchParam, searchParam];
    return await executeQuery(sql, params);
  },

  getActiveStudents: async () => {
    const sql = `
      SELECT s.*, c.class_name 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id 
      WHERE s.status = ?
      ORDER BY s.name ASC
    `;
    return await executeQuery(sql, ["active"]);
  },

  getInactiveStudents: async () => {
    const sql = `
      SELECT s.*, c.class_name 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id 
      WHERE s.status = ?
      ORDER BY s.name ASC
    `;
    return await executeQuery(sql, ["inactive"]);
  },

  count: async (filters = {}) => {
    let sql = "SELECT COUNT(*) as total FROM students s";
    const params = [];

    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `s.${key} = ?`;
    });

    if (filterConditions.length) {
      sql += " WHERE " + filterConditions.join(" AND ");
    }

    const [result] = await executeQuery(sql, params);
    return result.total;
  },
};

module.exports = Student;
