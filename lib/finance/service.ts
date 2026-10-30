import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransfer,
  FinancialBudget,
  FinanceSummary,
  DateFilter,
} from "@/types/finance";
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from "./defaults";

const STORAGE_KEYS = {
  ACCOUNTS: (userId: string) => `jobora_finance_accounts_${userId}`,
  CATEGORIES: (userId: string) => `jobora_finance_categories_${userId}`,
  TRANSACTIONS: (userId: string) => `jobora_finance_transactions_${userId}`,
  TRANSFERS: (userId: string) => `jobora_finance_transfers_${userId}`,
  BUDGETS: (userId: string) => `jobora_finance_budgets_${userId}`,
};

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error("Error reading localStorage key:", key, e);
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error writing localStorage key:", key, e);
  }
}

/* ========================================================
   ACCOUNTS
   ======================================================== */

export function getAccounts(userId: string): FinancialAccount[] {
  const accounts = getLocalData<FinancialAccount[]>(
    STORAGE_KEYS.ACCOUNTS(userId),
    []
  );

  if (accounts.length === 0) {
    const seeded = DEFAULT_ACCOUNTS(userId);
    setLocalData(STORAGE_KEYS.ACCOUNTS(userId), seeded);
    return computeAccountBalances(userId, seeded);
  }

  return computeAccountBalances(userId, accounts);
}

export function computeAccountBalances(
  userId: string,
  accounts: FinancialAccount[]
): FinancialAccount[] {
  const transactions = getTransactions(userId);
  const transfers = getTransfers(userId);

  return accounts.map((acc) => {
    let balance = Number(acc.initial_balance) || 0;

    // Add income to this account, subtract expense from this account
    for (const t of transactions) {
      if (t.account_id === acc.id) {
        if (t.type === "income") {
          balance += Math.round(t.amount);
        } else if (t.type === "expense") {
          balance -= Math.round(t.amount);
        }
      }
    }

    // Transfers
    for (const tr of transfers) {
      if (tr.from_account_id === acc.id) {
        balance -= Math.round(tr.amount) + Math.round(tr.fee || 0);
      }
      if (tr.to_account_id === acc.id) {
        balance += Math.round(tr.amount);
      }
    }

    return {
      ...acc,
      current_balance: balance,
    };
  });
}

export function createAccount(
  userId: string,
  data: Partial<FinancialAccount>
): FinancialAccount {
  const accounts = getLocalData<FinancialAccount[]>(
    STORAGE_KEYS.ACCOUNTS(userId),
    DEFAULT_ACCOUNTS(userId)
  );

  const newAccount: FinancialAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    name: data.name || "Akun Baru",
    type: data.type || "bank",
    initial_balance: Math.round(Number(data.initial_balance) || 0),
    color: data.color || "#107c74",
    icon: data.icon || "wallet",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  accounts.push(newAccount);
  setLocalData(STORAGE_KEYS.ACCOUNTS(userId), accounts);
  return newAccount;
}

export function updateAccount(
  userId: string,
  accountId: string,
  data: Partial<FinancialAccount>
): FinancialAccount | null {
  const accounts = getLocalData<FinancialAccount[]>(
    STORAGE_KEYS.ACCOUNTS(userId),
    DEFAULT_ACCOUNTS(userId)
  );

  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1) return null;

  accounts[idx] = {
    ...accounts[idx],
    ...data,
    initial_balance:
      data.initial_balance !== undefined
        ? Math.round(Number(data.initial_balance))
        : accounts[idx].initial_balance,
    updated_at: new Date().toISOString(),
  };

  setLocalData(STORAGE_KEYS.ACCOUNTS(userId), accounts);
  return accounts[idx];
}

export function deleteAccount(userId: string, accountId: string): boolean {
  const accounts = getLocalData<FinancialAccount[]>(
    STORAGE_KEYS.ACCOUNTS(userId),
    DEFAULT_ACCOUNTS(userId)
  );

  // Prevent deleting if it's the only account left
  if (accounts.length <= 1) {
    throw new Error("Minimal harus ada 1 akun keuangan.");
  }

  const filtered = accounts.filter((a) => a.id !== accountId);
  setLocalData(STORAGE_KEYS.ACCOUNTS(userId), filtered);

  // Safely reassign transactions linked to the deleted account to the primary remaining account
  const fallbackAccountId = filtered[0].id;
  const transactions = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  let txModified = false;
  const updatedTransactions = transactions.map((t) => {
    if (t.account_id === accountId) {
      txModified = true;
      return { ...t, account_id: fallbackAccountId };
    }
    return t;
  });

  if (txModified) {
    setLocalData(STORAGE_KEYS.TRANSACTIONS(userId), updatedTransactions);
  }

  // Remove transfers involving this account to maintain balance integrity
  const transfers = getLocalData<FinancialTransfer[]>(
    STORAGE_KEYS.TRANSFERS(userId),
    []
  );
  const remainingTransfers = transfers.filter(
    (tr) => tr.from_account_id !== accountId && tr.to_account_id !== accountId
  );
  if (remainingTransfers.length !== transfers.length) {
    setLocalData(STORAGE_KEYS.TRANSFERS(userId), remainingTransfers);
  }

  return true;
}

/* ========================================================
   CATEGORIES
   ======================================================== */

export function getCategories(userId: string): FinancialCategory[] {
  const categories = getLocalData<FinancialCategory[]>(
    STORAGE_KEYS.CATEGORIES(userId),
    []
  );

  if (categories.length === 0) {
    const seeded = DEFAULT_CATEGORIES(userId);
    setLocalData(STORAGE_KEYS.CATEGORIES(userId), seeded);
    return seeded;
  }

  return categories;
}

export function createCategory(
  userId: string,
  data: Partial<FinancialCategory>
): FinancialCategory {
  const categories = getCategories(userId);
  const newCategory: FinancialCategory = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    name: data.name || "Kategori Baru",
    type: data.type || "expense",
    icon: data.icon || "tag",
    color: data.color || "#107c74",
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  categories.push(newCategory);
  setLocalData(STORAGE_KEYS.CATEGORIES(userId), categories);
  return newCategory;
}

export function updateCategory(
  userId: string,
  categoryId: string,
  data: Partial<FinancialCategory>
): FinancialCategory | null {
  const categories = getCategories(userId);
  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx === -1) return null;

  categories[idx] = {
    ...categories[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };

  setLocalData(STORAGE_KEYS.CATEGORIES(userId), categories);
  return categories[idx];
}

export function deleteCategory(userId: string, categoryId: string): boolean {
  const categories = getCategories(userId);
  const filtered = categories.filter((c) => c.id !== categoryId);
  setLocalData(STORAGE_KEYS.CATEGORIES(userId), filtered);
  return true;
}

/* ========================================================
   TRANSACTIONS
   ======================================================== */

export function getTransactions(
  userId: string,
  filter?: DateFilter
): FinancialTransaction[] {
  const all = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  // Attach category_name and account_name
  const categories = getCategories(userId);
  const accounts = getLocalData<FinancialAccount[]>(
    STORAGE_KEYS.ACCOUNTS(userId),
    []
  );

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));

  const enriched = all.map((t) => ({
    ...t,
    category_name: t.category_id ? catMap.get(t.category_id) || "Lainnya" : "Lainnya",
    account_name: accMap.get(t.account_id) || "Akun Utama",
  }));

  if (!filter || filter.range === "this_year" && !filter.startDate && !filter.endDate) {
    // Return all or apply date filter
  }

  if (filter) {
    const { start, end } = resolveDateFilterRange(filter);
    return enriched
      .filter((t) => (!start || t.date >= start) && (!end || t.date <= end))
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  }

  return enriched.sort(
    (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
  );
}

export function createTransaction(
  userId: string,
  data: Omit<FinancialTransaction, "id" | "user_id" | "created_at" | "updated_at">
): FinancialTransaction {
  const transactions = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  const newTx: FinancialTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    title: data.title.trim(),
    type: data.type,
    amount: Math.max(0, Math.round(Number(data.amount) || 0)),
    date: data.date,
    category_id: data.category_id,
    account_id: data.account_id,
    payment_method: data.payment_method || "Tunai",
    description: data.description || "",
    receipt_url: undefined, // Gambar sengaja tidak disimpan ke storage agar tidak penuh
    receipt_data: data.receipt_data,
    input_source: data.input_source || "manual",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  transactions.unshift(newTx);
  setLocalData(STORAGE_KEYS.TRANSACTIONS(userId), transactions);
  return newTx;
}

export function updateTransaction(
  userId: string,
  id: string,
  data: Partial<FinancialTransaction>
): FinancialTransaction | null {
  const transactions = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  transactions[idx] = {
    ...transactions[idx],
    ...data,
    amount:
      data.amount !== undefined
        ? Math.max(0, Math.round(Number(data.amount)))
        : transactions[idx].amount,
    updated_at: new Date().toISOString(),
  };

  setLocalData(STORAGE_KEYS.TRANSACTIONS(userId), transactions);
  return transactions[idx];
}

export function deleteTransaction(userId: string, id: string): boolean {
  const transactions = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  const filtered = transactions.filter((t) => t.id !== id);
  setLocalData(STORAGE_KEYS.TRANSACTIONS(userId), filtered);
  return true;
}

export function checkForDuplicateTransaction(
  userId: string,
  amount: number,
  date: string,
  accountId: string,
  excludeId?: string
): FinancialTransaction | null {
  const transactions = getLocalData<FinancialTransaction[]>(
    STORAGE_KEYS.TRANSACTIONS(userId),
    []
  );

  const targetAmount = Math.round(amount);
  const found = transactions.find(
    (t) =>
      t.id !== excludeId &&
      Math.round(t.amount) === targetAmount &&
      t.date === date &&
      t.account_id === accountId
  );

  return found || null;
}

/* ========================================================
   TRANSFERS
   ======================================================== */

export function getTransfers(userId: string): FinancialTransfer[] {
  return getLocalData<FinancialTransfer[]>(STORAGE_KEYS.TRANSFERS(userId), []).sort(
    (a, b) => b.transfer_date.localeCompare(a.transfer_date) || b.created_at.localeCompare(a.created_at)
  );
}

export function createTransfer(
  userId: string,
  data: Omit<FinancialTransfer, "id" | "user_id" | "created_at">
): FinancialTransfer {
  if (data.from_account_id === data.to_account_id) {
    throw new Error("Akun asal dan akun tujuan tidak boleh sama.");
  }

  const transfers = getLocalData<FinancialTransfer[]>(
    STORAGE_KEYS.TRANSFERS(userId),
    []
  );

  const newTransfer: FinancialTransfer = {
    id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    from_account_id: data.from_account_id,
    to_account_id: data.to_account_id,
    amount: Math.max(0, Math.round(Number(data.amount) || 0)),
    fee: Math.max(0, Math.round(Number(data.fee) || 0)),
    transfer_date: data.transfer_date,
    notes: data.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  transfers.unshift(newTransfer);
  setLocalData(STORAGE_KEYS.TRANSFERS(userId), transfers);
  return newTransfer;
}

/* ========================================================
   BUDGETS
   ======================================================== */

export function getBudgets(
  userId: string,
  month: string // YYYY-MM
): FinancialBudget[] {
  const allBudgets = getLocalData<FinancialBudget[]>(
    STORAGE_KEYS.BUDGETS(userId),
    []
  );

  const categories = getCategories(userId).filter((c) => c.type === "expense");
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  // Get transactions for that month to compute spent_amount
  const transactions = getTransactions(userId);
  const monthTransactions = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(month)
  );

  const spentPerCategory = new Map<string, number>();
  for (const t of monthTransactions) {
    if (t.category_id) {
      const prev = spentPerCategory.get(t.category_id) || 0;
      spentPerCategory.set(t.category_id, prev + Math.round(t.amount));
    }
  }

  const currentMonthBudgets = allBudgets.filter((b) => b.month === month);

  return currentMonthBudgets.map((b) => ({
    ...b,
    category_name: catMap.get(b.category_id) || "Kategori",
    spent_amount: spentPerCategory.get(b.category_id) || 0,
  }));
}

export function upsertBudget(
  userId: string,
  categoryId: string,
  month: string,
  amount: number
): FinancialBudget {
  const allBudgets = getLocalData<FinancialBudget[]>(
    STORAGE_KEYS.BUDGETS(userId),
    []
  );

  const idx = allBudgets.findIndex(
    (b) => b.category_id === categoryId && b.month === month
  );

  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));

  if (idx >= 0) {
    allBudgets[idx] = {
      ...allBudgets[idx],
      amount: cleanAmount,
      updated_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.BUDGETS(userId), allBudgets);
    return allBudgets[idx];
  } else {
    const newBudget: FinancialBudget = {
      id: `bg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      category_id: categoryId,
      month,
      amount: cleanAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allBudgets.push(newBudget);
    setLocalData(STORAGE_KEYS.BUDGETS(userId), allBudgets);
    return newBudget;
  }
}

export function deleteBudget(userId: string, id: string): boolean {
  const allBudgets = getLocalData<FinancialBudget[]>(
    STORAGE_KEYS.BUDGETS(userId),
    []
  );
  const filtered = allBudgets.filter((b) => b.id !== id);
  setLocalData(STORAGE_KEYS.BUDGETS(userId), filtered);
  return true;
}

/* ========================================================
   FINANCE SUMMARY & ANALYTICS
   ======================================================== */

export function getFinanceSummary(
  userId: string,
  filter?: DateFilter
): FinanceSummary {
  const accounts = getAccounts(userId);
  const transactions = getTransactions(userId, filter);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.current_balance || 0),
    0
  );

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === "income") {
      totalIncome += Math.round(t.amount);
    } else if (t.type === "expense") {
      totalExpenses += Math.round(t.amount);
    }
  }

  const netCashFlow = totalIncome - totalExpenses;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    transactionCount: transactions.length,
  };
}

/* ========================================================
   DATE FILTER HELPER
   ======================================================== */

export function resolveDateFilterRange(filter: DateFilter): {
  start?: string;
  end?: string;
} {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");

  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (filter.range) {
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: toYMD(start), end: toYMD(end) };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toYMD(start), end: toYMD(end) };
    }
    case "last_3_months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: toYMD(start), end: toYMD(end) };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start: toYMD(start), end: toYMD(end) };
    }
    case "custom": {
      return { start: filter.startDate, end: filter.endDate };
    }
    default:
      return {};
  }
}
