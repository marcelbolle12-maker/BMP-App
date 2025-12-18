# BMP-App

Module 1 implementation with authentication, JWT-based sessions, and admin user management.

## Project Structure
- `/backend`: Express API with Prisma and PostgreSQL
- `/frontend`: React + Vite client
- `.env.example`: sample environment variables

## Backend Setup
```bash
cd backend
npm install
npm run generate
npm run migrate # runs "prisma migrate dev --name init"
npm run seed
npm run dev
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env` at the project root and also to `backend/.env` for Prisma CLI compatibility. The backend reads `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL`. The frontend reads `VITE_API_URL`.

## Default Users
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`
