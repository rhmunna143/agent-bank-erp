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

export const CASH_IN_SOURCES = [
  'Head Office',
  'Branch',
  'Personal',
  'Other',
];

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AgentBank ERP';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
