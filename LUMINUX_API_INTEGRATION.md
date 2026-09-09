# Luminux Showroom API Documentation

**Base URL:** `/api/internal`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Dashboard](#dashboard)
2. [Profit](#profit)
3. [Loss](#loss)
4. [Sales](#sales)
5. [Purchase](#purchase)
6. [Products](#products)
7. [Customers](#customers)
8. [Suppliers](#suppliers)
9. [Expenses](#expenses)
10. [Accounts](#accounts)
11. [Global Config](#global-config)
12. [Payments](#payments)

---

## Dashboard

### Get Dashboard Stats

**Endpoint:** `GET /internal/dashboard`  
**Description:** Get dashboard statistics including sales, purchases, profit/loss data

**Query Parameters:**

```typescript
{
  days?: number;        // Number of days (default: 7)
  startDate?: string;   // Format: YYYY-MM-DD (e.g., "2026-09-01")
  endDate?: string;     // Format: YYYY-MM-DD (e.g., "2026-09-30")
  recentLimit?: number; // Recent sales limit (default: 5)
}
```

**Response:**

```typescript
{
  todaySales: {
    amount: number;      // Total sales amount today
    count: number;       // Number of sales today
  };
  lifetimeSales: {
    amount: number;      // Total sales amount all time
    count: number;       // Number of sales all time
  };
  todayPurchase: {
    amount: number;      // Total purchase amount today
    count: number;       // Number of purchases today
  };
  todayExpense: {
    amount: number;      // Total expense amount today
    count: number;       // Number of expenses today
  };
  totalProducts: number;           // Total active products count
  totalProductsValuation: number; // Total valuation of all products (stock * sourcingPrice)
  recentSales: Sale[];            // Recent sales with full relations
  salesChart: Array<{
    date: string;      // YYYY-MM-DD format
    amount: number;    // Total sales amount for this date
    count: number;     // Number of sales for this date
  }>;
  profitChart: Array<{
    date: string;      // YYYY-MM-DD format
    profit: number;    // Profit amount for this date
  }>;
}
```

---

## Profit

### Get Profit List

**Endpoint:** `GET /internal/profit`  
**Description:** Get paginated list of profit entries (sales with profit > 0)

**Query Parameters:**

```typescript
{
  page?: string;        // Page number (default: "1")
  limit?: string;       // Items per page (default: "10")
  startDate?: string;   // Format: YYYY-MM-DD
  endDate?: string;     // Format: YYYY-MM-DD
  paymentMethod?: ENUM_PAYMENT_METHODS; // CASH, BKASH, NAGAD, ROCKET, UPAY, BANK
}
```

**Response:**

```typescript
{
  message: string; // "Profits fetched successfully"
  data: Array<{
    id: string; // Sale UUID
    invoiceNo?: string; // Invoice number
    date: Date; // Sale date
    revenue: number; // Sale grand total
    totalCost: number; // Cost of goods sold (sourcing price * quantity)
    profit: number; // Revenue - totalCost (positive for profitable sales)
    paymentMethod: ENUM_PAYMENT_METHODS;
    customerId?: string;
    customerName?: string;
  }>;
  meta: {
    total: number; // Total count of profitable sales
    page: number; // Current page
    limit: number; // Items per page
    skip: number; // Items skipped
  }
}
```

### Get Profit Stats

**Endpoint:** `GET /internal/profit/stats`  
**Description:** Get profit statistics summary

**Query Parameters:** Same as profit list

**Response:**

```typescript
{
  totalIncome: number; // Total sales revenue
  totalCostOfGoodsSold: number; // Total cost of sold items
  totalSalesProfit: number; // Income - cost of goods sold
  totalExpense: number; // Total expenses
  totalPurchase: number; // Total purchase amounts
  netProfit: number; // totalSalesProfit - totalExpense
}
```

---

## Loss

### Get Loss List

**Endpoint:** `GET /internal/loss`  
**Description:** Get paginated list of loss entries (sales with profit < 0)

**Query Parameters:** Same as profit list

**Response:**

```typescript
{
  message: string; // "Losses fetched successfully"
  data: Array<{
    id: string; // Sale UUID
    invoiceNo?: string; // Invoice number
    date: Date; // Sale date
    revenue: number; // Sale grand total
    totalCost: number; // Cost of goods sold (sourcing price * quantity)
    profit: number; // Revenue - totalCost (negative for loss-making sales)
    paymentMethod: ENUM_PAYMENT_METHODS;
    customerId?: string;
    customerName?: string;
  }>;
  meta: {
    total: number; // Total count of loss-making sales
    page: number; // Current page
    limit: number; // Items per page
    skip: number; // Items skipped
  }
}
```

### Get Loss Stats

**Endpoint:** `GET /internal/loss/stats`  
**Description:** Get loss statistics summary

**Query Parameters:** Same as profit list

**Response:**

```typescript
{
  totalLoss: number; // Total loss amount (positive magnitude)
  totalLossCount: number; // Number of loss-making sales
}
```

---

## Sales

### Create Sale

**Endpoint:** `POST /internal/sales`  
**Description:** Create a new sale

**Request Body:**

```typescript
{
  date: Date;                    // Required: "2026-09-05"
  customerId: string;            // Required: customer UUID
  items: SaleItemDTO[];          // Required: array of sale items
  discount: number;              // Required: default 0
  paidAmount: number;            // Required: e.g., 5000
  paymentMethod: ENUM_PAYMENT_METHODS; // Required: CASH, BKASH, etc.
  soldById: string;              // Required: user UUID who made the sale
  createdBy?: string;           // Optional: user UUID
}
```

**SaleItemDTO:**

```typescript
{
  productId: string;            // Required: product UUID
  variantId?: string;            // Optional: product variant UUID
  quantity: number;              // Required: e.g., 5
  sellingPrice: number;         // Required: unit price for this sale
}
```

**Response:**

```typescript
{
  id: string;
  date: Date;
  invoiceNo?: string;
  invoiceUrl?: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    customerType: ENUM_CUSTOMER_TYPES;
    contactNumber: string;
    email?: string;
    address?: string;
    companyName?: string;
  };
  items?: Array<{
    id: string;
    productId: string;
    product?: {
      id: string;
      title: string;
      productCode: string;
      sellingPrice: number;
      stock: number;
    };
    variantId?: string;
    variant?: {
      id: string;
      title: string;
    };
    quantity: number;
    sellingPrice: number;
    sourcingPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  dueAmount: number;
  soldById: string;
  soldBy?: {
    id: string;
    phoneNumber: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Sales List

**Endpoint:** `GET /internal/sales`  
**Description:** Get paginated list of sales with filters

**Query Parameters:**

```typescript
{
  // BaseFilterDTO fields:
  page?: number;                 // Default: 1
  limit?: number;                // Default: 10
  searchTerm?: string;          // Search term
  startDate?: string;           // Format: YYYY-MM-DD
  endDate?: string;             // Format: YYYY-MM-DD
  sortBy?: string;              // Default: "createdAt"
  sortOrder?: 'ASC' | 'DESC';   // Default: "DESC"

  // Sales specific:
  customerId?: string;          // Filter by customer UUID
  soldById?: string;            // Filter by seller UUID
  paymentMethod?: ENUM_PAYMENT_METHODS;
}
```

**Response:**

```typescript
{
  data: Sale[];  // Same structure as single Sale response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Sale Invoice PDF

**Endpoint:** `GET /internal/sales/:id/invoice`  
**Description:** Generate and return sale invoice as PDF

**Response:** PDF file (application/pdf)

### Get Sale by ID

**Endpoint:** `GET /internal/sales/:id`  
**Description:** Get single sale details

**Response:** Same as single Sale response structure

### Update Sale

**Endpoint:** `PATCH /internal/sales/:id`  
**Description:** Update existing sale

**Request Body:** `UpdateSaleDTO` (partial of CreateSaleDTO)

**Response:** Same as single Sale response structure

### Delete Sale

**Endpoint:** `DELETE /internal/sales/:id`  
**Description:** Delete a sale

**Response:** Deletion confirmation

---

## Purchase

### Create Purchase

**Endpoint:** `POST /internal/purchase`  
**Description:** Create a new purchase

**Request Body:**

```typescript
{
  purchaseDate: Date;           // Required: "2026-09-05"
  purchaseType: string;         // Required: e.g., "Bangladesh"
  supplierId: string;           // Required: supplier UUID
  items: PurchaseItemDTO[];     // Required: array of purchase items
  paidAmount: number;           // Required: e.g., 8000
  paymentMethod: ENUM_PAYMENT_METHODS; // Required
  purchasedById: string;        // Required: user UUID
  createdBy?: string;           // Optional
}
```

**PurchaseItemDTO:**

```typescript
{
  productId?: string;           // Optional: existing product UUID
  variantId?: string;           // Optional: variant UUID (with productId)
  productName?: string;         // Optional: for new products
  productCode?: string;         // Optional: manual product code
  quantity: number;             // Required: e.g., 10
  totalProductCost: number;     // Required: e.g., 1000
  otherCost: number;            // Required: e.g., 200
}
```

**Response:**

```typescript
{
  id: string;
  purchaseDate: Date;
  purchaseType: string;
  supplierId: string;
  supplier?: {
    id: string;
    companyName: string;
    contactPerson?: string;
    contactNumber: string;
    email?: string;
    address?: string;
  };
  items?: Array<{
    id: string;
    productId?: string;
    product?: {
      id: string;
      title: string;
      productCode: string;
    };
    variantId?: string;
    productName?: string;
    productCode?: string;
    quantity: number;
    totalProductCost: number;
    otherCost: number;
    totalCost: number;
  }>;
  totalQuantity: number;
  totalPurchaseAmount: number;
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  dueAmount: number;
  purchasedById: string;
  purchasedBy?: {
    id: string;
    phoneNumber: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Purchases List

**Endpoint:** `GET /internal/purchase`  
**Description:** Get paginated list of purchases

**Query Parameters:**

```typescript
{
  // BaseFilterDTO fields
  page?: number;
  limit?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Purchase specific:
  supplierId?: string;          // Filter by supplier UUID
  paymentMethod?: ENUM_PAYMENT_METHODS;
}
```

**Response:**

```typescript
{
  data: Purchase[];  // Same structure as single Purchase response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Purchase by ID

**Endpoint:** `GET /internal/purchase/:id`  
**Description:** Get single purchase details

**Response:** Same as single Purchase response structure

### Update Purchase

**Endpoint:** `PATCH /internal/purchase/:id`  
**Description:** Update existing purchase

**Request Body:** `UpdatePurchaseDTO`

**Response:** Same as single Purchase response structure

### Delete Purchase

**Endpoint:** `DELETE /internal/purchase/:id`  
**Description:** Delete a purchase

**Response:** Deletion confirmation

---

## Products

### Create Product

**Endpoint:** `POST /internal/products`  
**Description:** Create a new product

**Request Body:**

```typescript
{
  title: string;                // Required: e.g., "Rice 25kg"
  description?: string;        // Optional
  sourcingPrice?: number;      // Optional: e.g., 0
  sellingPrice?: number;       // Optional: e.g., 0
  thumbnail?: string;           // Optional: image URL
  productCode: string;          // Required: e.g., "PRD-1001"
  stock?: number;               // Optional: e.g., 20
  variants?: ProductVariantOptionDTO[]; // Optional
  createdBy?: any;             // Optional
}
```

**ProductVariantOptionDTO:**

```typescript
{
  variantId: string;            // Required: variant UUID
  variantOptionId: string;      // Required: variant option UUID
  sku?: string;                 // Optional: e.g., "SKU-001"
  sellingPrice?: number;        // Optional: e.g., 450
  stockQuantity?: number;       // Optional: e.g., 10
  position?: number;            // Optional: e.g., 1
}
```

**Response:**

```typescript
{
  id: string;
  title: string;
  description?: string;
  sourcingPrice: number;
  sellingPrice: number;
  thumbnail?: string;
  productCode: string;
  stock: number;
  saleQuantity: number;
  averageB2BSalesPrice: number;
  averageB2CSalesPrice: number;
  b2bSoldQuantity: number;
  b2cSoldQuantity: number;
  variants?: Array<{
    id: string;
    variantId: string;
    variantOptionId: string;
    variant?: {
      id: string;
      title: string;
    };
    variantOption?: {
      id: string;
      title: string;
    };
    sku?: string;
    sellingPrice?: number;
    stockQuantity?: number;
    position?: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Products List

**Endpoint:** `GET /internal/products`  
**Description:** Get paginated list of products

**Query Parameters:**

```typescript
{
  // BaseFilterDTO fields
  page?: number;
  limit?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Product specific:
  stock?: number;               // Filter by stock quantity
  sourcingPrice?: number;        // Filter by sourcing price
  sellingPrice?: number;        // Filter by selling price
  productCode?: string;          // Filter by product code
}
```

**Response:**

```typescript
{
  data: Product[];  // Same structure as single Product response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Product by Code

**Endpoint:** `GET /internal/products/by-code/:productCode`  
**Description:** Find product by product code

**Response:** Same as single Product response structure

### Get Product by ID

**Endpoint:** `GET /internal/products/:id`  
**Description:** Get single product details

**Response:** Same as single Product response structure

### Update Product

**Endpoint:** `PATCH /internal/products/:id`  
**Description:** Update existing product

**Request Body:** `ProductUpdateDTO`

**Response:** Same as single Product response structure

### Delete Product

**Endpoint:** `DELETE /internal/products/:id`  
**Description:** Delete a product

**Response:** `SuccessResponse`

---

## Customers

### Create Customer

**Endpoint:** `POST /internal/customer`  
**Description:** Create a new customer

**Request Body:**

```typescript
{
  name: string;                 // Required: e.g., "John Doe"
  customerType: ENUM_CUSTOMER_TYPES; // Required: B2B or B2C
  contactNumber: string;        // Required: e.g., "1234567890"
  email?: string;               // Optional: email format
  address?: string;             // Optional
  companyName?: string;         // Optional
  createdBy?: any;              // Optional
}
```

**ENUM_CUSTOMER_TYPES:** `B2B` (business customer), `B2C` (retail customer)

**Response:**

```typescript
{
  id: string;
  name: string;
  customerType: ENUM_CUSTOMER_TYPES; // B2B or B2C
  contactNumber: string;
  email?: string;
  address?: string;
  companyName?: string;
  sales?: Sale[];  // Related sales
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Customers List

**Endpoint:** `GET /internal/customer`  
**Description:** Get paginated list of customers

**Query Parameters:**

```typescript
{
  // BaseFilterDTO fields
  page?: number;
  limit?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Customer specific:
  customerType?: ENUM_CUSTOMER_TYPES; // B2B or B2C
}
```

**Response:**

```typescript
{
  data: Customer[];  // Same structure as single Customer response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Customer by ID

**Endpoint:** `GET /internal/customer/:id`  
**Description:** Get single customer details

**Response:** Same as single Customer response structure

### Update Customer

**Endpoint:** `PATCH /internal/customer/:id`  
**Description:** Update existing customer

**Request Body:** `UpdateCustomerDTO`

**Response:** Same as single Customer response structure

### Delete Customer

**Endpoint:** `DELETE /internal/customer/:id`  
**Description:** Delete a customer

**Response:** Deletion confirmation

---

## Suppliers

### Create Supplier

**Endpoint:** `POST /internal/supplier`  
**Description:** Create a new supplier

**Request Body:**

```typescript
{
  companyName: string;          // Required: e.g., "ABC Company"
  contactPerson?: string;       // Optional: e.g., "John Doe"
  contactNumber: string;        // Required: e.g., "1234567890"
  email?: string;               // Optional: email format
  address?: string;             // Optional
  createdBy?: string;           // Optional
}
```

**Response:**

```typescript
{
  id: string;
  companyName: string;
  contactPerson?: string;
  contactNumber: string;
  email?: string;
  address?: string;
  purchases?: Purchase[];  // Related purchases
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Suppliers List

**Endpoint:** `GET /internal/supplier`  
**Description:** Get paginated list of suppliers

**Query Parameters:** `BaseFilterDTO` (standard pagination and search)

**Response:**

```typescript
{
  data: Supplier[];  // Same structure as single Supplier response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Supplier by ID

**Endpoint:** `GET /internal/supplier/:id`  
**Description:** Get single supplier details

**Response:** Same as single Supplier response structure

### Update Supplier

**Endpoint:** `PATCH /internal/supplier/:id`  
**Description:** Update existing supplier

**Request Body:** `UpdateSupplierDTO`

**Response:** Same as single Supplier response structure

### Delete Supplier

**Endpoint:** `DELETE /internal/supplier/:id`  
**Description:** Delete a supplier

**Response:** Deletion confirmation

---

## Expenses

### Create Expense

**Endpoint:** `POST /internal/expense`  
**Description:** Create a new expense

**Request Body:**

```typescript
{
  date: Date;                   // Required: e.g., "2025-10-09"
  purpose: string;              // Required: e.g., "Office rent"
  amountSpent: number;          // Required: e.g., 1000
  paymentMethod: ENUM_PAYMENT_METHODS; // Required
  spentBy: string;              // Required: e.g., "John Doe"
  createdBy?: any;              // Optional
}
```

**Response:**

```typescript
{
  id: string;
  date: Date;
  purpose: string;
  amountSpent: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  spentBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Expenses List

**Endpoint:** `GET /internal/expense`  
**Description:** Get paginated list of expenses

**Query Parameters:**

```typescript
{
  // BaseFilterDTO fields
  page?: number;
  limit?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Expense specific:
  spentBy?: string;             // Filter by who spent
  paymentMethod?: ENUM_PAYMENT_METHODS;
}
```

**Response:**

```typescript
{
  data: Expense[];  // Same structure as single Expense response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Expense by ID

**Endpoint:** `GET /internal/expense/:id`  
**Description:** Get single expense details

**Response:** Same as single Expense response structure

### Update Expense

**Endpoint:** `PATCH /internal/expense/:id`  
**Description:** Update existing expense

**Request Body:** `UpdateExpenseDTO`

**Response:** Same as single Expense response structure

### Delete Expense

**Endpoint:** `DELETE /internal/expense/:id`  
**Description:** Delete an expense

**Response:** Deletion confirmation

---

## Accounts

### Get Account Balances

**Endpoint:** `GET /internal/accounts/balances`  
**Description:** Get current balances for all payment methods/accounts

**Response:**

```typescript
{
  totalBalance: number; // Sum of all account balances
  accounts: Array<{
    paymentMethod: ENUM_PAYMENT_METHODS; // CASH, BKASH, NAGAD, ROCKET, UPAY, BANK
    balance: number; // Current balance for this payment method
  }>;
}
```

### Get Account Transactions

**Endpoint:** `GET /internal/accounts/transactions`  
**Description:** Get account transactions with filters (unified view of all money movements)

**Query Parameters:**

```typescript
{
  accountType?: ENUM_PAYMENT_METHODS; // CASH, BKASH, NAGAD, ROCKET, UPAY, BANK
  transactionType?: ENUM_TRANSACTION_TYPES; // CASH_IN, CASH_OUT
  startDate?: string;           // Format: YYYY-MM-DD
  endDate?: string;             // Format: YYYY-MM-DD
  page?: number;                // Default: 1
  limit?: number;               // Default: 20
}
```

**ENUM_TRANSACTION_TYPES:**

- `CASH_IN`: Money coming in (sales, collections)
- `CASH_OUT`: Money going out (purchases, expenses, supplier payments)

**Response:**

```typescript
{
  data: Array<{
    id: string;
    transactionDate: Date;
    transactionType: ENUM_TRANSACTION_TYPES; // CASH_IN or CASH_OUT
    paymentMethod: ENUM_PAYMENT_METHODS;
    amount: number;
    referenceType: "sale" | "purchase" | "expense" | "payment";
    referenceId: string;
    description: string;
    entityType?: string; // 'customer' or 'supplier' for payments
  }>;
  total: number; // Total transaction count
  page: number;
  limit: number;
  skip: number;
  totalCashIn: number; // Total cash in amount
  totalCashOut: number; // Total cash out amount
}
```

---

## Payments

### Create Payment

**Endpoint:** `POST /internal/payments`  
**Description:** Create a new payment record (collection from customer or payment to supplier)

**Request Body:**

```typescript
{
  amount: number;              // Required: payment amount
  entityType: string;          // Required: "customer" or "supplier"
  entityId: string;            // Required: customer or supplier UUID
  paymentMethod: ENUM_PAYMENT_METHODS; // Required
  paymentDate: Date;           // Required: payment date
  referenceId?: string;         // Optional: sale or purchase UUID
  referenceType?: string;      // Optional: "sale" or "purchase"
  note?: string;               // Optional: payment note
}
```

**Response:**

```typescript
{
  id: string;
  amount: number;
  entityType: string;          // "customer" or "supplier"
  entityId: string;
  paymentMethod: ENUM_PAYMENT_METHODS;
  paymentDate: Date;
  referenceId?: string;
  referenceType?: string;
  note?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Get Payments List

**Endpoint:** `GET /internal/payments`  
**Description:** Get paginated list of payments

**Query Parameters:** `FilterPaymentDTO`

**Response:**

```typescript
{
  data: Payment[];  // Same structure as single Payment response
  meta: {
    total: number;
    page: number;
    limit: number;
    skip: number;
  };
}
```

### Get Payment by ID

**Endpoint:** `GET /internal/payments/:id`  
**Description:** Get single payment details

**Response:** Same as single Payment response structure

### Update Payment

**Endpoint:** `PATCH /internal/payments/:id`  
**Description:** Update existing payment

**Request Body:** `UpdatePaymentDTO` (partial update)

**Response:** Same as single Payment response structure

### Delete Payment

**Endpoint:** `DELETE /internal/payments/:id`  
**Description:** Delete a payment

**Response:** Deletion confirmation

---

## Enums Reference

### ENUM_PAYMENT_METHODS

- `CASH`
- `BKASH`
- `NAGAD`
- `ROCKET`
- `UPAY`
- `BANK`

### ENUM_CUSTOMER_TYPES

- `B2B` - Business customer
- `B2C` - Retail customer

### ENUM_TRANSACTION_TYPES

- `CASH_IN` - Money coming in (sales, collections)
- `CASH_OUT` - Money going out (purchases, expenses, supplier payments)

---

## Base Filter DTO (Common Fields)

All list endpoints support these common query parameters:

```typescript
{
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 10)
  searchTerm?: string;        // Search across text fields
  startDate?: string;         // Format: YYYY-MM-DD
  endDate?: string;           // Format: YYYY-MM-DD
  sortBy?: string;            // Field to sort by (default: "createdAt")
  sortOrder?: 'ASC' | 'DESC'; // Sort direction (default: "DESC")
  isActive?: boolean;         // Filter by active status
  initialLoadIds?: string[];  // JSON array of UUIDs for initial load
}
```

---

## Standard Response Format

### SuccessResponse

```typescript
{
  data: T;                    // Response data
  message?: string;          // Optional message
  statusCode: number;        // HTTP status code
  meta?: {
    total: number;           // Total count
    page: number;            // Current page
    limit: number;           // Items per page
    skip: number;            // Items skipped
  };
}
```

### Error Response

```typescript
{
  statusCode: number;        // HTTP error code
  message: string;           // Error message
  error?: string;           // Error type/details
}
```

---

## Notes for Frontend Developers

1. **Authentication:** All endpoints require a Bearer token in the Authorization header
2. **Date Format:** All dates should be in `YYYY-MM-DD` format for query params and ISO format for request bodies
3. **UUIDs:** Most ID fields expect UUID v4 format
4. **Pagination:** All list endpoints support pagination with `page` and `limit` parameters
5. **Relations:** Many endpoints return related entities (e.g., sales include customer, product details)
6. **PDF Generation:** Sale invoice endpoint returns a PDF file directly
7. **Enums:** Use the exact enum values specified in the enums reference section
8. **Validation:** Request bodies are validated - ensure all required fields are provided
9. **Filtering:** Use the BaseFilterDTO fields for consistent filtering across all endpoints
10. **Response Structures:** All response structures are fully documented with TypeScript types for AI-assisted integration

---

## Swagger Documentation

For interactive API documentation and testing, access the Swagger UI at:

```
https://showroomapi.luminuxlighting.com/docs
```

This provides live API testing with request/response examples.
