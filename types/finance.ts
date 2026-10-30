export type TransactionType = "income" | "expense";

export type AccountType = "cash" | "bank" | "ewallet" | "investment" | "other";

export type InputSource = "manual" | "receipt_ocr";

export interface ReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ReceiptScanResult {
  merchant_name?: string;
  transaction_type?: TransactionType; // "expense" | "income"
  transaction_date?: string; // YYYY-MM-DD
  transaction_time?: string; // HH:mm
  receipt_number?: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  grand_total: number;
  payment_method?: string;
  suggested_category?: string;
  confidence_notes?: string;
}

export interface FinancialAccount {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance?: number; // calculated at runtime
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialCategory {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  title: string;
  type: TransactionType;
  amount: number; // Integer in IDR
  date: string; // YYYY-MM-DD
  category_id?: string;
  category_name?: string;
  account_id: string;
  account_name?: string;
  payment_method?: string;
  description?: string;
  receipt_url?: string;
  receipt_data?: ReceiptScanResult;
  input_source: InputSource;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  fee?: number;
  transfer_date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface FinancialBudget {
  id: string;
  user_id: string;
  category_id: string;
  category_name?: string;
  month: string; // YYYY-MM
  amount: number; // Target budget in IDR
  spent_amount?: number; // Calculated from actual expense transactions
  created_at?: string;
  updated_at?: string;
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
}

export type DateFilterRange =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "this_year"
  | "custom";

export interface DateFilter {
  range: DateFilterRange;
  startDate?: string;
  endDate?: string;
}
