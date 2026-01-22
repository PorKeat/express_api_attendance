const { executeQuery } = require('../config/db');

const Student = {
  findAll: async (filters = {}, pagination = {}) => {
    let sql = 'SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id';
    const params = [];

    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `s.${key} = ?`;
    });

    if (filterConditions.length) {
      sql += ' WHERE ' + filterConditions.join(' AND ');
    }
    
    if(pagination.limit) {
        if (pagination.offset) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(pagination.limit, pagination.offset);
        } else {
            sql += ' LIMIT ?';
            params.push(pagination.limit);
        }
    }

    return await executeQuery(sql, params);
  },

  findById: async (id) => {
    const studentSql = 'SELECT s.*, c.class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.id = ?';
    const attendanceSql = 'SELECT * FROM attendents WHERE student_id = ?';

    const [student] = await executeQuery(studentSql, [id]);
    if (!student) return null;

    const attendance = await executeQuery(attendanceSql, [id]);
    return { ...student, attendance };
  },

  create: async (data) => {
    const {
      student_code, name, email, phone, class_id, enrollment_date, date_of_birth,
      gender, address, guardian_name, guardian_phone, status
    } = data;
    const sql = `
      INSERT INTO students (student_code, name, email, phone, class_id, enrollment_date, date_of_birth, gender, address, guardian_name, guardian_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      student_code, name, email, phone, class_id, enrollment_date, date_of_birth,
      gender, address, guardian_name, guardian_phone, status
    ];
    const result = await executeQuery(sql, params);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const {
      student_code, name, email, phone, class_id, enrollment_date, date_of_birth,
      gender, address, guardian_name, guardian_phone, status
    } = data;
    const sql = `
      UPDATE students SET student_code = ?, name = ?, email = ?, phone = ?, class_id = ?, 
      enrollment_date = ?, date_of_birth = ?, gender = ?, address = ?, guardian_name = ?, 
      guardian_phone = ?, status = ? WHERE id = ?
    `;
    const params = [
      student_code, name, email, phone, class_id, enrollment_date, date_of_birth,
      gender, address, guardian_name, guardian_phone, status, id
    ];
    await executeQuery(sql, params);
    return { id, ...data };
  },

  delete: async (id) => {
    const sql = 'UPDATE students SET status = "inactive" WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id };
  },

  findByClass: async (classId) => {
    const sql = 'SELECT * FROM students WHERE class_id = ?';
    return await executeQuery(sql, [classId]);
  },

  search: async (query) => {
    const sql = 'SELECT * FROM students WHERE name LIKE ? OR student_code LIKE ?';
    const params = [`%${query}%`, `%${query}%`];
    return await executeQuery(sql, params);
  }
};

module.exports = Student;
