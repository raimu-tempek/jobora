import { createClient } from "@/lib/supabase/client";
import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransfer,
  FinancialBudget,
  FinanceSummary,
  DateFilter,
} from "@/types/finance";
import { parseBigIntSafe, migrateLocalStorageToSupabaseIfNeeded } from "./migration";

export { parseBigIntSafe, migrateLocalStorageToSupabaseIfNeeded };

/* ========================================================
   DATA MAPPERS (POSTGREST TO TYPESCRIPT)
   ======================================================== */

export function mapAccountFromDB(row: any): FinancialAccount {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    initial_balance: parseBigIntSafe(row.initial_balance, "initial_balance", 0),
    current_balance:
      row.current_balance !== undefined && row.current_balance !== null
        ? parseBigIntSafe(row.current_balance, "current_balance", 0)
        : parseBigIntSafe(row.initial_balance, "initial_balance", 0),
    color: row.color,
    icon: row.icon,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapCategoryFromDB(row: any): FinancialCategory {
  return {
    id: row.id,
    user_id: row.user_id || "",
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    is_default: Boolean(row.is_default || row.user_id === null),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapTransactionFromDB(
  row: any,
  catMap?: Map<string, string>,
  accMap?: Map<string, string>
): FinancialTransaction {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    type: row.type,
    amount: parseBigIntSafe(row.amount, "amount", 0),
    date: row.date,
    category_id: row.category_id || undefined,
    category_name:
      row.financial_categories?.name ||
      (row.category_id && catMap ? catMap.get(row.category_id) : undefined) ||
      "Lainnya",
    account_id: row.account_id,
    account_name:
      row.financial_accounts?.name ||
      (row.account_id && accMap ? accMap.get(row.account_id) : undefined) ||
      "Akun",
    payment_method: row.payment_method || "Tunai",
    description: row.description || "",
    receipt_url: row.receipt_url || undefined,
    receipt_data: row.receipt_data || undefined,
    input_source: row.input_source || "manual",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapTransferFromDB(row: any): FinancialTransfer {
  return {
    id: row.id,
    user_id: row.user_id,
    from_account_id: row.from_account_id,
    to_account_id: row.to_account_id,
    amount: parseBigIntSafe(row.amount, "amount", 0),
    fee: parseBigIntSafe(row.fee, "fee", 0),
    transfer_date: row.transfer_date,
    notes: row.notes || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapBudgetFromDB(
  row: any,
  catMap?: Map<string, string>,
  spentMap?: Map<string, number>
): FinancialBudget {
  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    category_name:
      row.financial_categories?.name ||
      (catMap ? catMap.get(row.category_id) : undefined) ||
      "Kategori",
    month: row.month,
    amount: parseBigIntSafe(row.amount, "amount", 0),
    spent_amount: spentMap ? spentMap.get(row.category_id) || 0 : 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/* ========================================================
   ACCOUNTS
   ======================================================== */

/**
 * Retrieves all accounts for the current user with dynamic real-time balances from Supabase.
 * Returns empty array if no accounts exist (zero dummy accounts).
 */
export async function getAccounts(userId: string): Promise<FinancialAccount[]> {
  if (!userId || userId === "guest-user") return [];

  const supabase = createClient();
  // Fetch from the real-time balance view
  const { data, error } = await supabase
    .from("view_financial_account_balances")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error querying view_financial_account_balances:", error);
    // Fallback directly to financial_accounts if view is temporarily unavailable
    const { data: rawAccs, error: rawError } = await supabase
      .from("financial_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (rawError) {
      throw new Error(`Gagal memuat rekening: ${rawError.message}`);
    }
    return (rawAccs || []).map(mapAccountFromDB);
  }

  return (data || []).map(mapAccountFromDB);
}

/**
 * Pure helper for in-memory balance calculation (backwards-compatible with tests).
 */
export function computeAccountBalances(
  _userId: string,
  accounts: FinancialAccount[],
  transactions: FinancialTransaction[] = [],
  transfers: FinancialTransfer[] = []
): FinancialAccount[] {
  return accounts.map((acc) => {
    let balance = parseBigIntSafe(acc.initial_balance, "initial_balance", 0);

    for (const t of transactions) {
      if (t.account_id === acc.id) {
        if (t.type === "income") {
          balance += parseBigIntSafe(t.amount, "amount", 0);
        } else if (t.type === "expense") {
          balance -= parseBigIntSafe(t.amount, "amount", 0);
        }
      }
    }

    for (const tr of transfers) {
      if (tr.from_account_id === acc.id) {
        balance -=
          parseBigIntSafe(tr.amount, "amount", 0) +
          parseBigIntSafe(tr.fee, "fee", 0);
      }
      if (tr.to_account_id === acc.id) {
        balance += parseBigIntSafe(tr.amount, "amount", 0);
      }
    }

    return {
      ...acc,
      current_balance: balance,
    };
  });
}

export async function createAccount(
  userId: string,
  data: Partial<FinancialAccount>
): Promise<FinancialAccount> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const initialBal = parseBigIntSafe(data.initial_balance, "initial_balance", 0);

  const { data: inserted, error } = await supabase
    .from("financial_accounts")
    .insert({
      user_id: userId,
      name: (data.name || "Akun Baru").trim(),
      type: data.type || "bank",
      initial_balance: initialBal,
      color: data.color || "#107c74",
      icon: data.icon || "wallet",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal membuat rekening: ${error.message}`);
  }

  return mapAccountFromDB(inserted);
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: Partial<FinancialAccount>
): Promise<FinancialAccount | null> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const updatePayload: Record<string, unknown> = {};

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.color !== undefined) updatePayload.color = data.color;
  if (data.icon !== undefined) updatePayload.icon = data.icon;
  if (data.initial_balance !== undefined) {
    updatePayload.initial_balance = parseBigIntSafe(
      data.initial_balance,
      "initial_balance",
      0
    );
  }

  const { data: updated, error } = await supabase
    .from("financial_accounts")
    .update(updatePayload)
    .eq("id", accountId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui rekening: ${error.message}`);
  }

  return mapAccountFromDB(updated);
}

export async function deleteAccount(userId: string, accountId: string): Promise<boolean> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();

  // 1. Delete all transactions associated with this account belonging to this user
  const { error: txDeleteError } = await supabase
    .from("financial_transactions")
    .delete()
    .eq("account_id", accountId)
    .eq("user_id", userId);

  if (txDeleteError) {
    throw new Error(`Gagal menghapus riwayat transaksi terkait: ${txDeleteError.message}`);
  }

  // 2. Delete all internal transfers where this account is sender
  const { error: trFromError } = await supabase
    .from("financial_transfers")
    .delete()
    .eq("from_account_id", accountId)
    .eq("user_id", userId);

  if (trFromError) {
    throw new Error(`Gagal menghapus riwayat transfer terkait: ${trFromError.message}`);
  }

  // 3. Delete all internal transfers where this account is recipient
  const { error: trToError } = await supabase
    .from("financial_transfers")
    .delete()
    .eq("to_account_id", accountId)
    .eq("user_id", userId);

  if (trToError) {
    throw new Error(`Gagal menghapus riwayat transfer terkait: ${trToError.message}`);
  }

  // 4. Delete the account record itself
  const { error: accDeleteError } = await supabase
    .from("financial_accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);

  if (accDeleteError) {
    throw new Error(`Gagal menghapus rekening: ${accDeleteError.message}`);
  }

  // 5. Clean up ID mapping in localStorage if present
  if (typeof window !== "undefined") {
    try {
      const idMapKey = `jobora_finance_migrated_ids_${userId}`;
      const rawMap = localStorage.getItem(idMapKey);
      if (rawMap) {
        const idMap = JSON.parse(rawMap);
        if (idMap.accounts) {
          for (const localId of Object.keys(idMap.accounts)) {
            if (idMap.accounts[localId] === accountId) {
              delete idMap.accounts[localId];
            }
          }
          localStorage.setItem(idMapKey, JSON.stringify(idMap));
        }
      }
    } catch (e) {
      console.warn("Gagal memperbarui idMap lokal pasca penghapusan akun:", e);
    }
  }

  return true;
}

/* ========================================================
   CATEGORIES
   ======================================================== */

/**
 * Retrieves all categories accessible to the current user (system categories + custom user categories).
 */
export async function getCategories(userId: string): Promise<FinancialCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("financial_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat kategori: ${error.message}`);
  }

  return (data || []).map(mapCategoryFromDB);
}

export async function createCategory(
  userId: string,
  data: Partial<FinancialCategory>
): Promise<FinancialCategory> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const { data: inserted, error } = await supabase
    .from("financial_categories")
    .insert({
      user_id: userId,
      name: (data.name || "Kategori Baru").trim(),
      type: data.type || "expense",
      icon: data.icon || "tag",
      color: data.color || "#107c74",
      is_default: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal membuat kategori: ${error.message}`);
  }

  return mapCategoryFromDB(inserted);
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: Partial<FinancialCategory>
): Promise<FinancialCategory | null> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const updatePayload: Record<string, unknown> = {};

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.icon !== undefined) updatePayload.icon = data.icon;
  if (data.color !== undefined) updatePayload.color = data.color;

  const { data: updated, error } = await supabase
    .from("financial_categories")
    .update(updatePayload)
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui kategori: ${error.message}`);
  }

  return mapCategoryFromDB(updated);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<boolean> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();

  // Safety check: ensure user is not deleting a system category (user_id IS NULL)
  const { data: targetCat, error: fetchError } = await supabase
    .from("financial_categories")
    .select("user_id")
    .eq("id", categoryId)
    .single();

  if (fetchError || !targetCat) {
    throw new Error("Kategori tidak ditemukan.");
  }

  if (!targetCat.user_id) {
    throw new Error("Kategori bawaan sistem tidak dapat dihapus.");
  }

  const { error } = await supabase
    .from("financial_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Gagal menghapus kategori: ${error.message}`);
  }

  return true;
}

/* ========================================================
   TRANSACTIONS
   ======================================================== */

export async function getTransactions(
  userId: string,
  filter?: DateFilter
): Promise<FinancialTransaction[]> {
  if (!userId || userId === "guest-user") return [];

  const supabase = createClient();
  let query = supabase
    .from("financial_transactions")
    .select(`
      *,
      financial_categories ( id, name ),
      financial_accounts ( id, name )
    `)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter) {
    const { start, end } = resolveDateFilterRange(filter);
    if (start) query = query.gte("date", start);
    if (end) query = query.lte("date", end);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Gagal memuat transaksi: ${error.message}`);
  }

  return (data || []).map((row) => mapTransactionFromDB(row));
}

export async function createTransaction(
  userId: string,
  data: Omit<FinancialTransaction, "id" | "user_id" | "created_at" | "updated_at">
): Promise<FinancialTransaction> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const cleanAmount = parseBigIntSafe(data.amount, "amount", 0);

  const { data: inserted, error } = await supabase
    .from("financial_transactions")
    .insert({
      user_id: userId,
      title: data.title.trim(),
      type: data.type,
      amount: cleanAmount,
      date: data.date,
      category_id: data.category_id || null,
      account_id: data.account_id,
      payment_method: data.payment_method || "Tunai",
      description: data.description || "",
      receipt_url: data.receipt_url || null,
      receipt_data: data.receipt_data || null,
      input_source: data.input_source || "manual",
    })
    .select(`
      *,
      financial_categories ( id, name ),
      financial_accounts ( id, name )
    `)
    .single();

  if (error) {
    throw new Error(`Gagal membuat transaksi: ${error.message}`);
  }

  return mapTransactionFromDB(inserted);
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: Partial<FinancialTransaction>
): Promise<FinancialTransaction | null> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const updatePayload: Record<string, unknown> = {};

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.amount !== undefined) {
    updatePayload.amount = parseBigIntSafe(data.amount, "amount", 0);
  }
  if (data.date !== undefined) updatePayload.date = data.date;
  if (data.category_id !== undefined) updatePayload.category_id = data.category_id || null;
  if (data.account_id !== undefined) updatePayload.account_id = data.account_id;
  if (data.payment_method !== undefined) updatePayload.payment_method = data.payment_method;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.receipt_url !== undefined) updatePayload.receipt_url = data.receipt_url;
  if (data.receipt_data !== undefined) updatePayload.receipt_data = data.receipt_data;
  if (data.input_source !== undefined) updatePayload.input_source = data.input_source;

  const { data: updated, error } = await supabase
    .from("financial_transactions")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select(`
      *,
      financial_categories ( id, name ),
      financial_accounts ( id, name )
    `)
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui transaksi: ${error.message}`);
  }

  return mapTransactionFromDB(updated);
}

export async function deleteTransaction(userId: string, id: string): Promise<boolean> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("financial_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Gagal menghapus transaksi: ${error.message}`);
  }

  return true;
}

export async function checkForDuplicateTransaction(
  userId: string,
  amount: number,
  date: string,
  accountId: string,
  excludeId?: string
): Promise<FinancialTransaction | null> {
  if (!userId || userId === "guest-user") return null;

  const supabase = createClient();
  const cleanAmount = parseBigIntSafe(amount, "amount", 0);

  let query = supabase
    .from("financial_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("amount", cleanAmount)
    .eq("date", date)
    .eq("account_id", accountId);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return mapTransactionFromDB(data[0]);
}

/* ========================================================
   TRANSFERS (ATOMIC RPC EXECUTION)
   ======================================================== */

export async function getTransfers(userId: string): Promise<FinancialTransfer[]> {
  if (!userId || userId === "guest-user") return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("financial_transfers")
    .select("*")
    .order("transfer_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat riwayat transfer: ${error.message}`);
  }

  return (data || []).map(mapTransferFromDB);
}

export async function createTransfer(
  userId: string,
  data: Omit<FinancialTransfer, "id" | "user_id" | "created_at">
): Promise<FinancialTransfer> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  if (data.from_account_id === data.to_account_id) {
    throw new Error("Rekening asal dan rekening tujuan tidak boleh sama.");
  }

  const supabase = createClient();
  const cleanAmount = parseBigIntSafe(data.amount, "amount", 0);
  const cleanFee = parseBigIntSafe(data.fee, "fee", 0);

  const { data: rpcRes, error } = await supabase.rpc("execute_financial_transfer", {
    p_from_account_id: data.from_account_id,
    p_to_account_id: data.to_account_id,
    p_amount: cleanAmount,
    p_fee: cleanFee,
    p_transfer_date: data.transfer_date,
    p_notes: data.notes || null,
  });

  if (error) {
    throw new Error(`Transfer gagal: ${error.message}`);
  }

  return {
    id: (rpcRes as any)?.transfer_id || "new-transfer",
    user_id: userId,
    from_account_id: data.from_account_id,
    to_account_id: data.to_account_id,
    amount: cleanAmount,
    fee: cleanFee,
    transfer_date: data.transfer_date,
    notes: data.notes || "",
    created_at: new Date().toISOString(),
  };
}

/* ========================================================
   BUDGETS
   ======================================================== */

export async function getBudgets(
  userId: string,
  month: string // YYYY-MM
): Promise<FinancialBudget[]> {
  if (!userId || userId === "guest-user") return [];

  const supabase = createClient();

  // 1. Fetch budgets for the requested month
  const { data: budgetRows, error: budgetError } = await supabase
    .from("financial_budgets")
    .select(`
      *,
      financial_categories ( id, name )
    `)
    .eq("month", month);

  if (budgetError) {
    throw new Error(`Gagal memuat anggaran: ${budgetError.message}`);
  }

  // 2. Fetch expense transactions for that month to calculate actual spent_amount
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;

  const { data: txRows } = await supabase
    .from("financial_transactions")
    .select("category_id, amount")
    .eq("type", "expense")
    .gte("date", start)
    .lte("date", end);

  const spentMap = new Map<string, number>();
  for (const t of txRows || []) {
    if (t.category_id) {
      const prev = spentMap.get(t.category_id) || 0;
      spentMap.set(t.category_id, prev + parseBigIntSafe(t.amount, "amount", 0));
    }
  }

  return (budgetRows || []).map((b) => mapBudgetFromDB(b, undefined, spentMap));
}

export async function upsertBudget(
  userId: string,
  categoryId: string,
  month: string,
  amount: number
): Promise<FinancialBudget> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const cleanAmount = parseBigIntSafe(amount, "amount", 0);

  const { data: upserted, error } = await supabase
    .from("financial_budgets")
    .upsert(
      {
        user_id: userId,
        category_id: categoryId,
        month,
        amount: cleanAmount,
      },
      { onConflict: "user_id,category_id,month" }
    )
    .select(`
      *,
      financial_categories ( id, name )
    `)
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan anggaran: ${error.message}`);
  }

  return mapBudgetFromDB(upserted);
}

export async function deleteBudget(userId: string, id: string): Promise<boolean> {
  if (!userId || userId === "guest-user") {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("financial_budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Gagal menghapus anggaran: ${error.message}`);
  }

  return true;
}

/* ========================================================
   FINANCE SUMMARY & ANALYTICS
   ======================================================== */

export async function getFinanceSummary(
  userId: string,
  filter?: DateFilter
): Promise<FinanceSummary> {
  const [accounts, transactions] = await Promise.all([
    getAccounts(userId),
    getTransactions(userId, filter),
  ]);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.current_balance ?? acc.initial_balance ?? 0),
    0
  );

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === "income") {
      totalIncome += parseBigIntSafe(t.amount, "amount", 0);
    } else if (t.type === "expense") {
      totalExpenses += parseBigIntSafe(t.amount, "amount", 0);
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
   DATE FILTER HELPER (PURE FUNCTION)
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
