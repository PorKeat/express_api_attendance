const { executeQuery } = require('../config/db');

const Class = {
  findAll: async () => {
    const sql = `
      SELECT c.*, t.name as teacher_name, COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.id, c.class_name, c.grade_level, c.section, c.teacher_id, c.academic_year, t.name
      ORDER BY c.grade_level ASC, c.section ASC
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
    const studentsSql = 'SELECT * FROM students WHERE class_id = ? ORDER BY name ASC';

    const [classInfo] = await executeQuery(classSql, [id]);
    if (!classInfo) return null;

    const students = await executeQuery(studentsSql, [id]);
    return { ...classInfo, students };
  },

  create: async (data) => {
    const { class_name, grade_level, section = null, teacher_id = null, academic_year } = data;

    // Validate required fields
    if (!class_name || !grade_level || !academic_year) {
      throw new Error('Missing required fields: class_name, grade_level, and academic_year are required');
    }

    // Trim whitespace
    const trimmedClassName = class_name.trim();
    const trimmedGradeLevel = grade_level.trim();
    const trimmedSection = section ? section.trim() : null;

    // Validate teacher exists if provided
    if (teacher_id) {
      const teacherCheck = await executeQuery('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
      if (!teacherCheck || teacherCheck.length === 0) {
        throw new Error(`Teacher with ID ${teacher_id} does not exist`);
      }

      // Check if teacher is already assigned to another class in the same academic year
      const teacherClassCheck = await executeQuery(
        'SELECT id, class_name FROM classes WHERE teacher_id = ? AND academic_year = ?',
        [teacher_id, academic_year]
      );
      if (teacherClassCheck && teacherClassCheck.length > 0) {
        throw new Error(`Teacher with ID ${teacher_id} is already assigned to class '${teacherClassCheck[0].class_name}' for academic year ${academic_year}`);
      }
    }

    // Check for duplicate class name in the same academic year
    const duplicateCheck = await executeQuery(
      'SELECT id FROM classes WHERE class_name = ? AND academic_year = ?',
      [trimmedClassName, academic_year]
    );
    if (duplicateCheck && duplicateCheck.length > 0) {
      throw new Error(`Class '${trimmedClassName}' already exists for academic year ${academic_year}`);
    }

    // Check for duplicate grade_level + section combination in the same academic year
    if (trimmedSection) {
      const gradeSectionCheck = await executeQuery(
        'SELECT id, class_name FROM classes WHERE grade_level = ? AND section = ? AND academic_year = ?',
        [trimmedGradeLevel, trimmedSection, academic_year]
      );
      if (gradeSectionCheck && gradeSectionCheck.length > 0) {
        throw new Error(`Grade ${trimmedGradeLevel} Section ${trimmedSection} already exists for academic year ${academic_year}`);
      }
    }

    const sql = 'INSERT INTO classes (class_name, grade_level, section, teacher_id, academic_year) VALUES (?, ?, ?, ?, ?)';
    const result = await executeQuery(sql, [trimmedClassName, trimmedGradeLevel, trimmedSection, teacher_id, academic_year]);
    return { id: result.insertId, class_name: trimmedClassName, grade_level: trimmedGradeLevel, section: trimmedSection, teacher_id, academic_year };
  },

  update: async (id, data) => {
    // Check if class exists
    const existingClass = await executeQuery('SELECT * FROM classes WHERE id = ?', [id]);
    if (!existingClass || existingClass.length === 0) {
      throw new Error(`Class with ID ${id} does not exist`);
    }

    const currentClass = existingClass[0];
    
    // Use existing values if not provided in update
    const class_name = data.class_name !== undefined ? data.class_name.trim() : currentClass.class_name;
    const grade_level = data.grade_level !== undefined ? data.grade_level.trim() : currentClass.grade_level;
    const section = data.section !== undefined ? (data.section ? data.section.trim() : null) : currentClass.section;
    const teacher_id = data.teacher_id !== undefined ? data.teacher_id : currentClass.teacher_id;
    const academic_year = data.academic_year !== undefined ? data.academic_year : currentClass.academic_year;

    // Validate teacher exists if being updated
    if (teacher_id !== null && teacher_id !== currentClass.teacher_id) {
      const teacherCheck = await executeQuery('SELECT id FROM teachers WHERE id = ?', [teacher_id]);
      if (!teacherCheck || teacherCheck.length === 0) {
        throw new Error(`Teacher with ID ${teacher_id} does not exist`);
      }

      // Check if teacher is already assigned to another class in the same academic year
      const teacherClassCheck = await executeQuery(
        'SELECT id, class_name FROM classes WHERE teacher_id = ? AND academic_year = ? AND id != ?',
        [teacher_id, academic_year, id]
      );
      if (teacherClassCheck && teacherClassCheck.length > 0) {
        throw new Error(`Teacher with ID ${teacher_id} is already assigned to class '${teacherClassCheck[0].class_name}' for academic year ${academic_year}`);
      }
    }

    // Check for duplicate class name (excluding current class)
    if (class_name !== currentClass.class_name || academic_year !== currentClass.academic_year) {
      const duplicateCheck = await executeQuery(
        'SELECT id FROM classes WHERE class_name = ? AND academic_year = ? AND id != ?',
        [class_name, academic_year, id]
      );
      if (duplicateCheck && duplicateCheck.length > 0) {
        throw new Error(`Class '${class_name}' already exists for academic year ${academic_year}`);
      }
    }

    // Check for duplicate grade_level + section combination (excluding current class)
    if (section && (grade_level !== currentClass.grade_level || section !== currentClass.section || academic_year !== currentClass.academic_year)) {
      const gradeSectionCheck = await executeQuery(
        'SELECT id, class_name FROM classes WHERE grade_level = ? AND section = ? AND academic_year = ? AND id != ?',
        [grade_level, section, academic_year, id]
      );
      if (gradeSectionCheck && gradeSectionCheck.length > 0) {
        throw new Error(`Grade ${grade_level} Section ${section} already exists for academic year ${academic_year}`);
      }
    }

    const sql = 'UPDATE classes SET class_name = ?, grade_level = ?, section = ?, teacher_id = ?, academic_year = ? WHERE id = ?';
    await executeQuery(sql, [class_name, grade_level, section, teacher_id, academic_year, id]);
    return { id, class_name, grade_level, section, teacher_id, academic_year };
  },

  delete: async (id) => {
    // Check if class exists
    const existingClass = await executeQuery('SELECT id, class_name FROM classes WHERE id = ?', [id]);
    if (!existingClass || existingClass.length === 0) {
      throw new Error(`Class with ID ${id} does not exist`);
    }

    // Check if class has students
    const studentsCheck = await executeQuery('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [id]);
    if (studentsCheck[0].count > 0) {
      throw new Error(`Cannot delete class '${existingClass[0].class_name}' because it has ${studentsCheck[0].count} enrolled student(s). Please reassign or remove students first`);
    }

    const sql = 'DELETE FROM classes WHERE id = ?';
    await executeQuery(sql, [id]);
    return { id, message: 'Class deleted successfully' };
  },

  findByTeacher: async (teacherId) => {
    // Validate teacher exists
    const teacherCheck = await executeQuery('SELECT id, name FROM teachers WHERE id = ?', [teacherId]);
    if (!teacherCheck || teacherCheck.length === 0) {
      throw new Error(`Teacher with ID ${teacherId} does not exist`);
    }

    const sql = `
      SELECT c.*, COUNT(s.id) as student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      WHERE c.teacher_id = ?
      GROUP BY c.id, c.class_name, c.grade_level, c.section, c.teacher_id, c.academic_year
      ORDER BY c.academic_year DESC, c.grade_level ASC, c.section ASC
    `;
    return await executeQuery(sql, [teacherId]);
  }
};

module.exports = Class;