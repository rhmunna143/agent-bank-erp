# Product Requirements Document (PRD)
## Agent Banking ERP System

---

## 1. Project Overview

### 1.1 Product Name
**AgentBank ERP** — A multi-tenant, white-labeled ERP web application for agent banking operations.

### 1.2 Purpose
To provide agent banking outlets a comprehensive system to manage daily financial operations including deposits, withdrawals, mother account balances, hand cash, profit tracking, expense management, daily transaction logs, and reporting — all through a modern, responsive web interface.

### 1.3 Target Users
- **Agent banking operators** (admins who own/manage an agent banking outlet)
- **Staff members** (regular users added by the admin to assist in daily operations)

### 1.4 Tech Stack
| Layer            | Technology                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| Frontend         | React.js 18+, Vite                                                     |
| Styling          | Tailwind CSS 3+                                                        |
| Component Library| shadcn/ui (free, accessible, highly optimized, built on Radix UI)       |
| State Management | Zustand (lightweight, minimal boilerplate)                              |
| Forms            | React Hook Form + Zod (validation)                                     |
| Charts           | Recharts (free, composable, React-native charting)                      |
| PDF Generation   | @react-pdf/renderer                                                     |
| Date Handling    | date-fns                                                                |
| Backend/DB       | Supabase (PostgreSQL, Auth, Row-Level Security, Realtime)               |
| Auth             | Supabase Auth (email/password)                                          |
| Deployment       | Vercel                                                                  |
| Language         | JavaScript (ES2022+)                                                    |
| Routing          | React Router v6                                                         |
| HTTP Client      | Supabase JS Client SDK                                                  |
| Notifications    | react-hot-toast                                                         |
| Icons            | Lucide React                                                            |

---

## 2. Architecture Overview

### 2.1 Multi-Tenancy Model
- **Tenant = Bank**. Each bank is an isolated tenant.
- All data tables include a `bank_id` foreign key.
- Supabase Row-Level Security (RLS) policies enforce tenant isolation — users can only access data belonging to their bank.
- One admin per bank. One bank per admin.

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + Tailwind)          │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────────────┐ │  │
│  │  │  Pages  │ │Components│ │   State (Zustand)  │ │  │
│  │  └────┬────┘ └─────┬────┘ └─────────┬──────────┘ │  │
│  │       └────────────┼────────────────┘             │  │
│  │                    │                              │  │
│  │          Supabase JS Client SDK                   │  │
│  └────────────────────┼─────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────┼─────────────────────────────────┐
│                  Supabase Cloud                         │
│  ┌────────────┐ ┌─────────────┐ ┌────────────────────┐ │
│  │    Auth    │ │  PostgreSQL │ │   Realtime (opt.)  │ │
│  │(email/pwd) │ │  + RLS      │ │                    │ │
│  └────────────┘ └─────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Folder Structure

```
agent-bank-erp/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                    # Static assets (logos, images)
│   ├── components/                # Shared/reusable components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Layout wrappers
│   │   │   ├── AppLayout.jsx      # Authenticated app shell (sidebar + topbar)
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── AuthLayout.jsx     # Layout for login/register pages
│   │   ├── forms/                 # Reusable form components
│   │   │   ├── DepositForm.jsx
│   │   │   ├── WithdrawForm.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── CashInForm.jsx
│   │   │   ├── MotherAccountForm.jsx
│   │   │   ├── ProfitAccountForm.jsx
│   │   │   └── BankForm.jsx
│   │   ├── charts/                # Chart components
│   │   │   ├── BalanceTrendChart.jsx
│   │   │   ├── ExpenseBreakdownChart.jsx
│   │   │   ├── ProfitChart.jsx
│   │   │   └── SummaryCards.jsx
│   │   ├── tables/                # Data table components
│   │   │   ├── TransactionTable.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   └── UserTable.jsx
│   │   ├── reports/               # PDF report components
│   │   │   └── ReportTemplate.jsx
│   │   ├── alerts/                # Threshold alert components
│   │   │   └── BalanceAlert.jsx
│   │   └── common/                # Common components
│   │       ├── ConfirmDialog.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── EmptyState.jsx
│   │       ├── CurrencyDisplay.jsx
│   │       └── DateRangePicker.jsx
│   ├── pages/                     # Route-level page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── onboarding/
│   │   │   └── CreateBankPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── accounts/
│   │   │   ├── MotherAccountsPage.jsx
│   │   │   ├── HandCashPage.jsx
│   │   │   └── ProfitAccountsPage.jsx
│   │   ├── transactions/
│   │   │   ├── DepositPage.jsx
│   │   │   ├── WithdrawPage.jsx
│   │   │   ├── CashInPage.jsx
│   │   │   └── TransactionHistoryPage.jsx
│   │   ├── expenses/
│   │   │   └── ExpensesPage.jsx
│   │   ├── reports/
│   │   │   └── ReportsPage.jsx
│   │   ├── users/
│   │   │   └── UserManagementPage.jsx
│   │   ├── settings/
│   │   │   ├── BankSettingsPage.jsx
│   │   │   ├── ThemeSettingsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useBank.js
│   │   ├── useMotherAccounts.js
│   │   ├── useHandCash.js
│   │   ├── useProfitAccounts.js
│   │   ├── useTransactions.js
│   │   ├── useExpenses.js
│   │   ├── useUsers.js
│   │   ├── useReports.js
│   │   ├── useAlerts.js
│   │   └── useTheme.js
│   ├── stores/                    # Zustand state stores
│   │   ├── authStore.js
│   │   ├── bankStore.js
│   │   ├── transactionStore.js
│   │   └── themeStore.js
│   ├── services/                  # Supabase service layer (data access)
│   │   ├── supabaseClient.js      # Supabase client init
│   │   ├── authService.js
│   │   ├── bankService.js
│   │   ├── motherAccountService.js
│   │   ├── handCashService.js
│   │   ├── profitAccountService.js
│   │   ├── transactionService.js
│   │   ├── expenseService.js
│   │   ├── userService.js
│   │   ├── dailyLogService.js
│   │   └── reportService.js
│   ├── utils/                     # Utility functions
│   │   ├── constants.js           # App-wide constants
│   │   ├── currency.js            # Currency formatting helpers
│   │   ├── dateHelpers.js         # Date formatting/range helpers
│   │   ├── validators.js          # Zod schemas
│   │   └── pdfGenerator.js        # PDF generation utilities
│   ├── themes/                    # Theme configurations
│   │   ├── defaultTheme.js        # White-labeled default
│   │   ├── bankAsiaTheme.js       # Bank Asia branded theme
│   │   └── themeProvider.jsx      # Theme context provider
│   ├── routes/                    # Route configuration
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Tailwind directives + theme CSS vars
├── .env.local                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json
├── jsconfig.json                  # Path aliases (@/)
├── package.json
├── PRD.md
└── README.md
```

---

## 3. Database Schema (Supabase PostgreSQL)

### 3.1 Entity Relationship Diagram (Textual)

```
users (Supabase Auth)
  │
  ├──< bank_members >── banks
  │                        │
  │                        ├──< mother_accounts
  │                        ├──< hand_cash_accounts
  │                        ├──< profit_accounts
  │                        ├──< transactions
  │                        ├──< expenses
  │                        ├──< daily_logs
  │                        ├──< expense_categories
  │                        └──< alert_configs
  │
  └── profiles (1:1 with auth.users)
```

### 3.2 Table Definitions

#### `profiles`
Extends Supabase `auth.users` with app-specific fields.

| Column       | Type        | Constraints                           |
| ------------ | ----------- | ------------------------------------- |
| id           | uuid        | PK, references auth.users(id)        |
| full_name    | text        | NOT NULL                              |
| phone        | text        | NULLABLE                              |
| avatar_url   | text        | NULLABLE                              |
| created_at   | timestamptz | DEFAULT now()                         |
| updated_at   | timestamptz | DEFAULT now()                         |

#### `banks`

| Column         | Type        | Constraints                          |
| -------------- | ----------- | ------------------------------------ |
| id             | uuid        | PK, DEFAULT gen_random_uuid()        |
| name           | text        | NOT NULL                             |
| currency       | text        | NOT NULL, DEFAULT 'BDT'             |
| currency_symbol| text        | NOT NULL, DEFAULT '৳'               |
| theme          | text        | DEFAULT 'default'                    |
| logo_url       | text        | NULLABLE                             |
| admin_id       | uuid        | NOT NULL, UNIQUE, references profiles(id) |
| created_at     | timestamptz | DEFAULT now()                        |
| updated_at     | timestamptz | DEFAULT now()                        |

> `admin_id` is UNIQUE — enforces **one bank per admin**.

#### `bank_members`

| Column     | Type        | Constraints                                     |
| ---------- | ----------- | ----------------------------------------------- |
| id         | uuid        | PK, DEFAULT gen_random_uuid()                   |
| bank_id    | uuid        | NOT NULL, references banks(id) ON DELETE CASCADE |
| user_id    | uuid        | NOT NULL, references profiles(id)               |
| role       | text        | NOT NULL, CHECK (role IN ('admin', 'user'))     |
| invited_by | uuid        | NULLABLE, references profiles(id)               |
| created_at | timestamptz | DEFAULT now()                                   |

> UNIQUE(bank_id, user_id)

#### `mother_accounts`

| Column         | Type          | Constraints                                      |
| -------------- | ------------- | ------------------------------------------------ |
| id             | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id        | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| name           | text          | NOT NULL                                         |
| account_number | text          | NOT NULL                                         |
| balance        | numeric(15,2) | NOT NULL, DEFAULT 0.00                           |
| low_threshold  | numeric(15,2) | DEFAULT 0.00 (for alerts)                        |
| is_active      | boolean       | DEFAULT true                                     |
| created_at     | timestamptz   | DEFAULT now()                                    |
| updated_at     | timestamptz   | DEFAULT now()                                    |

> UNIQUE(bank_id, account_number)

#### `hand_cash_accounts`
Each bank has exactly **one** hand cash account.

| Column        | Type          | Constraints                                      |
| ------------- | ------------- | ------------------------------------------------ |
| id            | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id       | uuid          | NOT NULL, UNIQUE, references banks(id) ON DELETE CASCADE |
| balance       | numeric(15,2) | NOT NULL, DEFAULT 0.00                           |
| low_threshold | numeric(15,2) | DEFAULT 0.00                                     |
| updated_at    | timestamptz   | DEFAULT now()                                    |

#### `profit_accounts`

| Column        | Type          | Constraints                                      |
| ------------- | ------------- | ------------------------------------------------ |
| id            | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id       | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| name          | text          | NOT NULL                                         |
| balance       | numeric(15,2) | NOT NULL, DEFAULT 0.00                           |
| low_threshold | numeric(15,2) | DEFAULT 0.00                                     |
| created_at    | timestamptz   | DEFAULT now()                                    |
| updated_at    | timestamptz   | DEFAULT now()                                    |

#### `transactions`
Core transaction ledger for deposits and withdrawals.

| Column              | Type          | Constraints                                      |
| ------------------- | ------------- | ------------------------------------------------ |
| id                  | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id             | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| type                | text          | NOT NULL, CHECK (type IN ('deposit', 'withdrawal')) |
| amount              | numeric(15,2) | NOT NULL, CHECK (amount > 0)                     |
| mother_account_id   | uuid          | NOT NULL, references mother_accounts(id)         |
| customer_name       | text          | NOT NULL                                         |
| customer_phone      | text          | NULLABLE                                         |
| customer_account_no | text          | NULLABLE                                         |
| description         | text          | NULLABLE                                         |
| affects_mother_on_withdrawal | boolean | DEFAULT false (for hand cash shortage scenario) |
| performed_by        | uuid          | NOT NULL, references profiles(id)                |
| created_at          | timestamptz   | DEFAULT now()                                    |
| updated_at          | timestamptz   | DEFAULT now()                                    |

**Business Logic:**
- **Deposit (by cash):** `mother_account.balance -= amount`, `hand_cash.balance += amount`
- **Withdrawal (by cash):** `hand_cash.balance -= amount`, `mother_account.balance += amount`
- **Withdrawal (hand cash shortage):** If hand cash is insufficient, `mother_account.balance` is adjusted (deducted). The `affects_mother_on_withdrawal` flag indicates this scenario.

#### `cash_in_transactions`
Records cash-in (funding) to mother accounts, hand cash, or profit accounts.

| Column         | Type          | Constraints                                      |
| -------------- | ------------- | ------------------------------------------------ |
| id             | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id        | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| target_type    | text          | NOT NULL, CHECK (target_type IN ('mother_account', 'hand_cash', 'profit_account')) |
| target_id      | uuid          | NOT NULL (references the respective account)     |
| amount         | numeric(15,2) | NOT NULL, CHECK (amount > 0)                     |
| source         | text          | NULLABLE (e.g., 'head_office', 'branch', 'personal') |
| description    | text          | NULLABLE                                         |
| performed_by   | uuid          | NOT NULL, references profiles(id)                |
| created_at     | timestamptz   | DEFAULT now()                                    |

#### `expense_categories`

| Column     | Type        | Constraints                                      |
| ---------- | ----------- | ------------------------------------------------ |
| id         | uuid        | PK, DEFAULT gen_random_uuid()                    |
| bank_id    | uuid        | NOT NULL, references banks(id) ON DELETE CASCADE  |
| name       | text        | NOT NULL                                         |
| is_default | boolean     | DEFAULT false                                    |
| created_at | timestamptz | DEFAULT now()                                    |

> UNIQUE(bank_id, name)

**Default seed categories per bank:**
`Office Stationery`, `Paper Cost`, `Ink`, `Printer Cartridge`, `Furniture`, `Advertisements`, `Electricity Bill`, `Room Rent`, `Internet Bill`, `Other`

#### `expenses`

| Column              | Type          | Constraints                                      |
| ------------------- | ------------- | ------------------------------------------------ |
| id                  | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id             | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| category_id         | uuid          | NOT NULL, references expense_categories(id)      |
| amount              | numeric(15,2) | NOT NULL, CHECK (amount > 0)                     |
| particulars         | text          | NULLABLE (free-text details)                     |
| deducted_from_type  | text          | NOT NULL, CHECK (deducted_from_type IN ('profit_account', 'mother_account', 'hand_cash')) |
| deducted_from_id    | uuid          | NOT NULL                                         |
| performed_by        | uuid          | NOT NULL, references profiles(id)                |
| created_at          | timestamptz   | DEFAULT now()                                    |
| updated_at          | timestamptz   | DEFAULT now()                                    |

#### `daily_logs`
End-of-day snapshot for audit and historical reference.

| Column                  | Type          | Constraints                                    |
| ----------------------- | ------------- | ---------------------------------------------- |
| id                      | uuid          | PK, DEFAULT gen_random_uuid()                  |
| bank_id                 | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE|
| log_date                | date          | NOT NULL                                       |
| total_deposits          | numeric(15,2) | DEFAULT 0.00                                   |
| total_withdrawals       | numeric(15,2) | DEFAULT 0.00                                   |
| total_cash_in           | numeric(15,2) | DEFAULT 0.00                                   |
| total_expenses          | numeric(15,2) | DEFAULT 0.00                                   |
| hand_cash_balance       | numeric(15,2) | DEFAULT 0.00                                   |
| mother_accounts_snapshot| jsonb         | NOT NULL (array of {id, name, balance})        |
| profit_accounts_snapshot| jsonb         | NOT NULL (array of {id, name, balance})        |
| generated_by            | uuid          | references profiles(id)                        |
| created_at              | timestamptz   | DEFAULT now()                                  |

> UNIQUE(bank_id, log_date)

#### `alert_configs`

| Column        | Type          | Constraints                                      |
| ------------- | ------------- | ------------------------------------------------ |
| id            | uuid          | PK, DEFAULT gen_random_uuid()                    |
| bank_id       | uuid          | NOT NULL, references banks(id) ON DELETE CASCADE  |
| account_type  | text          | NOT NULL, CHECK (account_type IN ('mother_account', 'hand_cash', 'profit_account')) |
| account_id    | uuid          | NOT NULL                                         |
| threshold     | numeric(15,2) | NOT NULL                                         |
| is_enabled    | boolean       | DEFAULT true                                     |
| created_at    | timestamptz   | DEFAULT now()                                    |

> UNIQUE(bank_id, account_type, account_id)

### 3.3 Row-Level Security (RLS) Policies

All tables must have RLS enabled. The core policy pattern:

```sql
-- Example for mother_accounts
CREATE POLICY "Users can access their bank's mother accounts"
ON mother_accounts
FOR ALL
USING (
  bank_id IN (
    SELECT bank_id FROM bank_members WHERE user_id = auth.uid()
  )
);
```

**Additional policies:**
- `banks`: Admins can UPDATE their own bank. Members can SELECT.
- `bank_members`: Only admins can INSERT/DELETE members. Members can SELECT.
- `transactions`, `expenses`, `cash_in_transactions`: All bank members can INSERT/SELECT/UPDATE.
- `alert_configs`: Only admins can manage alerts.
- `profiles`: Users can SELECT/UPDATE their own profile.

---

## 4. Authentication & Authorization

### 4.1 Auth Flow

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Register    │────>│ Supabase Auth │────>│  Create Profile  │
│  (email/pwd) │     │  signUp()     │     │  (DB trigger)    │
└──────────────┘     └───────────────┘     └──────────────────┘
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │  Has bank_member │──No──> CreateBankPage
                                           │  record?         │
                                           └────────┬─────────┘
                                                    │ Yes
                                                    ▼
                                             DashboardPage
```

### 4.2 Role-Based Access Control

| Feature                  | Admin | Regular User |
| ------------------------ | ----- | ------------ |
| Create bank              | ✅    | ❌ (only if they registered manually & have no bank) |
| Edit bank settings       | ✅    | ❌           |
| Manage mother accounts   | ✅    | ❌           |
| Manage profit accounts   | ✅    | ❌           |
| Manage users             | ✅    | ❌           |
| Configure alerts         | ✅    | ❌           |
| Make deposits            | ✅    | ✅           |
| Make withdrawals         | ✅    | ✅           |
| Record cash-in           | ✅    | ✅           |
| Record expenses          | ✅    | ✅           |
| Edit transactions        | ✅    | ✅ (own only) |
| View dashboard           | ✅    | ✅           |
| Generate reports         | ✅    | ✅           |
| Change theme             | ✅    | ❌           |

### 4.3 User Registration by Admin

When an admin adds a user:
1. Admin enters the new user's email, full name, and phone.
2. System calls Supabase Auth `admin.createUser()` (or sends an invite link via Supabase).
3. A `bank_members` record is created with `role = 'user'`.
4. The invited user receives an email to set their password.
5. On login, they are directed to the dashboard of the bank they were added to.
6. They **cannot** create a new bank (enforced in UI + RLS).

---

## 5. Feature Specifications

### 5.1 Onboarding (Create Bank)

**Route:** `/onboarding/create-bank`

**Behavior:**
- Shown only to authenticated users who have **no** `bank_members` record.
- Form fields:
  - Bank Name (required)
  - Currency (dropdown, default BDT) — options: BDT, USD, EUR, GBP, INR, etc.
  - Currency Symbol (auto-filled based on selection, editable)
  - Logo Upload (optional)
- On submit:
  1. Create `banks` record with `admin_id = current user`.
  2. Create `bank_members` record with `role = 'admin'`.
  3. Create default `hand_cash_accounts` record (balance: 0).
  4. Seed default `expense_categories`.
  5. Redirect to Dashboard.

### 5.2 Mother Account Management

**Route:** `/accounts/mother-accounts`

**Admin only. CRUD operations.**

**Create Form:**
- Account Name (required)
- Account Number (required)
- Initial Balance (optional, default 0)
- Low Balance Threshold (optional)

**List View:**
- Table with: Name, Account Number, Balance, Status (Active/Inactive), Actions
- Actions: Edit, Deactivate/Activate

### 5.3 Profit Account Management

**Route:** `/accounts/profit-accounts`

**Admin only. CRUD operations.**

**Create Form:**
- Account Name (required, e.g., "Head Office Profit", "Branch Profit")
- Initial Balance (optional, default 0)
- Low Balance Threshold (optional)

### 5.4 Hand Cash Management

**Route:** `/accounts/hand-cash`

**View for all users. Threshold config for admin only.**

- Displays current hand cash balance.
- Shows recent hand cash transactions.
- Admin can set low balance threshold.

### 5.5 Cash-In (Funding)

**Route:** `/transactions/cash-in`

**Available to all bank members.**

**Form:**
- Target Account Type: Radio/Select — `Mother Account`, `Hand Cash`, `Profit Account`
- Target Account: Dropdown (filtered by type above)
- Amount (required, positive number)
- Source (optional text — e.g., "Head Office", "Branch", "Personal")
- Description (optional)
- Date & Time (auto-filled with current, editable)

**On Submit:**
- Increase the target account's balance by the amount.
- Create `cash_in_transactions` record.

### 5.6 Deposit (Customer Deposit by Cash)

**Route:** `/transactions/deposit`

**Available to all bank members.**

**Form:**
- Customer Name (required)
- Customer Phone (optional)
- Customer Account Number (optional)
- Amount (required, positive number)
- Mother Account (dropdown — select which mother account)
- Description (optional)
- Date & Time (auto-filled, editable)

**On Submit (atomic transaction):**
1. Decrease `mother_account.balance` by `amount`.
2. Increase `hand_cash.balance` by `amount`.
3. Create `transactions` record with `type = 'deposit'`.
4. Check if mother account balance fell below threshold → trigger alert.

### 5.7 Withdrawal (Customer Withdrawal by Cash)

**Route:** `/transactions/withdraw`

**Available to all bank members.**

**Form:**
- Customer Name (required)
- Customer Phone (optional)
- Customer Account Number (optional)
- Amount (required, positive number)
- Mother Account (dropdown)
- Hand Cash Shortage Toggle:
  - If enabled: the mother account balance will be adjusted (deducted) to cover the shortage.
- Description (optional)
- Date & Time (auto-filled, editable)

**On Submit (atomic transaction):**

**Normal flow (sufficient hand cash):**
1. Decrease `hand_cash.balance` by `amount`.
2. Increase `mother_account.balance` by `amount`.
3. Create `transactions` record with `type = 'withdrawal'`.

**Shortage flow (hand cash insufficient):**
1. Calculate shortage = `amount - hand_cash.balance`.
2. Set `hand_cash.balance = 0`.
3. Increase `mother_account.balance` by `hand_cash_available` (not the full amount).
4. Deduct shortage from the selected mother account's balance (or a different mother account — selectable).
5. Create `transactions` record with `affects_mother_on_withdrawal = true`.
6. Check thresholds → trigger alerts.

### 5.8 Expenses

**Route:** `/expenses`

**Available to all bank members.**

**Form:**
- Category (dropdown from `expense_categories`)
  - If "Other" → show Particulars text field (required)
- Particulars (optional for non-Other categories)
- Amount (required, positive)
- Deduct From: Radio/Select — `Profit Account`, `Mother Account`, `Hand Cash`
- Specific Account (dropdown filtered by selection above)
- Date & Time (auto-filled, editable)

**On Submit:**
1. Deduct amount from the selected account.
2. Create `expenses` record.
3. Check threshold → trigger alert if balance is low.

**Expense List View:**
- Filterable by category, date range, deduction source.
- Sortable table with: Date, Category, Particulars, Amount, Deducted From, Performed By, Actions.
- Actions: Edit, (no delete — edit to zero if needed, or soft delete).

### 5.9 Transaction History

**Route:** `/transactions/history`

**Available to all bank members.**

- Combined view of all transaction types: Deposits, Withdrawals, Cash-Ins, Expenses.
- Filters:
  - Date Range (preset: Today, This Week, This Month, Custom)
  - Type (Deposit, Withdrawal, Cash-In, Expense)
  - Account (Mother Account, Hand Cash, Profit Account)
  - Performed By (user filter)
- Search by customer name, account number, or description.
- Sortable columns.
- Pagination (20 items per page).
- Edit action available (opens pre-filled form; edits adjust balances accordingly via reverse + re-apply logic).

### 5.10 Edit Transaction Logic

When editing any transaction:
1. **Reverse** the original transaction's effect on all affected account balances.
2. **Apply** the updated transaction values.
3. Update the transaction record with new values and `updated_at = now()`.
4. Log the edit in an `audit_log` field (optional: store `edited_by`, `edited_at`, `previous_values` as JSONB).

### 5.11 Daily Logs

**Automatic generation:** A daily log should be generated at the end of each day (or on-demand by admin).

**Route:** `/dashboard` (daily log section)

**Daily Log contains:**
- Date
- Total Deposits (sum of deposit amounts for the day)
- Total Withdrawals (sum of withdrawal amounts for the day)
- Total Cash-In (sum of cash-in amounts for the day)
- Total Expenses (sum of expenses for the day)
- Hand Cash Balance (snapshot)
- Mother Accounts Snapshot (JSON: [{name, account_number, balance}])
- Profit Accounts Snapshot (JSON: [{name, balance}])

**Implementation:** Use a Supabase Edge Function or a PostgreSQL `cron` job (pg_cron) to auto-generate at 23:59 daily. Also allow manual trigger from the dashboard.

### 5.12 Dashboard

**Route:** `/dashboard`

**Components:**

1. **Summary Cards Row:**
   - Total Mother Account Balance (sum)
   - Hand Cash Balance
   - Total Profit Account Balance (sum)
   - Today's Deposits
   - Today's Withdrawals
   - Today's Expenses

2. **Period Selector:** Toggle between Daily / Weekly / Monthly / Yearly views.

3. **Balance Trend Chart (Line Chart):**
   - Lines for: Total Mother Balance, Hand Cash, Total Profit
   - X-axis: Time period based on selector
   - Data source: `daily_logs`

4. **Expense Breakdown Chart (Pie/Donut Chart):**
   - Segments by expense category
   - For the selected time period

5. **Profit Trend Chart (Bar Chart):**
   - Profit account balance over time
   - Cash-in to profit vs expenses from profit

6. **User Activity Stats (Admin only):**
   - Table showing each user's transaction counts and totals for the period

7. **Recent Transactions Table:**
   - Last 10 transactions (all types)
   - Quick-action links

8. **Alerts Panel:**
   - Active alerts (low balances, etc.)
   - Dismissable but persistent until resolved

### 5.13 Reports (PDF Generation)

**Route:** `/reports`

**Form:**
- Report Type: `Weekly`, `Monthly`, `Yearly`, `Custom Range`
- Date Range (auto-calculated or custom picker)
- Sections to include (checkboxes):
  - [ ] Deposits Summary
  - [ ] Withdrawals Summary
  - [ ] Cash-In Summary
  - [ ] Expense Summary (with category breakdown)
  - [ ] Balance Snapshots (daily balances)
  - [ ] Profit & Loss
  - [ ] User Activity

**Generated PDF includes:**
- **Header:** Bank name, logo, report title, date range
- **Generated by:** Username, generation timestamp
- **Body:** Selected sections with tables and summaries
- **Footer:** Page numbers, "Generated by AgentBank ERP"

**Implementation:** Use `@react-pdf/renderer` to build the PDF in-browser and trigger download.

### 5.14 User Management (Admin Only)

**Route:** `/users`

**Features:**
- **Invite User:** Form with Email, Full Name, Phone → sends invite via Supabase Auth
- **User List:** Table with Name, Email, Phone, Role, Joined Date, Last Active, Actions
- **Actions:** Edit role (admin can't demote themselves), Remove user (removes `bank_members` record; does not delete the user's auth account)

### 5.15 Settings

#### 5.15.1 Bank Settings (Admin Only)
**Route:** `/settings/bank`

- Edit Bank Name
- Edit Currency / Currency Symbol
- Upload/Change Logo
- Set default alert thresholds
- Manage Expense Categories (add custom categories)

#### 5.15.2 Theme Settings (Admin Only)
**Route:** `/settings/theme`

- **Theme Selector:**
  - `Default` — Clean white-labeled theme (blue/gray palette)
  - `Bank Asia` — Bank Asia brand colors (#00A651 green, #003366 navy)
  - `Custom` (future: let admin pick primary/secondary colors)
- Theme is stored in `banks.theme` and applied via CSS variables.

#### 5.15.3 Profile Settings (All Users)
**Route:** `/settings/profile`

- Edit Full Name
- Edit Phone
- Change Password
- Upload Avatar

### 5.16 Alerts & Notifications

**In-app toast notifications** (react-hot-toast) triggered when:
- Hand cash balance drops below threshold after a withdrawal.
- Mother account balance drops below threshold after a deposit or expense.
- Profit account balance drops below threshold after an expense.
- A new user is added to the bank (admin notification).

**Dashboard Alerts Panel:**
- Persistent banner/card showing all active low-balance alerts.
- Links to the relevant account for quick cash-in.

---

## 6. Theming System

### 6.1 CSS Variable Approach

```css
/* index.css */
:root {
  /* Default (White-labeled) Theme */
  --color-primary: #3B82F6;       /* Blue-500 */
  --color-primary-hover: #2563EB; /* Blue-600 */
  --color-primary-light: #EFF6FF; /* Blue-50 */
  --color-secondary: #6B7280;     /* Gray-500 */
  --color-accent: #10B981;        /* Emerald-500 */
  --color-background: #F9FAFB;    /* Gray-50 */
  --color-surface: #FFFFFF;
  --color-text: #111827;          /* Gray-900 */
  --color-text-muted: #6B7280;    /* Gray-500 */
  --color-border: #E5E7EB;        /* Gray-200 */
  --color-danger: #EF4444;        /* Red-500 */
  --color-warning: #F59E0B;       /* Amber-500 */
  --color-success: #10B981;       /* Emerald-500 */
}

[data-theme="bank-asia"] {
  --color-primary: #00A651;       /* Bank Asia Green */
  --color-primary-hover: #008C44;
  --color-primary-light: #E6F9EF;
  --color-secondary: #003366;     /* Bank Asia Navy */
  --color-accent: #FFD700;        /* Gold */
  --color-background: #F0F7F4;
  --color-surface: #FFFFFF;
  --color-text: #003366;
  --color-text-muted: #5A7A8A;
  --color-border: #C8E6D8;
  --color-danger: #DC2626;
  --color-warning: #D97706;
  --color-success: #00A651;
}
```

### 6.2 Tailwind Integration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      },
    },
  },
};
```

---

## 7. API / Service Layer Design

All data access goes through the `services/` layer. Each service file exports functions that wrap Supabase client calls.

### 7.1 Service Pattern Example

```js
// services/motherAccountService.js
import { supabase } from './supabaseClient';

export const motherAccountService = {
  async getAll(bankId) {
    const { data, error } = await supabase
      .from('mother_accounts')
      .select('*')
      .eq('bank_id', bankId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(account) {
    const { data, error } = await supabase
      .from('mother_accounts')
      .insert(account)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('mother_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBalance(id, newBalance) {
    return this.update(id, { balance: newBalance });
  },
};
```

### 7.2 Atomic Transaction Pattern

For operations that affect multiple accounts (deposits, withdrawals), use Supabase RPC (PostgreSQL functions) to ensure atomicity:

```sql
-- Supabase SQL Editor: Create function
CREATE OR REPLACE FUNCTION process_deposit(
  p_bank_id uuid,
  p_mother_account_id uuid,
  p_amount numeric,
  p_customer_name text,
  p_customer_phone text,
  p_customer_account_no text,
  p_description text,
  p_performed_by uuid
)
RETURNS uuid AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Decrease mother account balance
  UPDATE mother_accounts
  SET balance = balance - p_amount, updated_at = now()
  WHERE id = p_mother_account_id AND bank_id = p_bank_id;

  -- Increase hand cash balance
  UPDATE hand_cash_accounts
  SET balance = balance + p_amount, updated_at = now()
  WHERE bank_id = p_bank_id;

  -- Insert transaction record
  INSERT INTO transactions (
    bank_id, type, amount, mother_account_id,
    customer_name, customer_phone, customer_account_no,
    description, performed_by
  ) VALUES (
    p_bank_id, 'deposit', p_amount, p_mother_account_id,
    p_customer_name, p_customer_phone, p_customer_account_no,
    p_description, p_performed_by
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Call from frontend:
```js
const { data, error } = await supabase.rpc('process_deposit', {
  p_bank_id: bankId,
  p_mother_account_id: motherAccountId,
  p_amount: amount,
  p_customer_name: customerName,
  p_customer_phone: customerPhone,
  p_customer_account_no: customerAccountNo,
  p_description: description,
  p_performed_by: userId,
});
```

> **Create similar RPC functions for:** `process_withdrawal`, `process_withdrawal_with_shortage`, `process_expense`, `process_cash_in`, `reverse_and_edit_transaction`.

---

## 8. Routing Map

| Route                          | Page Component           | Access        |
| ------------------------------ | ------------------------ | ------------- |
| `/login`                       | LoginPage                | Public        |
| `/register`                    | RegisterPage             | Public        |
| `/forgot-password`             | ForgotPasswordPage       | Public        |
| `/onboarding/create-bank`      | CreateBankPage           | Auth (no bank)|
| `/dashboard`                   | DashboardPage            | Auth          |
| `/accounts/mother-accounts`    | MotherAccountsPage       | Admin         |
| `/accounts/hand-cash`          | HandCashPage             | Auth          |
| `/accounts/profit-accounts`    | ProfitAccountsPage       | Admin         |
| `/transactions/cash-in`        | CashInPage               | Auth          |
| `/transactions/deposit`        | DepositPage              | Auth          |
| `/transactions/withdraw`       | WithdrawPage             | Auth          |
| `/transactions/history`        | TransactionHistoryPage   | Auth          |
| `/expenses`                    | ExpensesPage             | Auth          |
| `/reports`                     | ReportsPage              | Auth          |
| `/users`                       | UserManagementPage       | Admin         |
| `/settings/bank`               | BankSettingsPage         | Admin         |
| `/settings/theme`              | ThemeSettingsPage         | Admin         |
| `/settings/profile`            | ProfilePage              | Auth          |
| `*`                            | NotFoundPage             | Public        |

---

## 9. UI/UX Guidelines

### 9.1 Layout

- **Sidebar navigation** (collapsible on mobile) with grouped sections:
  - Dashboard
  - Accounts (Mother Accounts, Hand Cash, Profit Accounts)
  - Transactions (Cash-In, Deposit, Withdraw, History)
  - Expenses
  - Reports
  - Users (admin only)
  - Settings
- **Topbar** with:
  - Bank name + logo
  - Search (global transaction search)
  - Notification bell (alerts count)
  - User avatar + dropdown (Profile, Logout)

### 9.2 Responsive Design

- Mobile-first approach.
- Sidebar becomes a hamburger menu on screens < 768px.
- Tables become card layouts on mobile.
- Forms stack vertically on mobile.

### 9.3 Component Patterns

- All forms use `react-hook-form` + `zod` validation.
- All mutations show loading states (button spinners).
- All destructive actions require confirmation dialogs.
- Success/error feedback via `react-hot-toast`.
- Empty states with illustrations and CTAs.
- Currency values always formatted with the bank's currency symbol and 2 decimal places.

---

## 10. Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=AgentBank ERP
VITE_APP_VERSION=1.0.0
```

---

## 11. Deployment Configuration

### 11.1 Vercel Config

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 11.2 Build Settings on Vercel

| Setting         | Value          |
| --------------- | -------------- |
| Framework       | Vite           |
| Build Command   | `npm run build`|
| Output Directory| `dist`         |
| Node.js Version | 18.x           |

---

## 12. Implementation Phases

### Phase 1: Foundation (Core Setup)
1. Initialize Vite + React + Tailwind + shadcn/ui project.
2. Set up Supabase project, create all tables, RLS policies, and RPC functions.
3. Implement authentication (register, login, forgot password).
4. Implement profile creation (DB trigger on auth.users insert).
5. Build AppLayout (sidebar + topbar).
6. Implement theming system (CSS variables + theme provider).

### Phase 2: Onboarding & Account Management
1. Create Bank onboarding flow.
2. Mother account CRUD.
3. Hand cash account setup.
4. Profit account CRUD.
5. Expense category seeding + management.

### Phase 3: Core Transactions
1. Cash-In functionality (with form + balance updates).
2. Deposit functionality (RPC function + form).
3. Withdrawal functionality (normal + shortage flow, RPC function + form).
4. Expense recording (with account selection + deduction).
5. Transaction history page (filters, search, pagination).
6. Edit transaction functionality (reverse + re-apply logic).

### Phase 4: Dashboard & Analytics
1. Summary cards.
2. Balance trend chart (Recharts).
3. Expense breakdown chart.
4. Profit trend chart.
5. Period selector (daily/weekly/monthly/yearly).
6. User activity stats (admin only).

### Phase 5: Reports, Users & Alerts
1. PDF report generation with @react-pdf/renderer.
2. Report form (type, date range, sections).
3. User management (invite, list, remove).
4. Alert configuration (thresholds).
5. In-app alert notifications + dashboard panel.

### Phase 6: Daily Logs & Polish
1. Daily log auto-generation (Supabase Edge Function or pg_cron).
2. Manual daily log trigger.
3. Polish UI/UX, loading states, empty states, error handling.
4. Responsive testing.
5. Performance optimization (lazy loading routes, memoization).
6. Vercel deployment.

---

## 13. Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Enable Email/Password auth provider
- [ ] Create all tables as per Section 3.2
- [ ] Enable RLS on all tables
- [ ] Create RLS policies as per Section 3.3
- [ ] Create DB trigger: on `auth.users` insert → create `profiles` row
- [ ] Create DB trigger: on `banks` insert → create `hand_cash_accounts` + seed `expense_categories`
- [ ] Create RPC functions: `process_deposit`, `process_withdrawal`, `process_withdrawal_with_shortage`, `process_expense`, `process_cash_in`, `reverse_and_edit_transaction`
- [ ] Create pg_cron job or Edge Function for daily log generation
- [ ] Set up Supabase environment variables in Vercel

---

## 14. Non-Functional Requirements

| Requirement      | Target                                                     |
| ---------------- | ---------------------------------------------------------- |
| Performance      | First Contentful Paint < 1.5s, TTI < 3s                   |
| Responsiveness   | Fully functional on screens 320px - 2560px                 |
| Accessibility    | WCAG 2.1 AA compliance (shadcn/ui helps with this)         |
| Security         | RLS on all tables, input validation, XSS protection        |
| Data Integrity   | Atomic transactions via RPC functions                      |
| Browser Support  | Chrome, Firefox, Safari, Edge (latest 2 versions)          |
| Offline          | Not required (v1); show graceful "no connection" message   |
| Scalability      | Supabase free tier supports up to 500MB DB, 50K auth users |

---

## 15. Key Constants

```js
// src/utils/constants.js
export const CURRENCIES = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Office Stationery',
  'Paper Cost',
  'Ink',
  'Printer Cartridge',
  'Furniture',
  'Advertisements',
  'Electricity Bill',
  'Room Rent',
  'Internet Bill',
  'Other',
];

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
};

export const ACCOUNT_TYPES = {
  MOTHER_ACCOUNT: 'mother_account',
  HAND_CASH: 'hand_cash',
  PROFIT_ACCOUNT: 'profit_account',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const REPORT_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

export const ITEMS_PER_PAGE = 20;
```

---

*This PRD is designed to be implementation-ready with GitHub Copilot in VS Code. Each section provides enough detail for Copilot to generate the correct code when you work through the implementation phases sequentially. Start with Phase 1 and proceed in order.*