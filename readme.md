# Job Board and Recruitment Platform

## 📁 Project Structure

```
Assignment 7/
├─ api/
│  ├─ config/
│  │  ├─ constant.js
│  │  └─ database.js
│  ├─ controllers/
│  │  ├─ applicationController.js
│  │  ├─ companyController.js
│  │  ├─ feedbackController.js
│  │  ├─ jobController.js
│  │  └─ userController.js
│  ├─ helpers/
│  │  └─ redis/
│  │     ├─ getData.js
│  │     ├─ setData.js
│  │     └─ unsetData.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ authRole.js
│  │  └─ upload.js
│  ├─ models/
│  │  ├─ application.js
│  │  ├─ companyProfile.js
│  │  ├─ feedback.js
│  │  ├─ index.js
│  │  ├─ interviewInvitation.js
│  │  ├─ job.js
│  │  └─ user.js
│  ├─ routes/
│  │  ├─ applicationRoute.js
│  │  ├─ companyRoute.js
│  │  ├─ feedbackRoute.js
│  │  ├─ jobRoute.js
│  │  └─ userRoute.js
│  ├─ scripts/
│  │  └─ createAdmin.js
│  ├─ uploads/
│  │  ├─ companyLogo/
│  │  ├─ profilepic/
│  │  │  └─ 1742887442896-male.jpeg
│  │  └─ resume/
│  │     └─ 1742887442898-resume-sample.pdf
│  ├─ utils/
│  │  └─ mailer.js
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
- **Redis Integration**: Cache frequently accessed data
- **File Uploads**: Supports profile pictures, company logos, and resumes

## 🛠️ Setup and Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/jaychavada01/Assignment-7-Job-Board-and-Recruitment-Platform.git
cd Assignment-7/api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the `api/` directory with the required configuration:

```env
PORT=5000
JWT_SECRET=your_key
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name

# Mail Configuration
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
```

### 4️⃣ Run Redis with Docker

```bash
docker run -p 6379:6379 -it redis/redis-stack-server:latest
```

### 5️⃣ Run the Server

```bash
npm run server
```

OR (for development with auto-restart)

```bash
nodemon server.js
```

## 👤 Admin User Setup

An admin user is automatically created on server startup using the `createAdmin.js` script. Ensure your database is correctly configured before running the server.

## 📌 API Endpoints

### **User Routes**
- `POST /user/register` - Register a new user
- `POST /user/login` - User login
- `GET /user/:id` - Get user by ID
- `PATCH /user/:id` - Update user details
- `DELETE /user/:id` - Delete user

### **Job Routes**
- `POST /job/create` - Create a new job
- `GET /job` - Get all jobs
- `GET /job/:id` - Get job by ID
- `PATCH /job/:id` - Update job details
- `DELETE /job/:id` - Delete job

### **Company Routes**
- `POST /company/create` - Create a company profile
- `GET /company` - Get all companies
- `GET /company/:id` - Get company by ID
- `PATCH /company/:id` - Update company details
- `DELETE /company/:id` - Delete company

### **Application Routes**
- `POST /application/apply` - Apply for a job
- `GET /application` - Get all applications
- `GET /application/:id` - Get application by ID
- `PATCH /application/:id` - Update application status
- `DELETE /application/:id` - Delete application

### **Feedback Routes**
- `POST /feedback/create` - Submit feedback
- `GET /feedback` - Get all feedback
- `GET /feedback/:id` - Get feedback by ID

## 🛡️ Security & Middleware

- **Authentication Middleware (`auth.js`)**: Ensures protected routes require authentication.
- **Role-Based Authorization (`authRole.js`)**: Restricts access based on user roles.
- **File Uploads (`upload.js`)**: Handles profile picture and resume uploads securely.
- **Redis Caching (`helpers/redis/`)**: Stores frequently accessed data to improve performance.