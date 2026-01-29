const { executeQuery } = require('../config/db');

const Subject = {
  findAll: async (filters = {}, pagination = {}) => {
    let sql = 'SELECT * FROM subjects';
    const params = [];

    if (Object.keys(filters).length) {
      sql += ' WHERE ';
      const filterConditions = Object.entries(filters).map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      sql += filterConditions.join(' AND ');
    }

    // Add ORDER BY for consistent results
    sql += ' ORDER BY subject_name ASC';

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
    const sql = 'SELECT * FROM subjects WHERE id = ?';
    const [subject] = await executeQuery(sql, [id]);
    return subject || null;
  },

  create: async (data) => {
    const { subject_name, subject_code, description = null } = data;

    // Validate required fields
    if (!subject_name || !subject_code) {
      throw new Error('Missing required fields: subject_name and subject_code are required');
    }

    // Trim whitespace
    const trimmedSubjectName = subject_name.trim();
    const trimmedSubjectCode = subject_code.trim().toUpperCase(); // Normalize to uppercase
    const trimmedDescription = description ? description.trim() : null;

    // Check for duplicate subject_name
    const duplicateNameCheck = await executeQuery(
      'SELECT id FROM subjects WHERE subject_name = ?',
      [trimmedSubjectName]
    );
    if (duplicateNameCheck && duplicateNameCheck.length > 0) {
      throw new Error(`Subject name '${trimmedSubjectName}' already exists`);
    }

    // Check for duplicate subject_code
    const duplicateCodeCheck = await executeQuery(
      'SELECT id FROM subjects WHERE subject_code = ?',
      [trimmedSubjectCode]
    );
    if (duplicateCodeCheck && duplicateCodeCheck.length > 0) {
      throw new Error(`Subject code '${trimmedSubjectCode}' already exists`);
    }

    const sql = 'INSERT INTO subjects (subject_name, subject_code, description) VALUES (?, ?, ?)';
    const result = await executeQuery(sql, [trimmedSubjectName, trimmedSubjectCode, trimmedDescription]);
    
    return { 
      id: result.insertId, 
      subject_name: trimmedSubjectName, 
      subject_code: trimmedSubjectCode, 
      description: trimmedDescription 
    };
  },

  update: async (id, data) => {
    // Check if subject exists
    const existingSubject = await executeQuery('SELECT * FROM subjects WHERE id = ?', [id]);
    if (!existingSubject || existingSubject.length === 0) {
      throw new Error(`Subject with ID ${id} does not exist`);
    }

    const currentSubject = existingSubject[0];

    // Use existing values if not provided in update
    const subject_name = data.subject_name !== undefined 
      ? data.subject_name.trim() 
      : currentSubject.subject_name;
    const subject_code = data.subject_code !== undefined 
      ? data.subject_code.trim().toUpperCase() 
      : currentSubject.subject_code;
    const description = data.description !== undefined 
      ? (data.description ? data.description.trim() : null) 
      : currentSubject.description;

    // Check for duplicate subject_name (excluding current subject)
    if (subject_name !== currentSubject.subject_name) {
      const duplicateNameCheck = await executeQuery(
        'SELECT id FROM subjects WHERE subject_name = ? AND id != ?',
        [subject_name, id]
      );
      if (duplicateNameCheck && duplicateNameCheck.length > 0) {
        throw new Error(`Subject name '${subject_name}' already exists`);
      }
    }

    // Check for duplicate subject_code (excluding current subject)
    if (subject_code !== currentSubject.subject_code) {
      const duplicateCodeCheck = await executeQuery(
        'SELECT id FROM subjects WHERE subject_code = ? AND id != ?',
        [subject_code, id]
      );
      if (duplicateCodeCheck && duplicateCodeCheck.length > 0) {
        throw new Error(`Subject code '${subject_code}' already exists`);
      }
    }

    const sql = 'UPDATE subjects SET subject_name = ?, subject_code = ?, description = ? WHERE id = ?';
    await executeQuery(sql, [subject_name, subject_code, description, id]);
    
    return { id, subject_name, subject_code, description };
  },

  delete: async (id) => {
    // Check if subject exists
    const existingSubject = await executeQuery('SELECT id, subject_name FROM subjects WHERE id = ?', [id]);
    if (!existingSubject || existingSubject.length === 0) {
      throw new Error(`Subject with ID ${id} does not exist`);
    }

    // Check if subject is assigned to any teachers
    const teachersCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM teachers WHERE subject_id = ?',
      [id]
    );
    if (teachersCheck[0].count > 0) {
      throw new Error(`Cannot delete subject '${existingSubject[0].subject_name}' because it is assigned to ${teachersCheck[0].count} teacher(s). Please reassign or remove teachers first`);
    }

    const sql = 'DELETE FROM subjects WHERE id = ?';
    await executeQuery(sql, [id]);
    
    return { id, message: 'Subject deleted successfully' };
  },

  count: async (filters = {}) => {
    let sql = 'SELECT COUNT(*) as total FROM subjects';
    const params = [];

    if (Object.keys(filters).length) {
      sql += ' WHERE ';
      const filterConditions = Object.entries(filters).map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      sql += filterConditions.join(' AND ');
    }

    const [result] = await executeQuery(sql, params);
    return result.total;
  }
};

module.exports = Subject;