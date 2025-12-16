# Financial Management System

A comprehensive financial management web application with role-based access control, multi-currency transactions, approval workflows, and Profit & Loss reporting.

## Features

- **Role-Based Access Control**: Admin and Team user roles with different permissions
- **Transaction Management**: Income, Expense, and Transfer transactions with approval workflow
- **Multi-Currency Support**: INR and USD with automatic conversion
- **Bank Accounts**: Multiple bank accounts with balance tracking
- **Profit & Loss Reports**: Overall, company-wise, client-wise, and category-wise P&L breakdowns
- **Approval Workflow**: Two-tier approval system for transaction validation
- **CSV Export**: Export approved transactions to CSV format

## Tech Stack

### Frontend
- React (TypeScript) + Vite
- Wouter (routing)
- TanStack Query (data fetching)
- React Hook Form (form handling)
- Shadcn/UI + Tailwind CSS (UI components)
- Lucide React (icons)

### Backend
- Express.js (TypeScript)
- PostgreSQL (Neon) + Drizzle ORM
- JWT authentication with bcrypt
- Cookie-based sessions
- Zod validation

## Installation on Ubuntu Server

### Prerequisites

Install Node.js (v20+), PostgreSQL, and build tools:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 1: Set Up PostgreSQL Database

Create a PostgreSQL user and database:

```bash
sudo -u postgres psql << EOF
CREATE USER financeuser WITH PASSWORD 'Hatlet@143';
CREATE DATABASE finance_db OWNER financeuser;
GRANT ALL PRIVILEGES ON DATABASE finance_db TO financeuser;
\c finance_db
GRANT ALL ON SCHEMA public TO financeuser;
EOF
```

**Note**: Replace `Hatlet@143` with your own secure password.

### Step 2: Clone Project & Install Dependencies

```bash
cd /var/www/html
git clone <your-repo-url> financial-app
cd financial-app
npm install
```

### Step 3: Setup Environment Variables

Create a `.env` file with your database credentials:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://financeuser:Hatlet%40143@localhost:5432/finance_db?sslmode=disable"
NODE_ENV=production
SESSION_SECRET="your-secret-key-min-32-chars-long-1234567890abcdef"
EOF
```

**Important**: 
- Replace `Hatlet%40143` with your PostgreSQL password (@ encoded as %40)
- Use `?sslmode=disable` for local connections
- Generate a unique SESSION_SECRET (minimum 32 characters)

### Step 4: Setup Database & Build

```bash
# Run database migrations
npm run db:push

# Build the application
npm run build
```

### Step 5: Run the Application

```bash
# Kill any existing processes on port 5000
sudo fuser -k 5000/tcp 2>/dev/null || true

# Start the app
DATABASE_URL="postgresql://financeuser:Hatlet%40143@localhost:5432/finance_db?sslmode=disable" npm run start
```

The application will be available at: `http://your-server-ip:5000`

### Step 6: Login

Use the default admin credentials:
- **Email**: admin@example.com
- **Password**: admin123

## Production Setup with PM2

To keep the application running automatically:

```bash
# Install PM2 globally
npm install -g pm2

# Create startup script
cat > /var/www/html/financial-app/start.sh << 'EOF'
#!/bin/bash
export DATABASE_URL="postgresql://financeuser:Hatlet%40143@localhost:5432/finance_db?sslmode=disable"
cd /var/www/html/financial-app
npm run start
EOF

chmod +x /var/www/html/financial-app/start.sh

# Start with PM2
pm2 start /var/www/html/financial-app/start.sh --name "financial-app"
pm2 startup
pm2 save
```

**Check status:**
```bash
pm2 status
pm2 logs financial-app
```

## Production Setup with Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/financial-app << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/financial-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate with Let's Encrypt (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Schema

### Tables
- `users`: User accounts with roles (admin/team)
- `companies`: Business entities
- `bank_accounts`: Bank accounts with balance tracking
- `categories`: Transaction categories
- `clients`: Client information
- `transactions`: Financial transactions

### Key Relationships
- Transactions belong to a company (required)
- Transactions link to categories and clients (optional)
- Transactions reference bank accounts (from/to for transfers)
- All foreign keys properly indexed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Core Data
- `GET/POST /api/companies` - Company management
- `GET/POST /api/bank-accounts` - Bank account management
- `GET/POST /api/categories` - Category management
- `GET/POST /api/clients` - Client management

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/:id/approve` - Approve (Admin only)
- `POST /api/transactions/:id/reject` - Reject (Admin only)

### Reports
- `GET /api/reports/profit-loss` - Overall P&L
- `GET /api/reports/by-company` - Company-wise P&L
- `GET /api/reports/by-client` - Client-wise P&L
- `GET /api/reports/by-category` - Category-wise P&L
- `GET /api/reports/by-bank-account` - Bank account P&L
- `GET /api/reports/export-csv` - Export transactions as CSV

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and hooks
│   │   └── App.tsx        # Main app
│   └── index.html
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   ├── seed.ts            # Database seeding
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle schema + Zod validation
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # This file
```

## Development

For local development on Replit:

```bash
npm run dev
```

This starts:
- Express server on port 5000
- Vite dev server with HMR

## Troubleshooting

### Port 5000 Already in Use

```bash
sudo fuser -k 5000/tcp
```

### Database Connection Error

Verify PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

Test connection:
```bash
psql -U financeuser -d finance_db -c "SELECT 1;"
```

### SSL Certificate Mismatch

Use `?sslmode=disable` in your DATABASE_URL for local connections, or ensure the hostname matches the certificate for remote connections.

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- HttpOnly cookies for token storage
- Role-based access control (RBAC)
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM

## Future Enhancements

- Real-time notifications
- Transaction edit history
- Bulk CSV import
- Advanced financial reports (cash flow, balance sheet)
- Recurring transactions
- Multi-company user access
- Custom report builder
- Email notifications

## License

MIT

## Support

For issues and questions, please contact the development team.
