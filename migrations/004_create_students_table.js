module.exports = {
  up: async (connection) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_code VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        class_id INT,
        enrollment_date DATE,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        guardian_name VARCHAR(100),
        guardian_phone VARCHAR(20),
        status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await connection.query(sql);
  },
  down: async (connection) => {
    await connection.query('DROP TABLE IF EXISTS students');
  }
};
