const { executeQuery } = require('../config/db');

const Teacher = {
  findAll: async (filters = {}, pagination = {}) => {
    let sql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
    `;
    const params = [];

    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `t.${key} = ?`;
    });

    if (filterConditions.length) {
      sql += ' WHERE ' + filterConditions.join(' AND ');
    }

    // Add ORDER BY for consistent results
    sql += ' ORDER BY t.name ASC';
    
    if (pagination.limit) {
      if (pagination.offset) {
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(pagination.limit), parseInt(pagination.offset));
      } else {
        sql += ' LIMIT ?';
        params.push(parseInt(pagination.limit));
      }
    }

    return await executeQuery(sql, params);
  },

  findById: async (id) => {
    const teacherSql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `;
    const classesSql = 'SELECT * FROM classes WHERE teacher_id = ?';

    const [teacher] = await executeQuery(teacherSql, [id]);
    if (!teacher) return null;

    const classes = await executeQuery(classesSql, [id]);
    return { ...teacher, classes };
  },

  create: async (data) => {
    const { 
      name, 
      email, 
      phone = null, 
      subject_id, 
      hire_date, 
      status = 'active' 
    } = data;

    // Validate required fields
    if (!name || !email || !subject_id || !hire_date) {
      throw new Error('Missing required fields: name, email, subject_id, and hire_date are required');
    }

    // Trim whitespace
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? phone.trim() : null;

    // Validate subject exists
    const subjectCheck = await executeQuery('SELECT id FROM subjects WHERE id = ?', [subject_id]);
    if (!subjectCheck || subjectCheck.length === 0) {
      throw new Error(`Subject with ID ${subject_id} does not exist`);
    }

    // Check for duplicate email
    const duplicateEmailCheck = await executeQuery('SELECT id FROM teachers WHERE email = ?', [trimmedEmail]);
    if (duplicateEmailCheck && duplicateEmailCheck.length > 0) {
      throw new Error(`Email ${trimmedEmail} already exists`);
    }

    const sql = `
      INSERT INTO teachers (name, email, phone, subject_id, hire_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [trimmedName, trimmedEmail, trimmedPhone, subject_id, hire_date, status];
    
    const result = await executeQuery(sql, params);
    return { 
      id: result.insertId, 
      name: trimmedName, 
      email: trimmedEmail, 
      phone: trimmedPhone, 
      subject_id, 
      hire_date, 
      status 
    };
  },

  update: async (id, data) => {
    // Check if teacher exists
    const existingTeacher = await executeQuery('SELECT * FROM teachers WHERE id = ?', [id]);
    if (!existingTeacher || existingTeacher.length === 0) {
      throw new Error(`Teacher with ID ${id} does not exist`);
    }

    const currentTeacher = existingTeacher[0];

    // Use existing values if not provided in update
    const name = data.name !== undefined ? data.name.trim() : currentTeacher.name;
    const email = data.email !== undefined ? data.email.trim().toLowerCase() : currentTeacher.email;
    const phone = data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : currentTeacher.phone;
    const subject_id = data.subject_id !== undefined ? data.subject_id : currentTeacher.subject_id;
    const hire_date = data.hire_date !== undefined ? data.hire_date : currentTeacher.hire_date;
    const status = data.status !== undefined ? data.status : currentTeacher.status;

    // Validate subject if being updated
    if (subject_id !== currentTeacher.subject_id) {
      const subjectCheck = await executeQuery('SELECT id FROM subjects WHERE id = ?', [subject_id]);
      if (!subjectCheck || subjectCheck.length === 0) {
        throw new Error(`Subject with ID ${subject_id} does not exist`);
      }
    }

    // Check for duplicate email (excluding current teacher)
    if (email !== currentTeacher.email) {
      const duplicateEmailCheck = await executeQuery(
        'SELECT id FROM teachers WHERE email = ? AND id != ?',
        [email, id]
      );
      if (duplicateEmailCheck && duplicateEmailCheck.length > 0) {
        throw new Error(`Email ${email} already exists`);
      }
    }

    const sql = `
      UPDATE teachers 
      SET name = ?, email = ?, phone = ?, subject_id = ?, hire_date = ?, status = ? 
      WHERE id = ?
    `;
    
    await executeQuery(sql, [name, email, phone, subject_id, hire_date, status, id]);
    return { id, name, email, phone, subject_id, hire_date, status };
  },

  delete: async (id) => {
    // Check if teacher exists
    const existingTeacher = await executeQuery('SELECT id, name FROM teachers WHERE id = ?', [id]);
    if (!existingTeacher || existingTeacher.length === 0) {
      throw new Error(`Teacher with ID ${id} does not exist`);
    }

    // Check if teacher is assigned to any classes
    const classesCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?',
      [id]
    );
    if (classesCheck[0].count > 0) {
      throw new Error(`Cannot delete teacher '${existingTeacher[0].name}' because they are assigned to ${classesCheck[0].count} class(es). Please reassign or remove classes first`);
    }

    const sql = 'DELETE FROM teachers WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id, message: 'Teacher deleted successfully' };
  },

  findBySubject: async (subjectId) => {
    // Validate subject exists
    const subjectCheck = await executeQuery('SELECT id, subject_name FROM subjects WHERE id = ?', [subjectId]);
    if (!subjectCheck || subjectCheck.length === 0) {
      throw new Error(`Subject with ID ${subjectId} does not exist`);
    }

    const sql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.subject_id = ?
      ORDER BY t.name ASC
    `;
    return await executeQuery(sql, [subjectId]);
  },

  search: async (query) => {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const sql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.name LIKE ? OR t.email LIKE ? OR s.subject_name LIKE ?
      ORDER BY t.name ASC
    `;
    const searchParam = `%${query}%`;
    const params = [searchParam, searchParam, searchParam];
    return await executeQuery(sql, params);
  },

  getActiveTeachers: async () => {
    const sql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.status = ?
      ORDER BY t.name ASC
    `;
    return await executeQuery(sql, ['active']);
  },

  getInactiveTeachers: async () => {
    const sql = `
      SELECT t.*, s.subject_name, s.subject_code
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.status = ?
      ORDER BY t.name ASC
    `;
    return await executeQuery(sql, ['inactive']);
  },

  count: async (filters = {}) => {
    let sql = 'SELECT COUNT(*) as total FROM teachers t';
    const params = [];

    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `t.${key} = ?`;
    });

    if (filterConditions.length) {
      sql += ' WHERE ' + filterConditions.join(' AND ');
    }

    const [result] = await executeQuery(sql, params);
    return result.total;
  }
};

module.exports = Teacher;