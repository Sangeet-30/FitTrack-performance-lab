# FitTrack Pro — Full-Stack Fitness Tracking Platform

**FitTrack Pro** is a full-stack fitness tracking application built with React, Node.js, Express.js, and MongoDB. It helps users manage workouts, monitor fitness goals, track body measurements, and maintain nutrition and hydration records through a modern, responsive dashboard.

The platform combines workout planning, performance tracking, and fitness management into one application, featuring personalized dashboards, secure authentication, and light and dark themes.

🌐 **Live Demo:** https://fit-track-performance-lab.vercel.app/

💻 **GitHub Repository:** https://github.com/Sangeet-30/FitTrack-performance-lab

---

## ✨ Key Features

### 🏠 Dashboard
- Personalized fitness dashboard.
- Daily workout schedule and training overview.
- Workout statistics and training activity.
- Recovery and readiness indicators.
- Weekly training habit tracking.

### 💪 Workout Management
- Browse 14 structured workout programs.
- Filter routines by muscle group and category.
- Search workouts by name, muscle group, or equipment.
- Filter programs by difficulty.
- Create custom workout routines.
- Track exercises, sets, reps, and weights.

### 📋 Training Logs
- Record completed workout sessions.
- Track workout duration and training volume.
- Monitor Rate of Perceived Exertion (RPE).
- Search and filter workout history.
- Edit and delete workout records.

### 📊 Progress & Biometrics
- Track body weight and measurements.
- Maintain a body composition journal.
- Visualize weight progression through charts.
- Monitor personal fitness records.
- Maintain historical progress checkpoints.

### 🎯 Goals & Milestones
- Create personalized fitness goals.
- Set measurable performance targets.
- Define target values and deadlines.
- Track goal completion progress.
- Monitor active and completed milestones.

### 🥗 Nutrition & Hydration
- Track daily calorie intake.
- Monitor protein, carbohydrates, and fats.
- Configure daily nutritional targets.
- Record meals and snacks.
- Track daily water consumption.

### 👤 Athlete Profile
- Personalized athlete profile.
- Manage body measurements and fitness information.
- Configure workout splits and training preferences.
- Track weekly training targets.

### ⚙️ Settings & Preferences
- Light and dark theme support.
- Metric and imperial measurement units.
- Configurable rest timer intervals.
- Notification preferences.
- Workout auto-save settings.
- Privacy and account preferences.

### 🔐 Authentication & Security
- User registration and login.
- JWT-based authentication using HttpOnly cookies.
- Secure password hashing with bcrypt.
- Protected API routes.
- User-specific data access.
- Read-only demo mode for exploring the application.

### 📱 Responsive Design
- Responsive layouts for desktop, tablet, and mobile.
- Reusable UI components.
- Consistent interface across application sections.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite |
| State Management | Redux Toolkit |
| Routing | React Router |
| Styling | CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, HttpOnly Cookies |
| Password Security | bcrypt |
| Validation | Zod |
| Security | Helmet, CORS |
| Deployment | Vercel, Render |

---

## 📁 Project Structure

```text
FitTrack-performance-lab/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Authentication and validation
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── validation/      # Zod validation schemas
│   │   ├── app.js           # Express application
│   │   └── server.js        # Server entry point
│   │
│   ├── test/                # Backend tests
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── data/            # Workout and exercise data
│   │   ├── features/        # Redux state management
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API integration
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx          # Routes and application setup
│   │   └── main.jsx         # React entry point
│   │
│   ├── test/                # Frontend tests
│   ├── .env.example
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   └── dev.js               # Development server runner
│
├── .gitignore
├── package.json             # Root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 22.12+
- npm 10+
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sangeet-30/FitTrack-performance-lab.git

cd FitTrack-performance-lab
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create environment files from the provided examples:

```bash
cp backend/.env.example backend/.env

cp frontend/.env.example frontend/.env
```

Configure the required environment variables.

**Backend (`backend/.env`)**

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

COOKIE_SAME_SITE=lax

DEMO_MODE=true
```

**Frontend (`frontend/.env`)**

```env
VITE_API_URL=http://localhost:5000
```

Replace example values with your actual configuration. Never commit environment files or production secrets.

### 4. Start the Application

Run the development environment:

```bash
npm run dev
```

The application will be available at:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

---

## 🧪 Testing & Build

Run the following commands from the project root.

**Run Tests**

```bash
npm test
```

**Run Lint Checks**

```bash
npm run lint
```

**Create Production Build**

```bash
npm run build
```

---

## 🔒 Security

Security considerations implemented in the application include:

- JWT authentication with HttpOnly cookies.
- Password hashing using bcrypt.
- Protected backend API routes.
- User-specific database access and data isolation.
- Request validation using Zod.
- Security headers using Helmet.
- Restricted Cross-Origin Resource Sharing (CORS).
- Authentication rate limiting.
- Production environment secret enforcement.

---

## ☁️ Deployment

The application is deployed using the following services:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

### Frontend — Vercel

Configure the following settings:

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```env
VITE_API_URL=your_production_backend_url
```

### Backend — Render

Configure the following settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run start`

Configure the production environment variables, MongoDB connection, frontend CORS origin, and secure cookie settings.

---

## 📌 Future Improvements

Potential enhancements for future versions:

- Wearable device integration.
- Advanced fitness analytics.
- Workout recommendation engine.
- Personal trainer and coach features.
- More detailed performance reports.

---

## 👨‍💻 Author

**Sangeet**

Full-Stack Developer | React.js | Node.js | Express.js | MongoDB

- GitHub: https://github.com/Sangeet-30
- LinkedIn: https://www.linkedin.com/in/sangeet-a62094255

---

## 📄 License

This project was developed as a personal full-stack development portfolio project.

---

**Built with ❤️ by Sangeet**
