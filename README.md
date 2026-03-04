# Budget Planner Application

A full-stack personal finance planning application built with React, Node.js, and PostgreSQL. Budget Planner is designed around forward-looking financial planning — users create time-bound budgets, allocate money across spending categories, record income and expenses, and monitor how closely they are tracking against their plan.

---

## Features

**Budget Management**
- Create multiple budgets with a title, description, total amount, and date range
- Allocate the budget across spending categories with per-category limits
- Visual progress bars that change color as spending approaches or exceeds the allocation
- Edit, delete, and toggle budgets between active and inactive states

**Transaction Tracking**
- Record expenses with description, amount, date, category, and optional budget link
- Sortable and filterable table with full-text search, date range, category, and budget filters
- Bulk delete and CSV export of filtered results
- Pagination for large transaction histories

**Income Tracking**
- Record income entries with source, amount, date, and a recurring flag
- Link income to a specific budget to track funding
- Summary cards showing total, recurring, and one-time income

**Dashboard**
- Four summary cards: total income, total expenses, net balance, and active budget count
- Active budget overview with mini progress bars
- Spending vs Plan chart — grouped bar chart comparing allocated vs actual per category
- Income vs Expenses trend line chart over the past 6 months
- Category breakdown donut chart
- Recent activity feed combining latest transactions and income

**Reports and Analytics**
- Period summary with income, expenses, net savings, and transaction count
- Budget performance table showing allocated vs actual vs variance per category
- Spending trends line chart with daily, weekly, or monthly grouping
- Income by source bar chart
- Top spending categories horizontal bar list
- CSV export of transactions for the selected period

**Category Management**
- Default system categories for both expense and income types
- Create custom categories with a name, type, and color picker
- Edit and delete user-created categories

**Settings**
- Edit profile: name, email, preferred currency
- Currency selector affects all amount displays (KES, USD, EUR, GBP, and others)
- Light and dark mode toggle stored in localStorage
- Change password with current password confirmation
- Delete account with typed confirmation

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, React Router v6               |
| Styling    | Tailwind CSS v3                               |
| Charts     | Recharts                                      |
| Forms      | React Hook Form with Zod validation           |
| HTTP       | Axios with request/response interceptors      |
| Backend    | Node.js, Express.js                           |
| Database   | PostgreSQL                                    |
| ORM        | Prisma v5                                     |
| Auth       | JSON Web Tokens (JWT), bcrypt                 |
| Validation | Zod (backend schemas)                         |

---

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Martin888Maina/Budget-Planner-Application.git
cd Budget-Planner-Application
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in your PostgreSQL connection string and a JWT secret:

```
DATABASE_URL=postgresql://user:password@localhost:5432/budget_planner
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Run database migrations and seed the default categories:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Set up the client

```bash
cd ../client
npm install
cp .env.example .env
```

The default `client/.env` value points to the local server:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start both development servers

In one terminal:

```bash
cd server
npm run dev
```

In a second terminal:

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

### Server

| Variable       | Description                              | Default          |
|----------------|------------------------------------------|------------------|
| DATABASE_URL   | PostgreSQL connection string             | (required)       |
| JWT_SECRET     | Secret key for signing tokens            | (required)       |
| JWT_EXPIRES_IN | Token expiry duration                    | 7d               |
| PORT           | Server port                              | 5000             |
| NODE_ENV       | Environment (development / production)   | development      |
| CLIENT_URL     | Allowed CORS origin                      | http://localhost:5173 |

### Client

| Variable       | Description                  | Default                     |
|----------------|------------------------------|-----------------------------|
| VITE_API_URL   | Backend API base URL         | http://localhost:5000/api   |

---

## Project Structure

```
Budget-Planner-Application/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # Axios API service modules
│   │   └── utils/              # Formatters, date helpers, constants
│   └── ...
└── server/                     # Express backend
    ├── prisma/
    │   ├── schema.prisma        # Database schema
    │   └── seed.js              # Default category seeder
    └── src/
        ├── controllers/         # Route handlers
        ├── middleware/          # Auth, validation, error handler
        ├── routes/              # Express route definitions
        └── schemas/             # Zod validation schemas
```

---

## API Overview

| Resource        | Endpoints                                              |
|-----------------|--------------------------------------------------------|
| Auth            | POST /register, POST /login, GET /me, PUT /profile     |
| Budgets         | GET, POST /budgets — GET, PUT, DELETE /budgets/:id     |
| Allocations     | GET, POST /budgets/:id/allocations                     |
| Transactions    | GET, POST /transactions — bulk delete — CSV export     |
| Incomes         | GET, POST /incomes — GET, PUT, DELETE /incomes/:id     |
| Categories      | GET, POST /categories — PUT, DELETE /categories/:id    |
| Reports         | summary, budget-performance, spending-trends, income-by-source |

All protected endpoints require a `Bearer` token in the `Authorization` header.

---

## Future Enhancements

- Recurring transactions that auto-generate on a schedule
- Copy budget — duplicate a previous month's allocations as a starting template
- Budget sharing for couples or small teams
- End-of-month spending forecast based on current pace
- Progressive Web App support for offline access
- Financial goal tracking alongside the budget

---

## License

MIT
