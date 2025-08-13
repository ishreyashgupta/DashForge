# MERN Fullstack App

A fullstack application built with **MongoDB, Express.js, React, and Node.js**. The backend serves REST APIs and handles authentication, while the frontend delivers a responsive UI using React and Vite.

---

## 📁 Project Structure

```
mernapp/
├── backend/     # Express.js + MongoDB API
├── frontend/    # React + Vite client
├── .gitignore   # Ignores builds, envs, node_modules
├── README.md    # Project documentation
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mernapp.git
cd mernapp
```

### 2. Backend Setup

```bash
cd backend
npm install
# Add .env file (see below)
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Example `.env` Files

### backend/.env

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernapp
JWT_SECRET=your_secret_key
```

### frontend/.env

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🌿 Git Branch Strategy

* `main` → production-ready code
* `dev` → active development
* `testing` → staging/QA
* `feature/...` → individual features or fixes

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, React Router, Tailwind CSS (optional)
* **Backend:** Express.js, MongoDB, Mongoose, JWT
* **Tools:** Nodemon, dotenv

---

## 📄 License

This project is not licensed for use, reproduction, or distribution. All rights reserved.
