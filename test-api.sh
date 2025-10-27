#!/bin/bash

# Credit Card Planner API Test Script
# This script tests all API endpoints

BASE_URL="http://localhost:3001"
EMAIL="felippe1000@hotmail.com"
PASSWORD="809070"

echo "======================================"
echo "Credit Card Planner API Test"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}======================================"
    echo -e "$1"
    echo -e "======================================${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# ======================
# 1. AUTHENTICATION
# ======================
print_section "1. TESTING AUTHENTICATION"

print_info "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt)

echo "$LOGIN_RESPONSE" | head -c 500
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    print_success "Login successful"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    print_error "Login failed"
    exit 1
fi

# Extract cookies from cookie file
if [ -f cookies.txt ]; then
    print_success "Cookies saved"
else
    print_error "No cookies saved"
fi

# ======================
# 2. CATEGORIES
# ======================
print_section "2. TESTING CATEGORIES"

print_info "Getting all categories..."
curl -s -X GET "$BASE_URL/categories" \
  -b cookies.txt | head -c 500
echo ""

print_info "Creating a new category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Category",
    "icon": "🧪",
    "color": "#FF5733"
  }')

echo "$CATEGORY_RESPONSE" | head -c 500
echo ""

CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$CATEGORY_ID" ]; then
    print_success "Category created with ID: $CATEGORY_ID"

    print_info "Getting category by ID..."
    curl -s -X GET "$BASE_URL/categories/$CATEGORY_ID" \
      -b cookies.txt | head -c 500
    echo ""

    print_info "Updating category..."
    curl -s -X PATCH "$BASE_URL/categories/$CATEGORY_ID" \
      -H "Content-Type: application/json" \
      -b cookies.txt \
      -d '{
        "name": "Updated Test Category",
        "icon": "✅",
        "color": "#00FF00"
      }' | head -c 500
    echo ""
else
    print_error "Failed to create category"
fi

# ======================
# 3. DEPENDENTS
# ======================
print_section "3. TESTING DEPENDENTS"

print_info "Getting all dependents..."
curl -s -X GET "$BASE_URL/dependents" \
  -b cookies.txt | head -c 500
echo ""

print_info "Creating a new dependent..."
DEPENDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/dependents" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Dependent"
  }')

echo "$DEPENDENT_RESPONSE" | head -c 500
echo ""

DEPENDENT_ID=$(echo "$DEPENDENT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$DEPENDENT_ID" ]; then
    print_success "Dependent created with ID: $DEPENDENT_ID"

    print_info "Getting dependent by ID..."
    curl -s -X GET "$BASE_URL/dependents/$DEPENDENT_ID" \
      -b cookies.txt | head -c 500
    echo ""

    print_info "Updating dependent..."
    curl -s -X PATCH "$BASE_URL/dependents/$DEPENDENT_ID" \
      -H "Content-Type: application/json" \
      -b cookies.txt \
      -d '{
        "name": "Updated Test Dependent"
      }' | head -c 500
    echo ""
else
    print_error "Failed to create dependent"
fi

# ======================
# 4. CARDS
# ======================
print_section "4. TESTING CARDS"

print_info "Getting all cards..."
curl -s -X GET "$BASE_URL/cards" \
  -b cookies.txt | head -c 500
echo ""

print_info "Creating a new card..."
CARD_RESPONSE=$(curl -s -X POST "$BASE_URL/cards" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Credit Card",
    "bank": "Test Bank",
    "flag": "Visa",
    "limit": 5000.00,
    "dueDay": 5,
    "payDay": 10
  }')

echo "$CARD_RESPONSE" | head -c 500
echo ""

CARD_ID=$(echo "$CARD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$CARD_ID" ]; then
    print_success "Card created with ID: $CARD_ID"

    print_info "Getting card by ID..."
    curl -s -X GET "$BASE_URL/cards/$CARD_ID" \
      -b cookies.txt | head -c 500
    echo ""

    print_info "Updating card..."
    curl -s -X PATCH "$BASE_URL/cards/$CARD_ID" \
      -H "Content-Type: application/json" \
      -b cookies.txt \
      -d '{
        "name": "Updated Test Credit Card",
        "limit": 7500.00
      }' | head -c 500
    echo ""
else
    print_error "Failed to create card"
fi

# ======================
# 5. TRANSACTIONS
# ======================
print_section "5. TESTING TRANSACTIONS"

print_info "Getting all transactions..."
curl -s -X GET "$BASE_URL/transactions" \
  -b cookies.txt | head -c 500
echo ""

if [ ! -z "$CARD_ID" ] && [ ! -z "$CATEGORY_ID" ]; then
    print_info "Creating a new transaction..."
    TRANSACTION_RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
      -H "Content-Type: application/json" \
      -b cookies.txt \
      -d "{
        \"cardId\": \"$CARD_ID\",
        \"purchaseName\": \"Test Purchase\",
        \"amount\": 299.99,
        \"purchaseDate\": \"2025-01-15\",
        \"installments\": 3,
        \"purchaseCategory\": \"Test Category\",
        \"dependentId\": \"$DEPENDENT_ID\"
      }")

    echo "$TRANSACTION_RESPONSE" | head -c 500
    echo ""

    TRANSACTION_ID=$(echo "$TRANSACTION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ ! -z "$TRANSACTION_ID" ]; then
        print_success "Transaction created with ID: $TRANSACTION_ID"

        print_info "Getting transaction by ID..."
        curl -s -X GET "$BASE_URL/transactions/$TRANSACTION_ID" \
          -b cookies.txt | head -c 500
        echo ""

        print_info "Updating transaction..."
        curl -s -X PATCH "$BASE_URL/transactions/$TRANSACTION_ID" \
          -H "Content-Type: application/json" \
          -b cookies.txt \
          -d '{
            "purchaseName": "Updated Test Purchase",
            "amount": 349.99
          }' | head -c 500
        echo ""
    else
        print_error "Failed to create transaction"
    fi
else
    print_error "Cannot create transaction without card and category"
fi

# ======================
# 6. INVOICES
# ======================
print_section "6. TESTING INVOICES"

print_info "Getting all invoices..."
curl -s -X GET "$BASE_URL/invoice" \
  -b cookies.txt | head -c 500
echo ""

print_info "Calculating invoices..."
curl -s -X POST "$BASE_URL/invoice/calculate" \
  -b cookies.txt | head -c 500
echo ""

if [ ! -z "$CARD_ID" ]; then
    print_info "Getting invoices by card..."
    curl -s -X GET "$BASE_URL/invoice?cardId=$CARD_ID" \
      -b cookies.txt | head -c 500
    echo ""

    print_info "Getting invoices by month..."
    curl -s -X GET "$BASE_URL/invoice?month=1&year=2025" \
      -b cookies.txt | head -c 500
    echo ""
fi

# ======================
# 7. USERS
# ======================
print_section "7. TESTING USERS"

print_info "Getting all users..."
curl -s -X GET "$BASE_URL/users" \
  -b cookies.txt | head -c 500
echo ""

print_info "Getting users with pagination..."
curl -s -X GET "$BASE_URL/users?page=1&limit=5&sortBy=name&sortOrder=asc" \
  -b cookies.txt | head -c 500
echo ""

# ======================
# 8. TESTING FILTERS & PAGINATION
# ======================
print_section "8. TESTING FILTERS & PAGINATION"

print_info "Testing transaction filters..."
curl -s -X GET "$BASE_URL/transactions?page=1&limit=10&sortBy=purchaseDate&sortOrder=desc" \
  -b cookies.txt | head -c 500
echo ""

if [ ! -z "$CARD_ID" ]; then
    print_info "Testing transaction filter by card..."
    curl -s -X GET "$BASE_URL/transactions?cardId=$CARD_ID" \
      -b cookies.txt | head -c 500
    echo ""
fi

print_info "Testing cards with pagination..."
curl -s -X GET "$BASE_URL/cards?page=1&limit=5&sortBy=name&sortOrder=asc" \
  -b cookies.txt | head -c 500
echo ""

# ======================
# CLEANUP & SUMMARY
# ======================
print_section "9. TEST SUMMARY"

print_success "Authentication tests completed"
print_success "Category CRUD operations completed"
print_success "Dependent CRUD operations completed"
print_success "Card CRUD operations completed"
print_success "Transaction CRUD operations completed"
print_success "Invoice operations completed"
print_success "User operations completed"
print_success "Pagination & filtering tests completed"

echo ""
print_info "Created resources:"
[ ! -z "$CATEGORY_ID" ] && echo "  - Category ID: $CATEGORY_ID"
[ ! -z "$DEPENDENT_ID" ] && echo "  - Dependent ID: $DEPENDENT_ID"
[ ! -z "$CARD_ID" ] && echo "  - Card ID: $CARD_ID"
[ ! -z "$TRANSACTION_ID" ] && echo "  - Transaction ID: $TRANSACTION_ID"

echo ""
print_section "TEST COMPLETED"

# Cleanup
rm -f cookies.txt

echo "Note: Some resources were created during testing."
echo "You may want to delete them manually if needed."
echo ""
