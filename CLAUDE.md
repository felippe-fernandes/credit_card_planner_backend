# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **NestJS-based REST API** for **multi-card credit card expense management**. The system is designed to manage purchases across multiple credit cards with multiple users (dependents) sharing these cards.

### Core Purpose
- **Multi-card management**: Track expenses across multiple credit cards
- **Shared card usage**: Register dependents (family members) who use the cards
- **Purchase tracking**: Record purchases with categories and installment support
- **Invoice forecasting**: View and analyze invoices for future or past dates (1 month, 2 months, 6 months, or any custom period)
- **Advanced filtering**: Filter data by card, dependent, category, date range, and more
- **Comprehensive reporting**: Get detailed summaries of all financial activity

**Tech Stack**: NestJS v11, Prisma v6, PostgreSQL (Supabase), Supabase Auth, TypeScript v5

### API Documentation
All endpoints are documented with **Swagger/OpenAPI**. Access the interactive API documentation at `http://localhost:3001/api` when the server is running.

### Important: Use Context7 for AI Assistance
When using AI assistants (Claude, ChatGPT, etc.) to work on this codebase, **always use Context7** to provide the AI with comprehensive context about the project structure and architecture. This dramatically improves AI assistance quality and reduces hallucinations.

## Development Commands

### Local Development
```bash
npm run start:dev          # Start dev server with hot-reload on port 3001
npm run start:debug        # Start with debugger attached
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run production build
```

### Database Management
```bash
npx prisma db push         # Push schema changes to database
npx prisma studio          # Open Prisma Studio GUI
npx prisma generate        # Regenerate Prisma Client
```

### Testing and Code Quality
```bash
npm run test               # Run unit tests once
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:debug         # Debug tests with Node inspector
npm run test:e2e           # Run E2E tests
npm run lint               # Fix linting issues with ESLint
npm run format             # Format code with Prettier
```

## Architecture Overview

### Module Organization
The codebase follows a **feature-based modular architecture** where each feature is self-contained:
- **Core Modules**: Auth, User, Cards, Transactions, Categories, Dependents, Invoice
- **Each module contains**: Controller, Service, DTOs, and Module definition
- **Shared infrastructure**: PrismaModule (database), Interceptors (response formatting), Guards (authorization)

### Database Schema (6 Core Models)
1. **User** - Main account holders with RBAC (USER, ADMIN, SUPER_ADMIN)
2. **Card** - Credit cards with limit tracking, due date, and payment date configuration
3. **Transaction** - Purchases with installment support, linked to cards and optionally to dependents
4. **Invoice** - Monthly aggregated invoices by card, showing total and paid amounts with status tracking
5. **Category** - User-defined expense categories with emoji icons and colors for visual organization
6. **Dependent** - Family members or other people who use the cards (for tracking who made each purchase)

**Key Relationships**:
- One User → Many Cards → Many Transactions → Many Invoices
- One User → Many Dependents
- Transactions can be linked to a Dependent (optional, to track who made the purchase)
- Invoices aggregate all transaction installments that fall within a specific month for each card

**Important**: All monetary values use `Decimal` type to prevent floating-point errors. Cascade deletes maintain referential integrity.

### Authentication Flow
- **Dual-system auth**: Supabase Auth + Prisma database sync
- **AuthGuard**: Validates JWT from HTTP-only cookies (`sb_auth_token`)
- **RolesGuard**: Enforces role-based access control
- Cookie settings: `httpOnly: true, secure: true, sameSite: 'strict'`

### Response Standardization
All API responses follow a standardized format via `ResponseInterceptor`:
```typescript
{
  success: true,
  result: <data>,
  message: "<operation summary>",
  statusCode: 200,
  count?: <number>
}
```

Error responses use `HttpExceptionFilter` for consistent error formatting.

## Key Business Logic

### Transaction Installment Calculation
The `TransactionsService` handles complex installment logic that determines which monthly invoice each installment belongs to:

- **calculateInstallmentDates()**: Determines which month each installment falls in based on:
  - Purchase date
  - Card pay day (e.g., day 10 of each month)
  - Number of installments
- **Validates**: Installment values must sum to total amount
- **Side effects**: Updates card's `availableLimit` after each transaction
- **Installment arrays**: Stores `installmentValues` (amounts) and `installmentDates` (MM/yyyy format) as string arrays

**Example**: Purchase on Jan 15 with card pay day on day 10:
- Purchase date: Jan 15
- First installment appears on: Feb 10 invoice (because Jan 10 already passed)
- Second installment: Mar 10, third: Apr 10, etc.

This logic ensures accurate invoice forecasting for future months.

### Invoice Generation and Forecasting
The `InvoiceService` provides the core functionality for viewing invoices at any point in time:

- **calculateInvoices()**: Groups transactions by card, month, and year to generate invoice summaries
- **upsertInvoices()**: Creates or updates invoices (prevents duplicates via unique constraint on `cardId + userId + month + year`)
- **updateManyInvoices()**: Bulk recalculation on demand or schedule
- **Invoice fields**:
  - `totalAmount`: Sum of all transaction installments for that card/month
  - `paidAmount`: Tracks partial or full payment
  - `dueDate`: When the invoice is due (calculated from card's `dueDay`)
  - `status`: PENDING, PAID, or OVERDUE

**Forecasting capability**: Because installment dates are pre-calculated and stored, you can query invoices for any future month (1, 2, 6 months ahead) or past months to see historical data.

### Category Management
The `CategoriesService` auto-populates 5 default categories on user signup:
- Food 🍔
- Transport 🚗
- Entertainment 🎬
- Health 🏥
- Education 📚

Users can create custom categories with emoji icons and color codes.

## Advanced Query Patterns

### Transaction Filtering
The `TransactionsService.findAll()` method supports complex filtering via query parameters. Controllers should accept these optional DTOs:

```typescript
// Example query combinations:
GET /transactions?cardId=xyz                    // All transactions for a card
GET /transactions?dependentId=abc               // All transactions by a dependent
GET /transactions?purchaseCategory=Food         // All food purchases
GET /transactions?startDate=2025-01&endDate=2025-03  // Date range
GET /transactions?purchaseName=Netflix          // Search by name
GET /transactions?installmentDates=02/2025      // Transactions with installments in Feb 2025
```

**Pattern**: All filters are combined with AND logic. Return format follows the standardized response structure with `count` field for pagination.

### Invoice Filtering
The `InvoiceService.findAll()` supports filtering by:
- `cardId`: Get invoices for a specific card
- `month` + `year`: Get a specific month's invoice
- `status`: Filter by PENDING, PAID, or OVERDUE

This enables forecasting queries like "show me all pending invoices for the next 6 months for all my cards."

## Development Patterns

### Creating New Endpoints
1. Define DTOs in `dto/` folder with `class-validator` decorators
2. Add Swagger documentation with `@ApiProperty()` decorators
3. Implement service method in `*.service.ts`
4. Create controller endpoint in `*.controller.ts`
5. Apply guards: `@UseGuards(AuthGuard, RolesGuard)` and `@Roles(Role.ADMIN)` as needed
6. Response formatting is automatic via global interceptors

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Prisma Client regenerates automatically
4. Update DTOs and service methods accordingly

### Adding Role-Based Restrictions
Use the `@Roles()` decorator with enum values:
```typescript
@Roles(Role.SUPER_ADMIN)  // Only SUPER_ADMIN
@Roles(Role.ADMIN, Role.SUPER_ADMIN)  // Admin or above
```
Note: SUPER_ADMIN has universal access by default in RolesGuard logic.

### TypeScript Type Safety Patterns
**CRITICAL**: While ESLint allows `any` types (`@typescript-eslint/no-explicit-any: off`), the project uses `recommendedTypeChecked` which enforces strict type safety on member access. This means:

**DO NOT use `any` type for objects where properties will be accessed:**
```typescript
// ❌ WRONG - Will cause @typescript-eslint/no-unsafe-member-access errors
const where: any = { userId };
if (filters?.cardId) {
  where.cardId = filters.cardId;  // Error: Unsafe member access
}

// ✅ CORRECT - Define explicit type structure
const where: {
  userId: string;
  cardId?: string;
  month?: number;
} = { userId };
if (filters?.cardId) {
  where.cardId = filters.cardId;  // No error
}
```

**Common patterns for dynamic objects:**
- **Query filters**: Define interface with all optional properties
- **Update data**: Define interface with all possible update fields as optional
- **Date filters**: Use nested object types for gte/lte structures
- **Prisma where clauses**: Explicitly type each field that may be conditionally added

**When to use `any`**: Only for error objects in catch blocks if you're not accessing their properties, or for truly dynamic data you don't control.

## Configuration Files

### Environment Variables (.env)
Required variables:
- `DATABASE_URL`: PostgreSQL connection string with `pgbouncer=true` for pooling
- `DIRECT_URL`: Direct PostgreSQL connection for migrations
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`: CORS origin (default: http://localhost:3000)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: local, development, or production

### Code Style
- **Line width**: 110 characters (Prettier config)
- **Quotes**: Single quotes preferred
- **Trailing commas**: Required
- **TypeScript**: Decorators enabled, `noImplicitAny` disabled for flexibility

## Main Use Cases

### 1. Register Cards and Dependents
- Create credit cards with their payment configuration (limit, due day, pay day)
- Register dependents (family members) who will use these cards

### 2. Record Purchases
- Create transactions with:
  - Card used
  - Purchase details (name, category, amount)
  - Optional: Which dependent made the purchase
  - Installment configuration (number of installments, values per installment)
- System automatically calculates which invoice each installment belongs to

### 3. View Invoice Forecasts
- Query invoices by card, month, and year
- See projected invoices for future months (e.g., "What will my invoice be in 3 months?")
- View historical invoices for past months
- Filter by status (PENDING, PAID, OVERDUE)

### 4. Analyze Spending Patterns
The `/transactions` endpoint supports powerful filtering:
- **Date range**: `startDate` and `endDate` parameters
- **Card**: Filter by specific card ID
- **Dependent**: Filter by who made the purchase
- **Category**: Filter by expense category (Food, Transport, etc.)
- **Search**: Search by purchase name (partial match)
- **Installment dates**: Filter by which invoices the installments fall into

Example use case: "Show me all Food purchases made by my spouse on Card X in the last 3 months"

### 5. Manage Categories
- Create custom expense categories with emoji icons and colors
- System provides 5 default categories (Food, Transport, Entertainment, Health, Education)
- Organize purchases for better financial insights

## API Documentation

All endpoints are fully documented with Swagger/OpenAPI. Access the interactive documentation at `http://localhost:3001/api` when the server is running.

**Key endpoint groups**:
- `/auth` - Authentication and user registration
- `/cards` - Credit card management with advanced search
- `/transactions` - Purchase recording with installment support and filtering
- `/invoice` - Invoice queries and bulk recalculation
- `/categories` - Expense category management
- `/dependents` - Dependent user management
- `/user` - User profile and role management

## Git Workflow

**Branches**:
- `main`: Production branch (auto-deploys to Render)
- `develop`: Development branch for ongoing work
- Feature branches: Create from `develop`, merge back via PR

**Deployment**:
- **Platform**: Render
- **Auto-deploy**: Pushes to `main` branch trigger automatic deployment
- **Post-deploy hook**: `npx prisma db push` runs automatically

## Important Implementation Details

### User Deletion Restrictions
- Cannot delete SUPER_ADMIN users (enforced in `UserService`)
- User deletion cascades to all related entities (cards, transactions, categories, dependents, invoices)

### Card Limit Tracking
Cards have three limit-related fields:
- `limit`: Total credit limit of the card (e.g., R$ 5000)
- `availableLimit`: Automatically recalculated after each transaction creation/update/deletion. Formula: `limit - sum(all pending installments for this card)`
- `simulatedLimit`: User-defined simulation value (optional, for "what-if" scenarios)
- `dueDay`: Day of the month when the invoice is due (e.g., day 5)
- `payDay`: Day of the month when the credit card closes (e.g., day 10). This determines which invoice each installment falls into

**Important**: The `availableLimit` is automatically managed by the `TransactionsService` and should not be manually updated.

### Transaction Uniqueness
Transactions have a unique constraint on `(purchaseName, amount)` to prevent accidental duplicates.

### Invoice Uniqueness
Invoices have a unique constraint on `(cardId, userId, month, year)` to prevent duplicate monthly invoices.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` uses connection pooling (`?pgbouncer=true`)
- Use `DIRECT_URL` for running migrations without pooling

### Supabase Auth Failures
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)
- Check cookie settings in production (secure, sameSite)

### TypeScript Compilation Errors
- Run `npx prisma generate` to regenerate Prisma Client
- Check `tsconfig.json` for decorator metadata settings
