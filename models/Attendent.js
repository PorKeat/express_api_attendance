const { executeQuery } = require('../config/db');

const Attendent = {
  findAll: async (filters = {}) => {
    let sql = 'SELECT a.*, s.name as student_name, c.class_name FROM attendents a JOIN students s ON a.student_id = s.id JOIN classes c ON a.class_id = c.id';
    const params = [];
    
    const filterConditions = Object.entries(filters).map(([key, value]) => {
      params.push(value);
      return `a.${key} = ?`;
    });
    
    if (filterConditions.length) {
      sql += ' WHERE ' + filterConditions.join(' AND ');
    }
    
    return await executeQuery(sql, params);
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM attendents WHERE id = ?';
    const [attendent] = await executeQuery(sql, [id]);
    return attendent;
  },

  create: async (data) => {
    const { student_id, class_id, date, status, remarks = null } = data;
    
    // Validate student exists
    const studentCheck = await executeQuery('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!studentCheck || studentCheck.length === 0) {
      throw new Error(`Student with ID ${student_id} does not exist`);
    }
    
    // Validate class exists
    const classCheck = await executeQuery('SELECT id FROM classes WHERE id = ?', [class_id]);
    if (!classCheck || classCheck.length === 0) {
      throw new Error(`Class with ID ${class_id} does not exist`);
    }
    
    const sql = 'INSERT INTO attendents (student_id, class_id, date, status, remarks) VALUES (?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [student_id, class_id, date, status, remarks]);
    return { id: result.insertId, ...data };
  },

  createBulk: async (data) => {
    // Validate all students and classes exist before bulk insert
    const studentIds = [...new Set(data.map(item => item.student_id))];
    const classIds = [...new Set(data.map(item => item.class_id))];
    
    // Check students
    if (studentIds.length > 0) {
      const placeholders = studentIds.map(() => '?').join(',');
      const students = await executeQuery(`SELECT id FROM students WHERE id IN (${placeholders})`, studentIds);
      if (students.length !== studentIds.length) {
        const foundIds = students.map(s => s.id);
        const missingIds = studentIds.filter(id => !foundIds.includes(id));
        throw new Error(`Students with IDs ${missingIds.join(', ')} do not exist`);
      }
    }
    
    // Check classes
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(',');
      const classes = await executeQuery(`SELECT id FROM classes WHERE id IN (${placeholders})`, classIds);
      if (classes.length !== classIds.length) {
        const foundIds = classes.map(c => c.id);
        const missingIds = classIds.filter(id => !foundIds.includes(id));
        throw new Error(`Classes with IDs ${missingIds.join(', ')} do not exist`);
      }
    }
    
    const sql = 'INSERT INTO attendents (student_id, class_id, date, status, remarks) VALUES ?';
    const values = data.map(item => [
      item.student_id, 
      item.class_id, 
      item.date, 
      item.status, 
      (item.remarks || null)
    ]);
    const result = await executeQuery(sql, [values]);
    return result;
  },

  update: async (id, data) => {
    const { student_id, class_id, date, status, remarks = null } = data;
    
    // Validate student exists if provided
    if (student_id) {
      const studentCheck = await executeQuery('SELECT id FROM students WHERE id = ?', [student_id]);
      if (!studentCheck || studentCheck.length === 0) {
        throw new Error(`Student with ID ${student_id} does not exist`);
      }
    }
    
    // Validate class exists if provided
    if (class_id) {
      const classCheck = await executeQuery('SELECT id FROM classes WHERE id = ?', [class_id]);
      if (!classCheck || classCheck.length === 0) {
        throw new Error(`Class with ID ${class_id} does not exist`);
      }
    }
    
    const sql = 'UPDATE attendents SET student_id = ?, class_id = ?, date = ?, status = ?, remarks = ? WHERE id = ?';
    await executeQuery(sql, [student_id, class_id, date, status, remarks, id]);
    return { id, ...data };
  },

  delete: async (id) => {
    const sql = 'DELETE FROM attendents WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id };
  },

  getStudentHistory: async (studentId, from, to) => {
    let sql = 'SELECT * FROM attendents WHERE student_id = ?';
    const params = [studentId];
    
    if (from && to) {
      sql += ' AND date BETWEEN ? AND ?';
      params.push(from, to);
    }
    
    sql += ' ORDER BY date DESC';
    
    return await executeQuery(sql, params);
  },

  getStudentSummary: async (studentId, month, year) => {
    const sql = `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM attendents 
      WHERE student_id = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ? 
      GROUP BY status
    `;
    return await executeQuery(sql, [studentId, month, year]);
  },

  getClassAttendanceByDate: async (classId, date) => {
    const sql = `
      SELECT 
        a.*, 
        s.name as student_name 
      FROM attendents a 
      JOIN students s ON a.student_id = s.id 
      WHERE a.class_id = ? AND a.date = ?
      ORDER BY s.name
    `;
    return await executeQuery(sql, [classId, date]);
  },

  getClassReport: async (classId, month, year) => {
    const sql = `
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_days,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) AS excused_days
      FROM students s
      LEFT JOIN attendents a ON s.id = a.student_id 
        AND a.class_id = ? 
        AND MONTH(a.date) = ? 
        AND YEAR(a.date) = ?
      WHERE s.class_id = ?
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    return await executeQuery(sql, [classId, month, year, classId]);
  }
};

module.exports = Attendent;