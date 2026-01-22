module.exports = {
  up: async (connection) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_name VARCHAR(50) NOT NULL,
        grade_level VARCHAR(20),
        section VARCHAR(10),
        teacher_id INT,
        academic_year VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await connection.query(sql);
  },
  down: async (connection) => {
    await connection.query('DROP TABLE IF EXISTS classes');
  }
};
