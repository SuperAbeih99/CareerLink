# CareerLink

A full‑stack job portal where **Job Seekers** find, save, and apply to roles, and **Employers** post openings and manage applicants. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js) and JWT auth.

---

## ✨ Features

* **Role-based auth** (Employer / Job Seeker) with JWT
* **Job Listings**: browse, search, and filter by title, company, location, and category
* **Applications**: upload resume/CV, track status (e.g., Submitted → Under Review → Rejected/Hired)
* **Resume Vault**: upload, update, and download resumes
* **Saved Jobs**: bookmark and revisit later
* **Employer Dashboard**: post jobs, edit/delete/close listings
* **Applicants View**: list of applicants per job with resume downloads
* **Company Profile**: logo, name, description for credibility
* **Responsive UI**: mobile → desktop

---

## 🧱 Tech Stack

* **Frontend**: React + Vite, React Router, Axios, Tailwind (optional)
* **Backend**: Node.js, Express.js, JWT & bcrypt, Multer (file uploads)
* **Database**: MongoDB Atlas (Mongoose)
* **Other**: CORS, dotenv

## 🚀 Quick Start

### Prerequisites

* Node.js **18+** and npm
* A MongoDB Atlas connection string

### 1) Clone

```
# Replace with your repo if different
git clone https://github.com/SuperAbeih88/CareerLink.git
cd CareerLink
```

### 2) Install dependencies

```
cd backend && npm install
cd ../frontend && npm install
```

### 3) Environment variables

Create a `.env` file in **backend/**:
```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:5173
```

### 4) Run dev servers

```
cd backend
npm run dev

cd frontend
npm run dev
```
