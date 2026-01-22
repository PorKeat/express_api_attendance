const { executeQuery } = require('../config/db');

const Class = {
  findAll: async () => {
    const sql = `
      SELECT c.*, t.name as teacher_name, COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.id
    `;
    return await executeQuery(sql);
  },

  findById: async (id) => {
    const classSql = `
      SELECT c.*, t.name as teacher_name, sub.subject_name 
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects sub ON t.subject_id = sub.id
      WHERE c.id = ?
    `;
    const studentsSql = 'SELECT * FROM students WHERE class_id = ?';

    const [classInfo] = await executeQuery(classSql, [id]);
    if (!classInfo) return null;

    const students = await executeQuery(studentsSql, [id]);
    return { ...classInfo, students };
  },

  create: async (data) => {
    const { class_name, grade_level, section, teacher_id, academic_year } = data;
    const sql = 'INSERT INTO classes (class_name, grade_level, section, teacher_id, academic_year) VALUES (?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [class_name, grade_level, section, teacher_id, academic_year]);
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const { class_name, grade_level, section, teacher_id, academic_year } = data;
    const sql = 'UPDATE classes SET class_name = ?, grade_level = ?, section = ?, teacher_id = ?, academic_year = ? WHERE id = ?';
    await executeQuery(sql, [class_name, grade_level, section, teacher_id, academic_year, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    const sql = 'DELETE FROM classes WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id };
  },

  findByTeacher: async (teacherId) => {
    const sql = 'SELECT * FROM classes WHERE teacher_id = ?';
    return await executeQuery(sql, [teacherId]);
  }
};

module.exports = Class;
