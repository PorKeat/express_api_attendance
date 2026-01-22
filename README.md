# Attendance API Endpoints

This document outlines the API endpoints for the SV3 Attendance project. You can use tools like Postman to test these endpoints.

**Base URL:** `http://localhost:3000` (or your configured port)

---

## Endpoints

### 1. Attendance (`/api/attendance`)

| Method   | Endpoint                 | Description                    | Request Body (Example)                               |
| :------- | :----------------------- | :----------------------------- | :--------------------------------------------------- |
| `GET`    | `/api/attendance`        | Get all attendance records     | None                                                 |
| `GET`    | `/api/attendance/:id`    | Get attendance by ID           | None                                                 |
| `POST`   | `/api/attendance`        | Add a new attendance record    | `{ "student_id": 1, "class_id": 1, "date": "2024-01-22", "status": "present" }` |
| `PUT`    | `/api/attendance/:id`    | Update an attendance record    | `{ "status": "absent" }`                             |
| `DELETE` | `/api/attendance/:id`    | Delete an attendance record    | None                                                 |

### 2. Classes (`/api/classes`)

| Method   | Endpoint               | Description                 | Request Body (Example)                |
| :------- | :--------------------- | :-------------------------- | :------------------------------------ |
| `GET`    | `/api/classes`         | Get all classes             | None                                  |
| `GET`    | `/api/classes/:id`     | Get class by ID             | None                                  |
| `POST`   | `/api/classes`         | Add a new class             | `{ "name": "Mathematics A", "teacher_id": 1, "subject_id": 1 }` |
| `PUT`    | `/api/classes/:id`     | Update a class              | `{ "name": "Mathematics B" }`         |
| `DELETE` | `/api/classes/:id`     | Delete a class              | None                                  |

### 3. Students (`/api/students`)

| Method   | Endpoint                | Description                | Request Body (Example)             |
| :------- | :---------------------- | :------------------------- | :--------------------------------- |
| `GET`    | `/api/students`         | Get all students           | None                               |
| `GET`    | `/api/students/:id`     | Get student by ID          | None                               |
| `POST`   | `/api/students`         | Add a new student          | `{ "first_name": "John", "last_name": "Doe", "email": "john.doe@example.com" }` |
| `PUT`    | `/api/students/:id`     | Update a student           | `{ "email": "john.d@example.com" }`|
| `DELETE` | `/api/students/:id`     | Delete a student           | None                               |

### 4. Subjects (`/api/subjects`)

| Method   | Endpoint                | Description                 | Request Body (Example)      |
| :------- | :---------------------- | :-------------------------- | :-------------------------- |
| `GET`    | `/api/subjects`         | Get all subjects            | None                        |
| `GET`    | `/api/subjects/:id`     | Get subject by ID           | None                        |
| `POST`   | `/api/subjects`         | Add a new subject           | `{ "name": "History" }`     |
| `PUT`    | `/api/subjects/:id`     | Update a subject            | `{ "name": "Geography" }`   |
| `DELETE` | `/api/subjects/:id`     | Delete a subject            | None                        |

### 5. Teachers (`/api/teachers`)

| Method   | Endpoint                | Description                 | Request Body (Example)             |
| :------- | :---------------------- | :-------------------------- | :--------------------------------- |
| `GET`    | `/api/teachers`         | Get all teachers            | None                               |
| `GET`    | `/api/teachers/:id`     | Get teacher by ID           | None                               |
| `POST`   | `/api/teachers`         | Add a new teacher           | `{ "first_name": "Jane", "last_name": "Smith", "email": "jane.smith@example.com" }` |
| `PUT`    | `/api/teachers/:id`     | Update a teacher            | `{ "email": "jane.s@example.com" }`|
| `DELETE` | `/api/teachers/:id`     | Delete a teacher            | None                               |
