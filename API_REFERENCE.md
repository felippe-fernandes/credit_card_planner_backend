# API Reference - Credit Card Planner Backend

**Comprehensive TypeScript Interface Documentation for Frontend Integration**

Base URL: `http://localhost:3001` (development) | `https://your-production-url.com` (production)

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [API Modules](#api-modules)
  - [Auth Module](#auth-module)
  - [User Module](#user-module)
  - [Cards Module](#cards-module)
  - [Transactions Module](#transactions-module)
  - [Invoice Module](#invoice-module)
  - [Categories Module](#categories-module)
  - [Dependents Module](#dependents-module)
- [TypeScript Interfaces](#typescript-interfaces)
- [Frontend Integration Examples](#frontend-integration-examples)

---

## Authentication

All endpoints (except `/auth/login` and `/auth/signup`) require authentication via **HTTP-only cookie** named `sb_auth_token`.

**Cookie Details:**
- Name: `sb_auth_token`
- HttpOnly: `true`
- Secure: `true`
- SameSite: `strict`

**Headers Required:**
```typescript
{
  'Content-Type': 'application/json',
  // Cookie is sent automatically by browser
}
```

---

## Response Format

All API responses follow a standardized format:

### Success Response
```typescript
interface BaseResponse<T = any> {
  success: true;
  message: string;
  statusCode: number;
  result: T;
  count?: number; // Present in list endpoints
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
}
```

**Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## API Modules

---

## Auth Module

### POST `/auth/signup`
Create a new user account.

**Request Body:**
```typescript
interface SignupDto {
  email: string;           // Valid email format
  password: string;        // Min 6, Max 20 characters
  name: string;            // Min 3 characters
  phone?: string;          // Optional, e.g., "+1234567890"
}
```

**Response:**
```typescript
interface SignupResponse {
  success: true;
  message: string;
  statusCode: 201;
  result: {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    expires_at: number;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      role: 'authenticated';
      email_confirmed_at: string;
      phone: string;
      confirmed_at: string;
      last_sign_in_at: string;
      app_metadata: {
        provider: 'email';
        providers: string[];
      };
      user_metadata: {
        displayName: string;
        email: string;
        email_verified: boolean;
        phone: string;
        phone_verified: boolean;
        sub: string;
      };
      identities: Array<{
        identity_id: string;
        id: string;
        user_id: string;
        provider: string;
        email: string;
        created_at: string;
        updated_at: string;
      }>;
      created_at: string;
      updated_at: string;
      is_anonymous: boolean;
    };
  };
  count: 1;
}
```

**Example:**
```typescript
const response = await fetch('/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john.doe@email.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+1234567890'
  })
});
```

---

### POST `/auth/login`
Authenticate a user and receive session tokens.

**Request Body:**
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

**Response:** Same as signup response (includes session tokens)

**Example:**
```typescript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'john.doe@email.com',
    password: 'password123'
  })
});
```

---

### POST `/auth/signout`
Sign out the current user.

**Response:**
```typescript
{
  success: true;
  message: string;
  statusCode: 201;
}
```

---

## User Module

### GET `/users/me`
Get the authenticated user's profile.

**Response:**
```typescript
interface UserResponse {
  success: true;
  result: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string; // ISO 8601 date
    editedAt: string | null;
  };
  count: 1;
  statusCode: 200;
}
```

---

### PATCH `/users/me`
Update the authenticated user's profile.

**Request Body:**
```typescript
interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
}
```

**Response:** Same as GET `/users/me`

---

### DELETE `/users/me`
Delete the authenticated user's account.

**Response:**
```typescript
{
  success: true;
  message: string;
  statusCode: 200;
}
```

---

### GET `/users` (SUPER_ADMIN only)
List all users in the system.

**Response:**
```typescript
{
  success: true;
  result: Array<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
    editedAt: string | null;
  }>;
  count: number;
  statusCode: 200;
}
```

---

### PUT `/users/change-role` (SUPER_ADMIN only)
Change a user's role.

**Request Body:**
```typescript
interface UpdateUserRoleDto {
  userId: string;
  newRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}
```

**Response:** Updated user object

---

### DELETE `/users/delete/:id` (SUPER_ADMIN only)
Delete a specific user by ID.

**Response:**
```typescript
{
  success: true;
  result: { userId: string };
  count: 1;
  statusCode: 200;
}
```

---

## Cards Module

### GET `/cards`
Get all credit cards for the authenticated user.

**Query Parameters:**
```typescript
interface FindAllCardsQuery {
  flag?: string;       // e.g., "Visa", "Mastercard"
  bank?: string;       // e.g., "Nubank"
  dueDay?: number;     // 1-31
  payDay?: number;     // 1-31
  name?: string;       // Card name
}
```

**Response:**
```typescript
{
  success: true;
  result: Array<{
    id: string;
    userId: string;
    name: string;
    bank: string;
    flag: string;
    limit: string;              // Decimal as string, e.g., "5000.00"
    dueDay: number;             // Day of month invoice is due
    payDay: number;             // Day of month when billing cycle closes
    availableLimit: string;     // Auto-calculated remaining limit
    simulatedLimit: string;     // User-defined simulation value
    createdAt: string;
    editedAt: string | null;
  }>;
  count: number;
  statusCode: 200;
}
```

---

### POST `/cards`
Create a new credit card.

**Request Body:**
```typescript
interface CreateCardDto {
  name: string;
  bank: string;
  flag: string;
  limit: string;       // Decimal string, e.g., "5000.00"
  dueDay: number;      // 1-31
  payDay: number;      // 1-31
}
```

**Response:**
```typescript
{
  success: true;
  result: {
    id: string;
    userId: string;
    name: string;
    bank: string;
    flag: string;
    limit: string;
    dueDay: number;
    payDay: number;
    availableLimit: string;
    simulatedLimit: string;
    createdAt: string;
    editedAt: string;
  };
  count: 1;
  statusCode: 201;
}
```

---

### GET `/cards/search`
Find a specific card by ID, name, or bank.

**Query Parameters:**
```typescript
interface FindOneCardQuery {
  id?: string;
  name?: string;
  bank?: string;
}
```

**Response:** Single card object (same structure as POST response)

---

### PATCH `/cards/:id`
Update a credit card.

**Request Body:**
```typescript
interface UpdateCardDto {
  name?: string;
  bank?: string;
  flag?: string;
  limit?: string;
  dueDay?: number;
  payDay?: number;
}
```

**Response:** Updated card object

---

### DELETE `/cards/:id`
Delete a credit card.

**Response:**
```typescript
{
  success: true;
  result: { cardId: string };
  count: 1;
  statusCode: 200;
}
```

---

## Transactions Module

### GET `/transactions`
Get all transactions with advanced filtering.

**Query Parameters:**
```typescript
interface FindAllTransactionsQuery {
  card?: string;                  // Card ID
  dependent?: string;             // Dependent ID
  purchaseName?: string;          // Partial match search
  purchaseCategory?: string;      // Category name
  installments?: number;          // Number of installments
  purchaseDate?: string;          // ISO 8601 date
  startDate?: string;             // ISO 8601 date (range start)
  endDate?: string;               // ISO 8601 date (range end)
  installmentDates?: string[];    // Array of "MM/YYYY" format
}
```

**Response:**
```typescript
{
  success: true;
  result: Array<{
    id: string;
    cardId: string;
    userId: string;
    dependentId: string | null;
    purchaseName: string;
    purchaseCategory: string;
    description: string | null;
    amount: string;                    // Decimal as string
    purchaseDate: string;              // ISO 8601
    installments: number;
    installmentsValue: string[];       // Array of decimal strings
    installmentDates: string[];        // Array of "MM/YYYY"
    createdAt: string;
    editedAt: string | null;
    card: {
      name: string;
    };
    dependent: {
      name: string;
    } | null;
  }>;
  count: number;
  statusCode: 200;
}
```

**Example Query:**
```typescript
// Get all Food purchases in 2025 on a specific card
GET /transactions?card=cm8vsfvyx0001wce8b40bhum2&purchaseCategory=Food&startDate=2025-01-01T00:00:00.000Z&endDate=2025-12-31T23:59:59.999Z
```

---

### POST `/transactions`
Create a new transaction (purchase).

**Request Body:**
```typescript
interface CreateTransactionDto {
  cardId: string;
  purchaseName: string;
  purchaseCategory: string;
  description?: string;
  amount: number;                    // Will be converted to Decimal
  installments: number;
  installmentValues?: number[];      // Must sum to amount, auto-divided if omitted
  purchaseDate?: string;             // ISO 8601, defaults to now
  dependentId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  result: {
    // Transaction object (same as GET response)
  };
  count: 1;
  statusCode: 201;
}
```

**Important Notes:**
- If `installmentValues` is not provided, the amount is divided equally
- The system auto-calculates `installmentDates` based on card's `payDay`
- Card's `availableLimit` is automatically updated

---

### GET `/transactions/search`
Find a specific transaction.

**Query Parameters:**
```typescript
interface FindOneTransactionQuery {
  id?: string;
  purchaseName?: string;
  dependentId?: string;
  cardId?: string;
  purchaseCategory?: string;
  description?: string;
  purchaseDate?: string;
}
```

**Response:** Single transaction object

---

### PUT `/transactions/:id`
Update a transaction.

**Request Body:**
```typescript
interface UpdateTransactionDto {
  purchaseName?: string;
  purchaseCategory?: string;
  description?: string;
  amount?: number;
  installments?: number;
  installmentValues?: number[];
  purchaseDate?: string;
  dependentId?: string;
}
```

**Response:** Updated transaction object

---

### DELETE `/transactions/:id`
Delete a transaction.

**Response:**
```typescript
{
  success: true;
  result: { transactionId: string };
  count: 1;
  statusCode: 200;
}
```

---

## Invoice Module

### GET `/invoice`
Get all invoices with optional filters.

**Query Parameters:**
```typescript
interface FindAllInvoicesQuery {
  cardId?: string;
  month?: number;                    // 1-12
  year?: number;                     // e.g., 2025
  status?: 'PENDING' | 'PAID' | 'OVERDUE';
}
```

**Response:**
```typescript
{
  success: true;
  result: Array<{
    id: string;
    cardId: string;
    userId: string;
    month: number;
    year: number;
    totalAmount: string;             // Sum of all installments for this month
    paidAmount: string;              // Amount paid so far
    dueDate: string;                 // ISO 8601
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    createdAt: string;
    editedAt: string | null;
    card: {
      name: string;
    };
  }>;
  count: number;
  statusCode: 200;
}
```

**Example Queries:**
```typescript
// Get all pending invoices
GET /invoice?status=PENDING

// Get invoices for a specific card in February 2025
GET /invoice?cardId=cm8vsfvyx0001wce8b40bhum2&month=2&year=2025

// Get all invoices for March 2025 across all cards
GET /invoice?month=3&year=2025
```

---

### GET `/invoice/search`
Find a specific invoice by ID or card+month+year.

**Query Parameters:**
```typescript
interface FindOneInvoiceQuery {
  id?: string;
  cardId?: string;     // Required with month and year
  month?: number;      // Required with cardId and year
  year?: number;       // Required with cardId and month
}
```

**Response:** Single invoice object

**Example:**
```typescript
// Search by ID
GET /invoice/search?id=a1b2c3d4-5678-90ab-cdef-1234567890ab

// Search by card + month + year
GET /invoice/search?cardId=cm8vsfvyx0001wce8b40bhum2&month=2&year=2025
```

---

### GET `/invoice/forecast`
Forecast invoices for the next X months.

**Query Parameters:**
```typescript
interface ForecastInvoicesQuery {
  months: number;        // Required: number of months ahead
  cardId?: string;       // Optional: filter by specific card
}
```

**Response:** Array of invoice objects (same structure as GET `/invoice`)

**Example:**
```typescript
// See next 6 months of invoices for all cards
GET /invoice/forecast?months=6

// See next 3 months for a specific card
GET /invoice/forecast?months=3&cardId=cm8vsfvyx0001wce8b40bhum2
```

**Use Cases:**
- "How much will I owe in 3 months?"
- "What are my upcoming expenses for the next 6 months?"
- Financial planning and budgeting

---

### PUT `/invoice/:id`
Update invoice payment information.

**Request Body:**
```typescript
interface UpdateInvoiceDto {
  paidAmount?: string;                      // Decimal string
  status?: 'PENDING' | 'PAID' | 'OVERDUE';
}
```

**Response:** Updated invoice object

**Auto-logic:**
- If `paidAmount >= totalAmount`, status automatically becomes `PAID`

---

### PATCH `/invoice/:id/mark-paid`
Quickly mark an invoice as paid.

**Request Body:**
```typescript
interface MarkInvoiceAsPaidDto {
  paidAmount?: string;   // Optional, defaults to totalAmount
}
```

**Response:** Updated invoice object (status will be `PAID`)

---

### POST `/invoice/update`
Recalculate all invoices based on current transactions.

**Use Case:** Run after bulk transaction operations to sync invoice data.

**Response:**
```typescript
{
  success: true;
  result: string[];  // Array of updated invoice IDs
  count: number;
  statusCode: 201;
}
```

---

## Categories Module

### GET `/categories`
Get all categories for the authenticated user.

**Response:**
```typescript
{
  success: true;
  result: Array<{
    name: string;
    icon: string;         // Emoji
    color: string;        // Hex color, e.g., "#FF5733"
    userId: string;
    createdAt: string;
    editedAt: string | null;
  }>;
  count: number;
  statusCode: 200;
}
```

**Default Categories (auto-created on signup):**
- 🍔 Food
- 🚗 Transport
- 🎬 Entertainment
- 🏥 Health
- 📚 Education

---

### POST `/categories`
Create a custom category.

**Request Body:**
```typescript
interface CreateCategoryDto {
  name: string;
  icon?: string;        // Emoji, defaults to "➕"
  color?: string;       // Hex color, defaults to "#000000"
}
```

**Response:**
```typescript
{
  success: true;
  result: {
    name: string;
    icon: string;
    color: string;
    userId: string;
    createdAt: string;
    editedAt: string;
  };
  count: 1;
  statusCode: 201;
}
```

---

### GET `/categories/search`
Find a specific category by name.

**Query Parameters:**
```typescript
interface FindOneCategoryQuery {
  name?: string;
}
```

**Response:** Single category object

---

### PATCH `/categories/:id`
Update a category.

**Request Body:**
```typescript
interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}
```

**Response:** Updated category object

---

### DELETE `/categories/:id`
Delete a category.

**Response:**
```typescript
{
  success: true;
  result: { category: string };
  count: 1;
  statusCode: 200;
}
```

---

## Dependents Module

### GET `/dependents`
Get all dependents for the authenticated user.

**Response:**
```typescript
{
  success: true;
  result: Array<{
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    editedAt: string | null;
  }>;
  count: number;
  statusCode: 200;
}
```

---

### POST `/dependents`
Create a new dependent.

**Request Body:**
```typescript
interface CreateDependentDto {
  name: string;
}
```

**Response:**
```typescript
{
  success: true;
  result: {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    editedAt: string;
  };
  count: 1;
  statusCode: 201;
}
```

---

### GET `/dependents/search`
Find a specific dependent.

**Query Parameters:**
```typescript
interface FindOneDependentQuery {
  id?: string;
  name?: string;
}
```

**Response:** Single dependent object

---

### PATCH `/dependents/:id`
Update a dependent.

**Request Body:**
```typescript
interface UpdateDependentDto {
  name: string;
}
```

**Response:** Updated dependent object

---

### DELETE `/dependents/:id`
Delete a dependent.

**Response:**
```typescript
{
  success: true;
  result: { dependentId: string };
  count: 1;
  statusCode: 200;
}
```

---

## TypeScript Interfaces

Complete type definitions for frontend integration:

```typescript
// ==================== ENUMS ====================

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

// ==================== BASE TYPES ====================

interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  result: T;
  count?: number;
}

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
}

// ==================== USER ====================

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  editedAt: string | null;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
}

interface UpdateUserRoleDto {
  userId: string;
  newRole: Role;
}

// ==================== AUTH ====================

interface LoginDto {
  email: string;
  password: string;
}

interface SignupDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface AuthSession {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      displayName: string;
      email: string;
      email_verified: boolean;
      phone: string;
      phone_verified: boolean;
      sub: string;
    };
    identities: Array<{
      identity_id: string;
      id: string;
      user_id: string;
      provider: string;
      email: string;
      created_at: string;
      updated_at: string;
    }>;
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  };
}

// ==================== CARD ====================

interface Card {
  id: string;
  userId: string;
  name: string;
  bank: string;
  flag: string;
  limit: string;
  dueDay: number;
  payDay: number;
  availableLimit: string;
  simulatedLimit: string;
  createdAt: string;
  editedAt: string | null;
}

interface CreateCardDto {
  name: string;
  bank: string;
  flag: string;
  limit: string;
  dueDay: number;
  payDay: number;
}

interface UpdateCardDto {
  name?: string;
  bank?: string;
  flag?: string;
  limit?: string;
  dueDay?: number;
  payDay?: number;
}

interface FindAllCardsQuery {
  flag?: string;
  bank?: string;
  dueDay?: number;
  payDay?: number;
  name?: string;
}

interface FindOneCardQuery {
  id?: string;
  name?: string;
  bank?: string;
}

// ==================== TRANSACTION ====================

interface Transaction {
  id: string;
  cardId: string;
  userId: string;
  dependentId: string | null;
  purchaseName: string;
  purchaseCategory: string;
  description: string | null;
  amount: string;
  purchaseDate: string;
  installments: number;
  installmentsValue: string[];
  installmentDates: string[];
  createdAt: string;
  editedAt: string | null;
  card?: {
    name: string;
  };
  dependent?: {
    name: string;
  } | null;
}

interface CreateTransactionDto {
  cardId: string;
  purchaseName: string;
  purchaseCategory: string;
  description?: string;
  amount: number;
  installments: number;
  installmentValues?: number[];
  purchaseDate?: string;
  dependentId?: string;
}

interface UpdateTransactionDto {
  purchaseName?: string;
  purchaseCategory?: string;
  description?: string;
  amount?: number;
  installments?: number;
  installmentValues?: number[];
  purchaseDate?: string;
  dependentId?: string;
}

interface FindAllTransactionsQuery {
  card?: string;
  dependent?: string;
  purchaseName?: string;
  purchaseCategory?: string;
  installments?: number;
  purchaseDate?: string;
  startDate?: string;
  endDate?: string;
  installmentDates?: string[];
}

interface FindOneTransactionQuery {
  id?: string;
  purchaseName?: string;
  dependentId?: string;
  cardId?: string;
  purchaseCategory?: string;
  description?: string;
  purchaseDate?: string;
}

// ==================== INVOICE ====================

interface Invoice {
  id: string;
  cardId: string;
  userId: string;
  month: number;
  year: number;
  totalAmount: string;
  paidAmount: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  editedAt: string | null;
  card?: {
    name: string;
  };
}

interface FindAllInvoicesQuery {
  cardId?: string;
  month?: number;
  year?: number;
  status?: InvoiceStatus;
}

interface FindOneInvoiceQuery {
  id?: string;
  cardId?: string;
  month?: number;
  year?: number;
}

interface UpdateInvoiceDto {
  paidAmount?: string;
  status?: InvoiceStatus;
}

interface MarkInvoiceAsPaidDto {
  paidAmount?: string;
}

interface ForecastInvoicesQuery {
  months: number;
  cardId?: string;
}

// ==================== CATEGORY ====================

interface Category {
  name: string;
  icon: string;
  color: string;
  userId: string;
  createdAt: string;
  editedAt: string | null;
}

interface CreateCategoryDto {
  name: string;
  icon?: string;
  color?: string;
}

interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}

interface FindOneCategoryQuery {
  name?: string;
}

// ==================== DEPENDENT ====================

interface Dependent {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  editedAt: string | null;
}

interface CreateDependentDto {
  name: string;
}

interface UpdateDependentDto {
  name: string;
}

interface FindOneDependentQuery {
  id?: string;
  name?: string;
}

// ==================== API CLIENT ====================

type ApiResponse<T> = BaseResponse<T> | ErrorResponse;

// Helper type for list responses
type ListResponse<T> = BaseResponse<T[]> & { count: number };
```

---

## Frontend Integration Examples

### 1. Setting up Axios Client

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### 2. Service Layer Pattern

```typescript
// services/cards.service.ts
import apiClient from '@/lib/axios';
import { Card, CreateCardDto, UpdateCardDto, FindAllCardsQuery } from '@/types/api';

export class CardsService {
  async getAll(filters?: FindAllCardsQuery): Promise<ListResponse<Card>> {
    const params = new URLSearchParams();
    if (filters?.flag) params.append('flag', filters.flag);
    if (filters?.bank) params.append('bank', filters.bank);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.dueDay) params.append('dueDay', String(filters.dueDay));
    if (filters?.payDay) params.append('payDay', String(filters.payDay));

    return apiClient.get(`/cards?${params.toString()}`);
  }

  async create(data: CreateCardDto): Promise<BaseResponse<Card>> {
    return apiClient.post('/cards', data);
  }

  async update(id: string, data: UpdateCardDto): Promise<BaseResponse<Card>> {
    return apiClient.patch(`/cards/${id}`, data);
  }

  async delete(id: string): Promise<BaseResponse<{ cardId: string }>> {
    return apiClient.delete(`/cards/${id}`);
  }
}

export const cardsService = new CardsService();
```

### 3. React Query Integration

```typescript
// hooks/useCards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsService } from '@/services/cards.service';
import type { CreateCardDto, UpdateCardDto, FindAllCardsQuery } from '@/types/api';

export function useCards(filters?: FindAllCardsQuery) {
  return useQuery({
    queryKey: ['cards', filters],
    queryFn: () => cardsService.getAll(filters),
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardDto) => cardsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardDto }) =>
      cardsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cardsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
```

### 4. React Component Example

```typescript
// components/CardsList.tsx
import { useCards, useDeleteCard } from '@/hooks/useCards';

export function CardsList() {
  const { data, isLoading, error } = useCards();
  const deleteCard = useDeleteCard();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>My Cards ({data.count})</h2>
      {data.result.map((card) => (
        <div key={card.id}>
          <h3>{card.name}</h3>
          <p>Bank: {card.bank}</p>
          <p>Flag: {card.flag}</p>
          <p>Limit: R$ {card.limit}</p>
          <p>Available: R$ {card.availableLimit}</p>
          <p>Due Day: {card.dueDay}</p>
          <p>Pay Day: {card.payDay}</p>
          <button onClick={() => deleteCard.mutate(card.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 5. Invoice Forecasting Example

```typescript
// hooks/useInvoiceForecast.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { Invoice, ForecastInvoicesQuery } from '@/types/api';

export function useInvoiceForecast(months: number, cardId?: string) {
  return useQuery({
    queryKey: ['invoice-forecast', months, cardId],
    queryFn: async () => {
      const params = new URLSearchParams({ months: String(months) });
      if (cardId) params.append('cardId', cardId);
      return apiClient.get<ListResponse<Invoice>>(`/invoice/forecast?${params}`);
    },
    enabled: months > 0,
  });
}

// Usage in component
function ForecastDashboard() {
  const { data } = useInvoiceForecast(6); // Next 6 months

  return (
    <div>
      <h2>6-Month Invoice Forecast</h2>
      {data?.result.map((invoice) => (
        <div key={invoice.id}>
          <p>{invoice.month}/{invoice.year}</p>
          <p>Total: R$ {invoice.totalAmount}</p>
          <p>Status: {invoice.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### 6. Transaction Filtering Example

```typescript
// hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { Transaction, FindAllTransactionsQuery } from '@/types/api';

export function useTransactions(filters?: FindAllTransactionsQuery) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.card) params.append('card', filters.card);
      if (filters?.dependent) params.append('dependent', filters.dependent);
      if (filters?.purchaseName) params.append('purchaseName', filters.purchaseName);
      if (filters?.purchaseCategory) params.append('purchaseCategory', filters.purchaseCategory);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.installments) params.append('installments', String(filters.installments));

      return apiClient.get<ListResponse<Transaction>>(`/transactions?${params}`);
    },
  });
}

// Usage: Get all Food purchases in 2025
function FoodExpenses() {
  const { data } = useTransactions({
    purchaseCategory: 'Food',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T23:59:59.999Z'
  });

  const total = data?.result.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  return (
    <div>
      <h2>Food Expenses 2025</h2>
      <p>Total: R$ {total.toFixed(2)}</p>
      <p>Transactions: {data?.count || 0}</p>
    </div>
  );
}
```

### 7. Form Handling with react-hook-form + Zod

```typescript
// schemas/card.schema.ts
import { z } from 'zod';

export const createCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bank: z.string().min(1, 'Bank is required'),
  flag: z.string().min(1, 'Flag is required'),
  limit: z.string().regex(/^\d+\.?\d{0,2}$/, 'Invalid decimal format'),
  dueDay: z.number().int().min(1).max(31),
  payDay: z.number().int().min(1).max(31),
});

export type CreateCardFormData = z.infer<typeof createCardSchema>;

// components/CreateCardForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCard } from '@/hooks/useCards';
import { createCardSchema, type CreateCardFormData } from '@/schemas/card.schema';

export function CreateCardForm() {
  const createCard = useCreateCard();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCardFormData>({
    resolver: zodResolver(createCardSchema),
  });

  const onSubmit = (data: CreateCardFormData) => {
    createCard.mutate(data, {
      onSuccess: () => {
        alert('Card created successfully!');
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Card name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('bank')} placeholder="Bank" />
      {errors.bank && <span>{errors.bank.message}</span>}

      <input {...register('flag')} placeholder="Flag (Visa, Mastercard)" />
      {errors.flag && <span>{errors.flag.message}</span>}

      <input {...register('limit')} placeholder="Limit (e.g., 5000.00)" />
      {errors.limit && <span>{errors.limit.message}</span>}

      <input type="number" {...register('dueDay', { valueAsNumber: true })} placeholder="Due day" />
      {errors.dueDay && <span>{errors.dueDay.message}</span>}

      <input type="number" {...register('payDay', { valueAsNumber: true })} placeholder="Pay day" />
      {errors.payDay && <span>{errors.payDay.message}</span>}

      <button type="submit" disabled={createCard.isPending}>
        {createCard.isPending ? 'Creating...' : 'Create Card'}
      </button>
    </form>
  );
}
```

---

## Frontend Feature Possibilities

Based on the available API endpoints, here are all the features a frontend can implement:

### 1. **User Management**
- User registration and login
- View/edit user profile
- Change password (via Supabase)
- Delete account
- Admin: View all users, change roles, delete users

### 2. **Credit Card Management**
- Add multiple credit cards
- View all cards with filtering (by bank, flag, due/pay day)
- Edit card details (name, limit, dates)
- Delete cards
- View real-time available limit
- Simulate different credit limits

### 3. **Transaction Tracking**
- Record purchases with installment support
- Assign purchases to specific cards
- Tag purchases with categories
- Associate purchases with dependents
- Search transactions by:
  - Card
  - Dependent
  - Category
  - Date range
  - Purchase name (partial match)
  - Number of installments
  - Specific installment dates
- View installment breakdown
- Edit/delete transactions (auto-updates card limit)

### 4. **Invoice Management**
- View current month's invoices
- View historical invoices
- **Forecast future invoices** (1-12 months ahead)
- Filter invoices by:
  - Card
  - Month/Year
  - Status (Pending/Paid/Overdue)
- Mark invoices as paid (partial or full)
- Track payment progress
- View due dates

### 5. **Category Management**
- Use 5 default categories (auto-created)
- Create custom categories with emoji icons and colors
- Edit/delete custom categories
- Color-code expenses

### 6. **Dependent Management**
- Add family members/dependents
- Track who made each purchase
- Filter expenses by dependent
- Edit/delete dependents

### 7. **Financial Analytics & Insights**
- **Spending by Category**: Total spent per category over time
- **Spending by Dependent**: Who spent what
- **Spending by Card**: Usage distribution across cards
- **Monthly Trends**: Track spending over months
- **Installment Calendar**: View which installments are due each month
- **Budget Forecasting**: See upcoming expenses for 6-12 months
- **Limit Utilization**: Card usage percentage
- **Payment Tracking**: Paid vs unpaid invoices

### 8. **Dashboard Views**
- Current month overview
- Total expenses across all cards
- Pending vs paid invoices
- Available credit across all cards
- Upcoming due dates
- Recent transactions
- Category breakdown (pie charts)
- Monthly spending trend (line charts)

### 9. **Search & Filtering**
- Advanced transaction search with multiple filters
- Invoice search by multiple criteria
- Quick filters (this month, last month, this year)
- Date range pickers
- Category/dependent dropdowns

### 10. **Data Visualization Possibilities**
- Pie chart: Spending by category
- Bar chart: Spending by card
- Line chart: Monthly spending trend
- Area chart: Projected vs actual spending
- Progress bars: Card limit utilization
- Calendar heat map: Transaction frequency
- Stacked bar: Spending by dependent per month

### 11. **Notifications & Reminders** (Frontend Only)
- Due date reminders
- Overdue invoice alerts
- High spending alerts
- Credit limit warnings

### 12. **Export & Reporting** (Frontend Only)
- Export transactions to CSV/Excel
- Generate monthly reports
- Print invoice summaries

### 13. **Multi-Card Comparison**
- Compare spending across cards
- See which card has best utilization
- Optimize card usage

### 14. **Installment Planner**
- View all active installments
- See payment schedule
- Calculate total committed amounts

---

## Important Notes for Frontend Developers

### 1. **Decimal Handling**
All monetary values are returned as **strings** (e.g., `"5000.00"`). Convert to numbers for calculations:
```typescript
const total = parseFloat(invoice.totalAmount);
```

### 2. **Date Formats**
- API expects: ISO 8601 strings (`2025-03-30T16:36:06.092Z`)
- `installmentDates`: Custom format `MM/YYYY` (e.g., `"02/2025"`)

### 3. **Cookie-Based Authentication**
- No need to manually manage tokens in localStorage
- Browser automatically sends cookies with `credentials: 'include'`
- Supabase session is synced with backend

### 4. **Error Handling**
All errors follow the `ErrorResponse` format. Check `statusCode` for specific errors:
- `400`: Validation error
- `401`: Not authenticated
- `403`: Not authorized (wrong role)
- `404`: Resource not found
- `500`: Server error

### 5. **Pagination**
Currently not implemented. All endpoints return full result sets. The `count` field indicates total records.

### 6. **Rate Limiting**
Not implemented. Implement client-side debouncing for search inputs.

### 7. **Real-time Updates**
Not implemented. Use polling or optimistic updates with React Query.

### 8. **File Uploads**
Not supported. No receipt/attachment storage.

### 9. **Currency**
All values assume BRL (Brazilian Real). No multi-currency support.

### 10. **Timezone**
All dates are in UTC. Convert to user's local timezone in the frontend.

---

## Complete API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Auth** ||||
| POST | `/auth/signup` | Create new user account | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/signout` | Logout user | Yes |
| **User** ||||
| GET | `/users/me` | Get current user profile | Yes |
| PATCH | `/users/me` | Update current user profile | Yes |
| DELETE | `/users/me` | Delete current user account | Yes |
| GET | `/users` | List all users | SUPER_ADMIN |
| PUT | `/users/change-role` | Change user role | SUPER_ADMIN |
| DELETE | `/users/delete/:id` | Delete specific user | SUPER_ADMIN |
| **Cards** ||||
| GET | `/cards` | List all cards with filters | Yes |
| POST | `/cards` | Create new card | Yes |
| GET | `/cards/search` | Find specific card | Yes |
| PATCH | `/cards/:id` | Update card | Yes |
| DELETE | `/cards/:id` | Delete card | Yes |
| **Transactions** ||||
| GET | `/transactions` | List all transactions with filters | Yes |
| POST | `/transactions` | Create new transaction | Yes |
| GET | `/transactions/search` | Find specific transaction | Yes |
| PUT | `/transactions/:id` | Update transaction | Yes |
| DELETE | `/transactions/:id` | Delete transaction | Yes |
| **Invoice** ||||
| GET | `/invoice` | List invoices with filters | Yes |
| GET | `/invoice/search` | Find specific invoice | Yes |
| GET | `/invoice/forecast` | Forecast future invoices | Yes |
| PUT | `/invoice/:id` | Update invoice payment | Yes |
| PATCH | `/invoice/:id/mark-paid` | Mark invoice as paid | Yes |
| POST | `/invoice/update` | Recalculate all invoices | Yes |
| **Categories** ||||
| GET | `/categories` | List all categories | Yes |
| POST | `/categories` | Create new category | Yes |
| GET | `/categories/search` | Find specific category | Yes |
| PATCH | `/categories/:id` | Update category | Yes |
| DELETE | `/categories/:id` | Delete category | Yes |
| **Dependents** ||||
| GET | `/dependents` | List all dependents | Yes |
| POST | `/dependents` | Create new dependent | Yes |
| GET | `/dependents/search` | Find specific dependent | Yes |
| PATCH | `/dependents/:id` | Update dependent | Yes |
| DELETE | `/dependents/:id` | Delete dependent | Yes |

---

**Total Endpoints:** 34
**Public Endpoints:** 2 (`/auth/login`, `/auth/signup`)
**Protected Endpoints:** 32
**Admin-Only Endpoints:** 3

---

## Swagger Documentation

For interactive API testing and detailed request/response examples, visit:
```
http://localhost:3001/api
```

The Swagger UI provides:
- Try-it-out functionality
- Request/response examples
- Schema definitions
- Authentication testing
- Error response examples

---

**Last Updated:** 2025-01-24
**API Version:** 1.0
**Backend Framework:** NestJS 11
**Database:** PostgreSQL (Prisma 6)
**Authentication:** Supabase Auth + JWT
