# 💳 Credit Card Planner - Backend API



<div align="center">



![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)



**A robust REST API for multi-card credit card expense management and financial forecasting**



[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Architecture](#-architecture) • [Deployment](#-deployment)



</div>



---



## 📋 Overview



Credit Card Planner Backend is a comprehensive **NestJS-based REST API** designed for managing expenses across multiple credit cards with multi-user support. The system enables families and individuals to track purchases, manage card limits, forecast future invoices, and gain insights into spending patterns.



This project serves as the backend for the [Credit Card Planner Frontend](https://github.com/felippe-fernandes/credit_card_planner_frontend), providing a complete full-stack financial management solution.



### 🎯 Key Highlights



- **Multi-card Management**: Track expenses across unlimited credit cards

- **Shared Card Usage**: Register dependents (family members) who share cards

- **Smart Installment Tracking**: Automatic calculation of installment dates based on card payment cycles

- **Invoice Forecasting**: View projected invoices for any future or past month

- **Advanced Filtering**: Filter transactions by card, dependent, category, date range, and more

- **Role-Based Access Control**: USER, ADMIN, and SUPER_ADMIN roles

- **Comprehensive API Documentation**: Interactive Swagger/OpenAPI docs

- **Production-Ready**: Deployed on Render with auto-deployment from main branch



---



## ✨ Features



### 🏦 Card Management

- Create and manage multiple credit cards with custom payment configurations

- Track card limits, due dates, and payment cycles

- Automatic available limit calculation based on pending installments

- Support for simulated limits (what-if scenarios)



### 👥 Dependent Management

- Register family members or other card users

- Track which dependent made each purchase

- Filter and analyze spending by dependent



### 💰 Transaction Tracking

- Record purchases with detailed information (name, category, amount, description)

- Full installment support with custom values per installment

- Automatic calculation of which invoice each installment belongs to

- Prevent duplicate transactions with unique constraints



### 📊 Invoice System

- Automatic monthly invoice generation per card

- View invoices for any past or future month

- Invoice status tracking (PENDING, PAID, OVERDUE)

- Bulk invoice recalculation on-demand

- Due date calculation based on card configuration



### 🏷️ Category Management

- Create custom expense categories with emoji icons and colors

- 5 default categories auto-created on signup:

  - Food 🍔

  - Transport 🚗

  - Entertainment 🎬

  - Health 🏥

  - Education 📚



### 🔍 Advanced Filtering & Reporting

- Filter transactions by:

  - Card

  - Dependent

  - Category

  - Date range

  - Purchase name (search)

  - Installment dates (by invoice month)

- Standardized API responses with count metadata

- Comprehensive query combinations



### 🔐 Authentication & Security

- Dual-system authentication (Supabase Auth + Prisma sync)

- JWT-based authentication with HTTP-only cookies

- Role-based access control with guards

- Secure cookie configuration (httpOnly, secure, sameSite)



---



## 🛠 Tech Stack



### Core Framework

- **[NestJS](https://nestjs.com/)** v11 - Progressive Node.js framework

- **[TypeScript](https://www.typescriptlang.org/)** v5 - Type-safe JavaScript



### Database & ORM

- **[Prisma](https://www.prisma.io/)** v6 - Next-generation ORM

- **[PostgreSQL](https://www.postgresql.org/)** - Relational database

- **[Supabase](https://supabase.com/)** - Managed PostgreSQL with Auth



### Authentication

- **[Supabase Auth](https://supabase.com/auth)** - User authentication

- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)** - JWT handling

- **[@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)** - Authentication middleware



### API Documentation

- **[Swagger/OpenAPI](https://swagger.io/)** - Interactive API docs

- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)** - Swagger integration



### Validation & Transformation

- **[class-validator](https://www.npmjs.com/package/class-validator)** - DTO validation

- **[class-transformer](https://www.npmjs.com/package/class-transformer)** - Object transformation



### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting

- **[Prettier](https://prettier.io/)** - Code formatting

- **[Jest](https://jestjs.io/)** - Testing framework



### Deployment

- **[Render](https://render.com/)** - Cloud hosting platform



---



## 🏗 Architecture



### Module Organization



The codebase follows a **feature-based modular architecture** where each feature is self-contained:



```

src/

├── auth/              # Authentication & authorization

│   ├── guards/        # AuthGuard, RolesGuard

│   ├── decorators/    # Custom decorators

│   └── dto/           # Auth DTOs

├── cards/             # Credit card management

├── categories/        # Expense categories

├── dependents/        # Dependent user management

├── invoice/           # Invoice generation & queries

├── transactions/      # Purchase tracking

├── user/              # User profile management

├── common/            # Shared DTOs & utilities

├── interceptors/      # Response & exception interceptors

└── utils/             # Helper functions

```



### Database Schema



The system uses **6 core models** with well-defined relationships:



```

User (1) ──┬─→ (N) Card ──→ (N) Transaction ──→ (N) Invoice

           ├─→ (N) Dependent

           ├─→ (N) Category

           ├─→ (N) Transaction

           └─→ (N) Invoice

```



**Key Models:**

1. **User** - Account holders with RBAC (USER, ADMIN, SUPER_ADMIN)

2. **Card** - Credit cards with limit tracking and payment configuration

3. **Transaction** - Purchases with installment support

4. **Invoice** - Monthly aggregated invoices by card

5. **Category** - User-defined expense categories

6. **Dependent** - Family members who use the cards



**Important Design Decisions:**

- All monetary values use `Decimal` type to prevent floating-point errors

- Cascade deletes maintain referential integrity

- Unique constraints prevent duplicate data

- Indexes optimize query performance



### Business Logic Highlights



#### 🔄 Installment Calculation

The `TransactionsService` handles complex installment logic:



```typescript

// Example: Purchase on Jan 15 with card pay day on day 10

// Purchase date: Jan 15

// First installment: Feb 10 invoice (Jan 10 already passed)

// Second installment: Mar 10

// Third installment: Apr 10, etc.

```



- Determines which monthly invoice each installment belongs to

- Validates installment values sum to total amount

- Updates card's `availableLimit` automatically

- Stores installment dates in MM/yyyy format



#### 📈 Invoice Forecasting

The `InvoiceService` enables viewing invoices at any point in time:



- **calculateInvoices()** - Groups transactions by card/month/year

- **upsertInvoices()** - Creates/updates invoices (prevents duplicates)

- **updateManyInvoices()** - Bulk recalculation

- Query invoices for future months (1, 2, 6+ months ahead)

- View historical data for past months



### Response Standardization



All API responses follow a consistent format via `ResponseInterceptor`:



```json

{

  "success": true,

  "result": "<data>",

  "message": "<operation summary>",

  "statusCode": 200,

  "count": "<number (optional)>"

}

```



Error responses use `HttpExceptionFilter` for consistent error formatting.



---



## 🚀 Getting Started



### Prerequisites



- **Node.js** v18 or higher

- **npm** v9 or higher

- **PostgreSQL** database (or Supabase account)

- **Supabase** account for authentication



### Installation



1. **Clone the repository**



```bash

git clone https://github.com/felippe-fernandes/credit_card_planner_backend.git

cd credit_card_planner_backend

```



2. **Install dependencies**



```bash

npm install

```



3. **Set up environment variables**



```bash

cp .env.example .env

```



Edit `.env` and fill in your credentials:



```env

# Application environment

NODE_ENV=local



# Database (Supabase PostgreSQL)

DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"



# Supabase

SUPABASE_URL="https://[PROJECT-REF].supabase.co"

SUPABASE_ANON_KEY="your-anon-key"

SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"



# Frontend URL (for CORS)

FRONTEND_URL="http://localhost:3000"



# Server Port

PORT=3001

```



4. **Push database schema to Supabase**



```bash

npx prisma db push

```



5. **Generate Prisma Client**



```bash

npx prisma generate

```



6. **Start the development server**



```bash

npm run start:dev

```



The server will start at `http://localhost:3001`



### 🗄️ Database Management



```bash

# Open Prisma Studio (GUI for database)

npx prisma studio



# Push schema changes to database

npx prisma db push



# Regenerate Prisma Client after schema changes

npx prisma generate



# Format Prisma schema

npx prisma format

```



### 🧪 Testing



```bash

# Run unit tests

npm run test



# Run tests in watch mode

npm run test:watch



# Generate coverage report

npm run test:cov



# Run E2E tests

npm run test:e2e



# Debug tests

npm run test:debug

```



### 🎨 Code Quality



```bash

# Lint and fix code

npm run lint



# Format code with Prettier

npm run format

```



---



## 📚 API Documentation



The API is fully documented using **Swagger/OpenAPI**. Access the interactive documentation:



**Local Development:**

`http://localhost:3001/api`



**Production:**

Check your deployed Render URL + `/api`



### Main Endpoint Groups



| Endpoint | Description |

|----------|-------------|

| `/auth` | Authentication and user registration |

| `/user` | User profile and role management |

| `/cards` | Credit card CRUD operations |

| `/transactions` | Purchase recording with installment support |

| `/invoice` | Invoice queries and bulk recalculation |

| `/categories` | Expense category management |

| `/dependents` | Dependent user management |



### Example API Calls



#### Create a Transaction with Installments



```bash

POST /transactions

Content-Type: application/json



{

  "cardId": "abc123",

  "purchaseName": "Laptop",

  "purchaseCategory": "Electronics",

  "amount": 3000.00,

  "purchaseDate": "2025-01-15",

  "installments": 3,

  "installmentsValue": [1000.00, 1000.00, 1000.00],

  "dependentId": "def456"

}

```



#### Query Invoices for Next 3 Months



```bash

GET /invoice?month=2&year=2025

GET /invoice?month=3&year=2025

GET /invoice?month=4&year=2025

```



#### Filter Transactions by Multiple Criteria



```bash

GET /transactions?cardId=abc123&purchaseCategory=Food&startDate=2025-01&endDate=2025-03

```



---



## 🌍 Deployment



The project is configured for deployment on **[Render](https://render.com/)**.



### Automatic Deployment



1. Connect your GitHub repository to Render

2. Set up environment variables in Render dashboard

3. Push to `main` branch

4. Render automatically builds and deploys



### Post-Deploy Hook



The `postdeploy` script automatically runs after deployment:



```json

"postdeploy": "prisma db push"

```



### Manual Deployment



```bash

# Build the project

npm run build



# Run in production mode

npm run start:prod

```



### Environment Variables (Render)



Ensure these are set in your Render dashboard:

- `DATABASE_URL`

- `DIRECT_URL`

- `SUPABASE_URL`

- `SUPABASE_ANON_KEY`

- `SUPABASE_SERVICE_ROLE_KEY`

- `FRONTEND_URL`

- `NODE_ENV=production`



---



## 🔧 Project Configuration



### TypeScript Configuration



- **Decorators**: Enabled for NestJS

- **Strict Mode**: Partial (allows flexibility)

- **Module**: ES2022

- **Target**: ES2022



### ESLint Configuration



- **Parser**: `@typescript-eslint/parser`

- **Config**: `recommendedTypeChecked`

- **Line Width**: 110 characters

- **Quotes**: Single quotes preferred



### Prettier Configuration



```json

{

  "singleQuote": true,

  "trailingComma": "all",

  "printWidth": 110

}

```



---



## 📖 Use Cases



### 1. Family Expense Management

- Parents create credit cards

- Register children as dependents

- Track who made each purchase

- Analyze spending patterns by family member



### 2. Multi-Card Optimization

- Manage multiple credit cards

- Track available limits across all cards

- Forecast future invoices to plan payments

- Avoid overspending by monitoring limits



### 3. Financial Forecasting

- View projected invoices for next 6 months

- Plan for large purchases with installments

- Analyze spending trends by category

- Set budgets based on historical data



### 4. Installment Management

- Create purchases with custom installment plans

- Automatically calculate which invoice each installment falls into

- Track payment progress across multiple months

- Manage installments across multiple cards



---



## 🤝 Contributing



Contributions are welcome! This is a portfolio project, but suggestions and improvements are appreciated.



1. Fork the repository

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request



---



## 📝 License



This project is licensed under the **UNLICENSED** license - it is a private portfolio project.



---



## 👨‍💻 Author



**Felippe Fernandes**



- GitHub: [@felippe-fernandes](https://github.com/felippe-fernandes)

- Frontend Repository: [credit_card_planner_frontend](https://github.com/felippe-fernandes/credit_card_planner_frontend)



---



## 🙏 Acknowledgments



- **NestJS** team for the amazing framework

- **Prisma** team for the excellent ORM

- **Supabase** for managed PostgreSQL and Auth

- **Render** for easy deployment
