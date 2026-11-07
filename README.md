# FitTrack Pro — Full-Stack Fitness Tracking Platform

FitTrack Pro is a full-stack fitness tracking application built with **React 19, Node.js, Express.js and MongoDB**.

It helps users track workouts, fitness goals, body progress, nutrition and hydration through a responsive dashboard with light and dark themes.

## Features

- **Dashboard:** Fitness overview, activity tracking and workout statistics.
- **Workout Tracking:** Log workouts, exercises, sets, reps, weight and training volume.
- **Goals:** Create fitness goals and track progress.
- **Progress Tracking:** Monitor body weight, measurements and personal records.
- **Nutrition:** Track daily calories, macronutrients and water intake.
- **Authentication:** Secure registration, login and logout using JWT HttpOnly cookies.
- **Demo Mode:** Explore the application through a read-only guest experience.
- **Responsive Design:** Mobile, tablet and desktop support.
- **Themes:** Light and dark mode.

## Tech Stack

| Frontend | Backend | Database |
|---|---|---|
| React 19 | Node.js | MongoDB Atlas |
| Vite | Express.js | Mongoose |
| Redux Toolkit | JWT | |
| React Router | Zod | |
| CSS Modules | Helmet | |

## Project Structure

```text
Fit-track_app/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Authentication and validation
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── validation/      # Zod schemas
│   │   ├── app.js           # Express configuration
│   │   └── server.js        # Server entry point
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


## 📸 Screenshots

| Dashboard (Dark Mode) | Workout Analytics & Logs |
|:---:|:---:|
| ![Dashboard Screen Placeholder](https://via.placeholder.com/800x450/0d0d10/ef4444?text=FitTrack+Dashboard+View) | ![Workouts Screen Placeholder](https://via.placeholder.com/800x450/0d0d10/ef4444?text=Workout+Logs+%26+Volume) |

| Goals & Benchmarks | Responsive Mobile / Light Mode |
|:---:|:---:|
| ![Goals Screen Placeholder](https://via.placeholder.com/800x450/0d0d10/ef4444?text=Active+Milestones) | ![Mobile Screen Placeholder](https://via.placeholder.com/800x450/ffffff/dc2626?text=Light+Theme+%26+Mobile) |

---

## Installation & Setup

**Prerequisites**
- Node.js 22.12+
- npm 10+
- MongoDB Atlas account

**1. Clone the repository**

```bash
git clone https://github.com/your-username/Fit-track_app.git
cd Fit-track_app
```

**2. Install dependencies**

```bash
npm run install:all
```

**3. Configure environment variables**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your MongoDB connection and JWT secret in `backend/.env`.

**4. Start the application**

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Environment Variables

**Backend**

| Variable | Description |
|---|---|
| PORT | Backend server port |
| NODE_ENV | Application environment |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing secret (32+ characters in production) |
| JWT_EXPIRES_IN | Token expiration |
| CLIENT_URL | Frontend origin |
| COOKIE_SAME_SITE | Cookie SameSite policy |
| DEMO_MODE | Enable or disable demo mode |

**Frontend**

| Variable | Description |
|---|---|
| VITE_API_URL | Backend API URL |

## Testing & Build

```bash
# Run all tests
npm test

# Run lint checks
npm run lint

# Create production build
npm run build
```

## Security

- JWT authentication using HttpOnly cookies.
- Password hashing with bcrypt.
- Protected API routes.
- User-specific database access and isolation.
- Request validation using Zod.
- CORS restrictions and Helmet security headers.
- Authentication rate limiting.
- Production environment secret enforcement.

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

**Frontend configuration**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment: `VITE_API_URL`

**Backend configuration**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run start`

Configure the production environment variables, CORS origin and secure cookie settings before deployment.

## License

This project is developed as a personal full-stack development portfolio project.