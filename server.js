require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Assuming db.js handles the connection

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to SV3 Attendance API!');
});

// Import and use routes
const attendanceRoutes = require('./routes/attendance');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const teacherRoutes = require('./routes/teachers');

app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes);

// Database connection check
db.pool.getConnection()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit if database connection fails
  });
