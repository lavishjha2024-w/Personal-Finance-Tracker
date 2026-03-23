# Personal Finance Tracker

A comprehensive personal finance tracking application with responsive design, dynamic animations, and cloud database features.

## Live Demo
[https://fin-tracker-test-ruddy.vercel.app](https://fin-tracker-test-ruddy.vercel.app)

## Features
- **Dashboard**: High-level overview of finances
- **Expense Tracking**: Add, view, and analyze expenses
- **Portfolio & Investments**: Track assets and grow wealth
- **Smart Insights**: AI-driven tips for better financial health
- **Responsive Layout**: Designed to work beautifully on mobile

## Development
Run locally:
```bash
npm install
npm start
```

Backend (`backend/`): set `SUPABASE_URL`, `SUPABASE_KEY` (service role), `JWT_SECRET`, `FRONTEND_URL`. Run `supabase/migrations/001_pft_users.sql` in the Supabase SQL editor once. Then `cd backend && npm install && npm start`.
