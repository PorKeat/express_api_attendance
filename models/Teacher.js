const { executeQuery } = require('../config/db');

const Teacher = {
  findAll: async (filters = {}, pagination = {}) => {
    let sql = 'SELECT * FROM teachers';
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
    const sql = 'SELECT * FROM teachers WHERE id = ?';
    const [teacher] = await executeQuery(sql, [id]);
    return teacher;
  },

  create: async (data) => {
    const { name, email, phone, subject_id, hire_date, status } = data;
    const sql = 'INSERT INTO teachers (name, email, phone, subject_id, hire_date, status) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [name, email, phone, subject_id, hire_date, status]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const { name, email, phone, subject_id, hire_date, status } = data;
    const sql = 'UPDATE teachers SET name = ?, email = ?, phone = ?, subject_id = ?, hire_date = ?, status = ? WHERE id = ?';
    await executeQuery(sql, [name, email, phone, subject_id, hire_date, status, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    const sql = 'DELETE FROM teachers WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id };
  },

  findBySubject: async (subjectId) => {
    const sql = 'SELECT * FROM teachers WHERE subject_id = ?';
    return await executeQuery(sql, [subjectId]);
  }
};

module.exports = Teacher;
