module.exports = {
  up: async (connection) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_name VARCHAR(100) NOT NULL,
        subject_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await connection.query(sql);
  },
  down: async (connection) => {
    await connection.query('DROP TABLE IF EXISTS subjects');
  }
};
