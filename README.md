# SV3 Attendance API

This is the backend API for the SV3 Attendance application. It provides endpoints for managing students, teachers, classes, subjects, and attendance records.

## Features

-   CRUD operations for Students, Teachers, Classes, and Subjects.
-   Marking and tracking student attendance.
-   Retrieving attendance reports by student or class.
-   Searching for students and teachers.

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MySQL

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/sv3-attendance.git
    cd express_api_attendance
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root of the project and add the following environment variables:

    ```
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=sv3_attendance
    DB_PORT=3306
    DB_CONNECTION_LIMIT=10
    ```

### Database Migration

To set up the database schema, run the following command:

```bash
npm run migrate
```

This will create the necessary tables in your database.

To rollback migrations, you can use:

```bash
npm run migrate:down
```

To refresh all migrations (drop all tables and re-run all migrations):

```bash
npm run migrate:fresh
```

### Running the Application

To start the server, run the following command:

```bash
npm start
```

For development, you can use `nodemon` to automatically restart the server on file changes:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

The base URL for all endpoints is `/api`.

### Attendance (`/attendance`)

| Method   | Endpoint                               | Description                       |
| :------- | :------------------------------------- | :-------------------------------- |
| `GET`    | `/`                                    | Get all attendance records        |
| `POST`   | `/`                                    | Mark a single attendance record   |
| `POST`   | `/bulk`                                | Mark bulk attendance for a class  |
| `GET`    | `/student/:studentId`                  | Get attendance history for a student |
| `GET`    | `/student/:studentId/summary`          | Get attendance summary for a student |
| `GET`    | `/class/:classId/date/:date`           | Get class attendance by date      |
| `GET`    | `/report/class/:classId`               | Get a class attendance report     |
| `PUT`    | `/:id`                                 | Update an attendance record       |
| `DELETE` | `/:id`                                 | Delete an attendance record       |

### Classes (`/classes`)

| Method   | Endpoint              | Description               |
| :------- | :-------------------- | :------------------------ |
| `GET`    | `/`                   | Get all classes           |
| `GET`    | `/:id`                | Get a single class by ID  |
| `POST`   | `/`                   | Create a new class        |
| `PUT`    | `/:id`                | Update a class            |
| `DELETE` | `/:id`                | Delete a class            |
| `GET`    | `/teacher/:teacherId` | Get all classes for a teacher |

### Students (`/students`)

| Method   | Endpoint          | Description                 |
| :------- | :---------------- | :-------------------------- |
| `GET`    | `/`               | Get all students            |
| `GET`    | `/:id`            | Get a single student by ID  |
| `POST`   | `/`               | Create a new student        |
| `PUT`    | `/:id`            | Update a student            |
| `DELETE` | `/:id`            | Soft delete a student       |
| `DELETE` | `/:id/hard`       | Hard delete a student       |
| `GET`    | `/search`         | Search for students         |
| `GET`    | `/active`         | Get all active students     |
| `GET`    | `/inactive`       | Get all inactive students   |
| `GET`    | `/class/:classId` | Get all students in a class |

### Subjects (`/subjects`)

| Method   | Endpoint | Description               |
| :------- | :------- | :------------------------ |
| `GET`    | `/`      | Get all subjects          |
| `GET`    | `/:id`   | Get a single subject by ID|
| `POST`   | `/`      | Create a new subject      |
| `PUT`    | `/:id`   | Update a subject          |
| `DELETE` | `/:id`   | Delete a subject          |

### Teachers (`/teachers`)

| Method   | Endpoint            | Description                 |
| :------- | :------------------ | :-------------------------- |
| `GET`    | `/`                 | Get all teachers            |
| `GET`    | `/:id`              | Get a single teacher by ID  |
| `POST`   | `/`                 | Create a new teacher        |
| `PUT`    | `/:id`              | Update a teacher            |
| `DELETE` | `/:id`              | Delete a teacher            |
| `GET`    | `/search`           | Search for teachers         |
| `GET`    | `/subject/:subjectId` | Get all teachers for a subject |
| `GET`    | `/active`           | Get all active teachers     |
| `GET`    | `/inactive`         | Get all inactive teachers   |