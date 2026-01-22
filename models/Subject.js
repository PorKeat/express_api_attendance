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

    if (pagination.limit && pagination.offset) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    return await executeQuery(sql, params);
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM subjects WHERE id = ?';
    const [subject] = await executeQuery(sql, [id]);
    return subject;
  },

  create: async (data) => {
    const { subject_name, subject_code, description } = data;
    const sql = 'INSERT INTO subjects (subject_name, subject_code, description) VALUES (?, ?, ?)';
    const result = await executeQuery(sql, [subject_name, subject_code, description]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const { subject_name, subject_code, description } = data;
    const sql = 'UPDATE subjects SET subject_name = ?, subject_code = ?, description = ? WHERE id = ?';
    await executeQuery(sql, [subject_name, subject_code, description, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    const sql = 'DELETE FROM subjects WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id };
  }
};

module.exports = Subject;
