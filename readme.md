# Job Board and Recruitment Platform

## 📁 Project Structure

```
Assignment 7/
├─ api/
│  ├─ config/
│  │  ├─ constant.js
│  │  └─ database.js
│  ├─ controllers/
│  │  ├─ companyController.js
│  │  ├─ jobController.js
│  │  └─ userController.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  └─ upload.js
│  ├─ models/
│  │  ├─ application.js
│  │  ├─ companyProfile.js
│  │  ├─ feedBack.js
│  │  ├─ index.js
│  │  ├─ interviewInvitation.js
│  │  ├─ job.js
│  │  └─ user.js
│  ├─ routes/
│  │  ├─ companyRoute.js
│  │  ├─ jobRoute.js
│  │  └─ userRoute.js
│  ├─ scripts/
│  │  └─ createAdmin.js
│  ├─ uploads/
│  │  ├─ companyLogo/
│  │  ├─ profilepic/
│  │  └─ resume/
│  ├─ utils/
│  ├─ .env
│  ├─ package-lock.json
│  ├─ package.json
│  └─ server.js
├─ .gitignore
└─ readme.md

```

## 🚀 Project Overview

The **Job Board and Recruitment Platform** is a Node.js-based backend system designed to facilitate job applications, company profiles, interview invitations, and user management. It includes authentication, user roles, and job-related operations.

### 🔑 Features

- **User Authentication**: Registration, Login, Password Management
- **Job Management**: CRUD operations for job postings
- **Company Profiles**: Manage company details
- **Application Tracking**: Handle job applications
- **Interview Invitations**: Schedule interviews
- **Feedback System**: Collect feedback from candidates

## 🛠️ Setup and Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/jaychavada01/Assignment-7-Job-Board-and-Recruitment-Platform.git
cd api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the `api/` directory with the required configuration:

```env
PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name
```

### 4️⃣ Run the Server

```bash
npm run server
```

OR (for development with auto-restart)

```bash
nodemon server.js
```

## 👤 Admin User Setup

An admin user is automatically created on server startup using the `createAdmin.js` script. Ensure your database is correctly configured before running the server.
