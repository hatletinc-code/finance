# Financial Management System

A comprehensive financial management web application with role-based access control, multi-currency transactions, approval workflows, and Profit & Loss reporting.

## Tech Stack

### Frontend
- React (TypeScript) + Vite
- Wouter (routing)
- TanStack Query (data fetching)
- React Hook Form (form handling)
- Shadcn/UI + Tailwind CSS (UI components)
- Lucide React (icons)
- Chart.js (data visualization)
- Zustand (state management)

### Backend
- Express.js (TypeScript)
- PostgreSQL (Neon) + Drizzle ORM
- JWT authentication with bcrypt
- Cookie-based sessions
- Zod validation

## Features

### Authentication & Authorization
- JWT-based authentication with httpOnly cookies
- Two roles: Admin and Team
- Role-based access control (RBAC)
- Password hashing with bcrypt

### Core Entities
- **Companies**: Business entities for transaction categorization
- **Bank Accounts**: Global accounts with balance tracking
- **Categories**: Global transaction categories
- **Clients**: Global client database
- **Users**: Admin and Team members
- **Transactions**: Income, Expense, and Transfer types

### Transaction Management
- Multi-currency support (INR default, USD with conversion rate)
- Three transaction types: Income, Expense, Transfer
- Two-tier approval workflow:
  - Team members create transactions (status: pending)
  - Admin approves/rejects transactions
  - Balance updates only on approval
- Internal bank-to-bank transfers
- All balances calculated in INR

### Reports & Analytics
- Overall Profit & Loss (Total Income, Expense, Net Profit)
- Company-wise P&L breakdown
- Client-wise P&L breakdown
- Category-wise P&L breakdown
- Bank Account-wise P&L with transfer tracking
- Date range filtering (start/end date)
- Tab-based navigation for different report types
- CSV export for approved transactions
- Empty state handling for filtered periods with no data

### Role-Based Features

**Admin Portal:**
- Full access to all features
- Approve/reject transactions
- Manage team members
- View pending approvals
- System-wide metrics

**Team Portal:**
- Create transactions
- Edit pending transactions
- View own transaction status
- Access reports (read-only)
- Track submission history

## Database Schema

### Tables
- `users`: User accounts with roles
- `companies`: Business entities
- `bank_accounts`: Bank account with balances
- `categories`: Global transaction categories
- `clients`: Client information
- `transactions`: Financial transactions with multi-currency support

### Key Relationships
- Transactions belong to a company (required)
- Transactions link to categories and clients (optional)
- Transactions reference bank accounts (from/to for transfers)
- Transactions track creator (user_id)
- All foreign keys properly indexed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (always creates Team role)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/admin/create-user` - Create user with role selection (Admin only)

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company (Admin only)
- `PUT /api/companies/:id` - Update company (Admin only)
- `DELETE /api/companies/:id` - Delete company (Admin only)

### Bank Accounts
- `GET /api/bank-accounts` - List all bank accounts
- `POST /api/bank-accounts` - Create bank account
- `PUT /api/bank-accounts/:id` - Update bank account
- `DELETE /api/bank-accounts/:id` - Delete bank account (Admin only)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client (Admin only)

### Transactions
- `GET /api/transactions` - List transactions (filtered by role)
- `GET /api/transactions/:id` - Get single transaction details
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction (pending only)
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/:id/approve` - Approve transaction (Admin only)
- `POST /api/transactions/:id/reject` - Reject transaction (Admin only)

### Reports
- `GET /api/reports/profit-loss` - Get overall P&L summary
- `GET /api/reports/by-company` - Get company-wise P&L breakdown
- `GET /api/reports/by-client` - Get client-wise P&L breakdown
- `GET /api/reports/by-category` - Get category-wise P&L breakdown
- `GET /api/reports/by-bank-account` - Get bank account P&L with transfers
- `GET /api/reports/export-csv` - Export approved transactions as CSV
- All report endpoints support `startDate` and `endDate` query params
- All reports filter by `status: "approved"` only

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (provided by Replit)

### Installation
1. Dependencies are already installed
2. Database is already provisioned
3. Run seed script to create test data:
   ```bash
   tsx server/seed.ts
   ```

### Test Credentials
- **Admin**: admin@example.com / admin123
- **Team**: team@example.com / team123

### Development
The application is already running via the "Start application" workflow which runs:
```bash
npm run dev
```

This starts:
- Express server on port 5000
- Vite dev server with HMR
- Serves both frontend and backend

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and hooks
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication middleware
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── seed.ts            # Database seeding
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle schema + Zod validation
└── replit.md              # This file
```

## Security Features
- Password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- HttpOnly cookies for token storage
- Role-based middleware protection
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM

## Multi-Currency Logic
1. User selects currency (INR or USD)
2. If USD selected, enter conversion rate
3. Store both:
   - Original amount in selected currency
   - Converted INR amount (calculated)
4. All balance calculations use INR amounts
5. Reports show everything in INR

## Approval Workflow
1. Team member creates transaction → status: `pending`
2. Admin reviews in approvals dashboard
3. Admin approves:
   - Status → `approved`
   - Update bank account balances (in INR)
   - For income: increase balance
   - For expense: decrease balance
   - For transfer: deduct from source, add to destination
4. Admin rejects:
   - Status → `rejected`
   - No balance changes

## Design System
- Dark mode by default with theme toggle
- Financial trust-focused color palette
- Monospace fonts for financial figures
- Consistent spacing and elevation
- Status badges with color coding:
  - Pending: Amber
  - Approved: Green
  - Rejected: Red

## Future Enhancements
- Real-time notifications
- Transaction edit history
- Bulk CSV import
- Advanced financial reports (cash flow, balance sheet)
- Recurring transactions
- Multi-company user access
- Custom report builder
- Email notifications
