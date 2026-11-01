import { createClient } from "@/lib/supabase/client";
import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransfer,
  FinancialBudget,
} from "@/types/finance";

export interface AccountBalanceAudit {
  id: string;
  name: string;
  initialBalance: number;
  calculatedBalance: number;
}

export interface MigrationResult {
  migrated: boolean;
  alreadyMigrated?: boolean;
  accountsCount: number;
  categoriesCount: number;
  transactionsCount: number;
  transfersCount: number;
  budgetsCount: number;
  skippedDummyAccounts: number;
  errors: string[];
  backupKey?: string;
  preMigrationBalances?: AccountBalanceAudit[];
  preMigrationTotalBalance?: number;
  postMigrationTotalBalance?: number;
  balanceConsistent?: boolean;
}

export interface MigratedIdsMap {
  accounts: Record<string, string>;
  categories: Record<string, string>;
  transactions: Record<string, string>;
  transfers: Record<string, string>;
  budgets: Record<string, string>;
}

export const activeMigrationPromises = new Map<string, Promise<MigrationResult>>();

const STORAGE_KEYS = {
  ACCOUNTS: (userId: string) => `jobora_finance_accounts_${userId}`,
  CATEGORIES: (userId: string) => `jobora_finance_categories_${userId}`,
  TRANSACTIONS: (userId: string) => `jobora_finance_transactions_${userId}`,
  TRANSFERS: (userId: string) => `jobora_finance_transfers_${userId}`,
  BUDGETS: (userId: string) => `jobora_finance_budgets_${userId}`,
  MIGRATION_STATUS: (userId: string) => `jobora_finance_migration_status_${userId}`,
  MIGRATED_IDS: (userId: string) => `jobora_finance_migrated_ids_${userId}`,
  BACKUP_PREFIX: (userId: string) => `jobora_finance_backup_${userId}`,
  LOCK: (userId: string) => `jobora_finance_migration_lock_${userId}`,
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

/**
 * Validates that a numeric amount is a safe integer for JavaScript and PostgreSQL BIGINT.
 */
export function parseBigIntSafe(
  val: unknown,
  fieldName = "nominal",
  fallback = 0
): number {
  if (val === null || val === undefined || val === "") return fallback;
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(num)) return fallback;
  if (!Number.isSafeInteger(num)) {
    throw new Error(
      `Presisi angka tidak valid: Nilai ${val} pada bidang "${fieldName}" melebihi batas batas aman JavaScript Number.isSafeInteger.`
    );
  }
  return Math.round(num);
}

/**
 * Determines whether an account in localStorage is an untouched default template
 * seeded by DEFAULT_ACCOUNTS (e.g. Bank BCA Rp5.000.000, Cash Rp500.000, Wallet Rp250.000)
 * that has NEVER been modified and has ZERO transactions or transfers.
 */
export function isUntouchedDummyAccount(
  acc: FinancialAccount,
  transactions: FinancialTransaction[],
  transfers: FinancialTransfer[]
): boolean {
  // If account has ANY transactions or transfers associated with it, it is ACTIVE and NOT a dummy!
  const hasTransactions = transactions.some((t) => t.account_id === acc.id);
  const hasTransfers = transfers.some(
    (tr) => tr.from_account_id === acc.id || tr.to_account_id === acc.id
  );
  if (hasTransactions || hasTransfers) {
    return false;
  }

  // Exact untouched signatures from DEFAULT_ACCOUNTS
  const isDefaultCash =
    acc.id === "acc-cash" &&
    acc.name === "Tunai / Cash" &&
    acc.initial_balance === 500000;
  const isDefaultBank =
    acc.id === "acc-bank" &&
    acc.name === "Bank BCA" &&
    acc.initial_balance === 5000000;
  const isDefaultEwallet =
    acc.id === "acc-ewallet" &&
    acc.name === "GoPay / E-Wallet" &&
    acc.initial_balance === 250000;

  return isDefaultCash || isDefaultBank || isDefaultEwallet;
}

/**
 * Performs a one-time, resilient, idempotent migration of a user's localStorage financial data to Supabase.
 * - Backs up data first before running.
 * - Leaves original localStorage keys intact (never deletes user data prematurely).
 * - Excludes untouched dummy accounts.
 * - Maps category and account IDs to Supabase UUIDs.
 * - Safe against partial network failures (can be re-run without duplicate entries).
 */
export async function migrateLocalStorageToSupabaseIfNeeded(
  userId: string,
  force = false
): Promise<MigrationResult> {
  if (typeof window === "undefined" || !userId || userId === "guest-user") {
    return {
      migrated: false,
      alreadyMigrated: true,
      accountsCount: 0,
      categoriesCount: 0,
      transactionsCount: 0,
      transfersCount: 0,
      budgetsCount: 0,
      skippedDummyAccounts: 0,
      errors: [],
    };
  }

  // 1. In-memory concurrency singleton (prevents React StrictMode double invocation & concurrent execution)
  const existingPromise = activeMigrationPromises.get(userId);
  if (existingPromise) {
    console.log(
      `[Jobora Migration] Eksekusi migrasi bersamaan terdeteksi untuk user ${userId}. Mengembalikan promise yang sedang berjalan.`
    );
    return existingPromise;
  }

  const migrationExecution = (async (): Promise<MigrationResult> => {
    const statusKey = STORAGE_KEYS.MIGRATION_STATUS(userId);
    if (!force && localStorage.getItem(statusKey) === "COMPLETED") {
      return {
        migrated: false,
        alreadyMigrated: true,
        accountsCount: 0,
        categoriesCount: 0,
        transactionsCount: 0,
        transfersCount: 0,
        budgetsCount: 0,
        skippedDummyAccounts: 0,
        errors: [],
      };
    }

    // 2. Storage-level Concurrency Lock (Cross-tab / cross-window protection)
    const lockKey = STORAGE_KEYS.LOCK(userId);
    const LOCK_EXPIRY_MS = 30000;
    const existingLock = localStorage.getItem(lockKey);
    const now = Date.now();
    if (existingLock) {
      const lockTime = Number(existingLock);
      if (Number.isFinite(lockTime) && now - lockTime < LOCK_EXPIRY_MS) {
        console.warn(
          `[Jobora Migration] Lock penyimpanan aktif terdeteksi untuk user ${userId}. Melewati eksekusi paralel.`
        );
        return {
          migrated: false,
          alreadyMigrated: false,
          accountsCount: 0,
          categoriesCount: 0,
          transactionsCount: 0,
          transfersCount: 0,
          budgetsCount: 0,
          skippedDummyAccounts: 0,
          errors: ["Migrasi sedang berjalan di tab/proses lain."],
        };
      }
    }
    localStorage.setItem(lockKey, String(now));

    const localAccounts = getLocalData<FinancialAccount[]>(STORAGE_KEYS.ACCOUNTS(userId), []);
    const localCategories = getLocalData<FinancialCategory[]>(STORAGE_KEYS.CATEGORIES(userId), []);
    const localTransactions = getLocalData<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS(userId), []);
    const localTransfers = getLocalData<FinancialTransfer[]>(STORAGE_KEYS.TRANSFERS(userId), []);
    const localBudgets = getLocalData<FinancialBudget[]>(STORAGE_KEYS.BUDGETS(userId), []);

    // If there is no local data at all, mark as completed and return
    if (
      localAccounts.length === 0 &&
      localTransactions.length === 0 &&
      localTransfers.length === 0 &&
      localBudgets.length === 0
    ) {
      localStorage.setItem(statusKey, "COMPLETED");
      return {
        migrated: false,
        alreadyMigrated: false,
        accountsCount: 0,
        categoriesCount: 0,
        transactionsCount: 0,
        transfersCount: 0,
        budgetsCount: 0,
        skippedDummyAccounts: 0,
        errors: [],
      };
    }

    // 1. Audit and calculate pre-migration balance for every active account
    const activeLocalAccounts = localAccounts.filter(
      (a) => !isUntouchedDummyAccount(a, localTransactions, localTransfers)
    );

    const preMigrationBalances: AccountBalanceAudit[] = activeLocalAccounts.map((acc) => {
      let bal = parseBigIntSafe(acc.initial_balance, "initial_balance", 0);

      for (const t of localTransactions) {
        if (t.account_id === acc.id) {
          if (t.type === "income") bal += parseBigIntSafe(t.amount, "amount", 0);
          else if (t.type === "expense") bal -= parseBigIntSafe(t.amount, "amount", 0);
        }
      }

      for (const tr of localTransfers) {
        if (tr.from_account_id === acc.id) {
          bal -=
            parseBigIntSafe(tr.amount, "amount", 0) +
            parseBigIntSafe(tr.fee, "fee", 0);
        }
        if (tr.to_account_id === acc.id) {
          bal += parseBigIntSafe(tr.amount, "amount", 0);
        }
      }

      return {
        id: acc.id,
        name: acc.name,
        initialBalance: parseBigIntSafe(acc.initial_balance, "initial_balance", 0),
        calculatedBalance: bal,
      };
    });

    const preMigrationTotalBalance = preMigrationBalances.reduce(
      (sum, a) => sum + a.calculatedBalance,
      0
    );

    console.log(
      `[Jobora Migration] Audit Pra-Migrasi: Total Saldo = Rp${preMigrationTotalBalance.toLocaleString("id-ID")}`,
      preMigrationBalances
    );

    // 2. Create a snapshot backup in localStorage before attempting migration
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX(userId)}_${backupTimestamp}`;
    const backupPayload = {
      userId,
      backedUpAt: new Date().toISOString(),
      preMigrationBalances,
      preMigrationTotalBalance,
      accounts: localAccounts,
      categories: localCategories,
      transactions: localTransactions,
      transfers: localTransfers,
      budgets: localBudgets,
    };
    setLocalData(backupKey, backupPayload);
    localStorage.setItem(`jobora_finance_backup_latest_${userId}`, backupKey);

    const supabase = createClient();
    const errors: string[] = [];

    // Read or create ID mapping dictionary
    const idMap: MigratedIdsMap = getLocalData<MigratedIdsMap>(
      STORAGE_KEYS.MIGRATED_IDS(userId),
      {
        accounts: {},
        categories: {},
        transactions: {},
        transfers: {},
        budgets: {},
      }
    );

    // Progressive ID persistence helper: immediately updates localStorage after every insert/match
    const persistIdMap = () => {
      setLocalData(STORAGE_KEYS.MIGRATED_IDS(userId), idMap);
    };

    let accountsCount = 0;
    let categoriesCount = 0;
    let transactionsCount = 0;
    let transfersCount = 0;
    let budgetsCount = 0;
    let skippedDummyAccounts = 0;

    try {
      // 2. Fetch existing Supabase categories (both system and user-created)
      const { data: dbCategories, error: catFetchError } = await supabase
        .from("financial_categories")
        .select("*");

      if (catFetchError) {
        throw new Error(`Gagal mengambil kategori Supabase: ${catFetchError.message}`);
      }

      const sysCategories = (dbCategories || []).filter((c) => c.user_id === null);
      const userCategories = (dbCategories || []).filter((c) => c.user_id === userId);

      // Map categories
      for (const lCat of localCategories) {
        if (idMap.categories[lCat.id]) continue; // Already mapped

        // Match system category
        const matchedSys = sysCategories.find(
          (sc) =>
            sc.name.trim().toLowerCase() === lCat.name.trim().toLowerCase() &&
            sc.type === lCat.type
        );
        if (matchedSys) {
          idMap.categories[lCat.id] = matchedSys.id;
          persistIdMap();
          continue;
        }

        // Match existing user category
        const matchedUserCat = userCategories.find(
          (uc) =>
            uc.name.trim().toLowerCase() === lCat.name.trim().toLowerCase() &&
            uc.type === lCat.type
        );
        if (matchedUserCat) {
          idMap.categories[lCat.id] = matchedUserCat.id;
          persistIdMap();
          continue;
        }

        // If custom user category, insert into Supabase
        if (!lCat.is_default) {
          const { data: insertedCat, error: catInsertError } = await supabase
            .from("financial_categories")
            .insert({
              user_id: userId,
              name: lCat.name.trim(),
              type: lCat.type,
              icon: lCat.icon || "tag",
              color: lCat.color || "#107c74",
              is_default: false,
            })
            .select("id")
            .single();

          if (catInsertError) {
            errors.push(`Kategori "${lCat.name}": ${catInsertError.message}`);
          } else if (insertedCat) {
            idMap.categories[lCat.id] = insertedCat.id;
            persistIdMap();
            categoriesCount++;
          }
        }
      }

      // 3. Migrate Accounts (Filter out untouched dummy accounts)
      for (const lAcc of localAccounts) {
        if (isUntouchedDummyAccount(lAcc, localTransactions, localTransfers)) {
          skippedDummyAccounts++;
          continue;
        }

        if (idMap.accounts[lAcc.id]) continue; // Already mapped

        // Live pre-insert validation: Check Supabase dynamically to prevent duplicates
        const { data: liveAccounts, error: accFetchError } = await supabase
          .from("financial_accounts")
          .select("id, name, type")
          .eq("user_id", userId);

        if (accFetchError) {
          throw new Error(`Gagal mengambil rekening Supabase: ${accFetchError.message}`);
        }

        const existingDbAcc = (liveAccounts || []).find(
          (da) =>
            da.name.trim().toLowerCase() === lAcc.name.trim().toLowerCase() &&
            da.type === lAcc.type
        );

        if (existingDbAcc) {
          idMap.accounts[lAcc.id] = existingDbAcc.id;
          persistIdMap();
          continue;
        }

        // Insert account into Supabase
        const initialBal = parseBigIntSafe(lAcc.initial_balance, "initial_balance", 0);
        const { data: insertedAcc, error: accInsertError } = await supabase
          .from("financial_accounts")
          .insert({
            user_id: userId,
            name: lAcc.name.trim(),
            type: lAcc.type || "bank",
            initial_balance: initialBal,
            color: lAcc.color || "#107c74",
            icon: lAcc.icon || "wallet",
          })
          .select("id")
          .single();

        if (accInsertError) {
          errors.push(`Rekening "${lAcc.name}": ${accInsertError.message}`);
        } else if (insertedAcc) {
          idMap.accounts[lAcc.id] = insertedAcc.id;
          persistIdMap();
          accountsCount++;
        }
      }

      // 4. Migrate Transactions
      for (const lTx of localTransactions) {
        if (idMap.transactions[lTx.id]) continue; // Already mapped

        const mappedAccountId = idMap.accounts[lTx.account_id];
        if (!mappedAccountId) {
          errors.push(`Transaksi "${lTx.title}": Rekening asal (${lTx.account_id}) tidak ditemukan.`);
          continue;
        }

        const mappedCategoryId = lTx.category_id ? idMap.categories[lTx.category_id] || null : null;
        const cleanAmount = parseBigIntSafe(lTx.amount, "amount", 0);

        // Live pre-insert check: Query Supabase dynamically before insert
        const { data: liveTxs, error: txCheckError } = await supabase
          .from("financial_transactions")
          .select("id, title, amount, date, account_id")
          .eq("user_id", userId)
          .eq("account_id", mappedAccountId)
          .eq("date", lTx.date)
          .eq("amount", cleanAmount);

        if (!txCheckError && liveTxs) {
          const alreadyInDb = liveTxs.find(
            (dt) => dt.title.trim().toLowerCase() === lTx.title.trim().toLowerCase()
          );
          if (alreadyInDb) {
            idMap.transactions[lTx.id] = alreadyInDb.id;
            persistIdMap();
            continue;
          }
        }

        const { data: insertedTx, error: txInsertError } = await supabase
          .from("financial_transactions")
          .insert({
            user_id: userId,
            title: lTx.title.trim(),
            type: lTx.type,
            amount: cleanAmount,
            date: lTx.date,
            category_id: mappedCategoryId,
            account_id: mappedAccountId,
            payment_method: lTx.payment_method || "Tunai",
            description: lTx.description || "",
            receipt_data: lTx.receipt_data || null,
            input_source: lTx.input_source || "manual",
          })
          .select("id")
          .single();

        if (txInsertError) {
          errors.push(`Transaksi "${lTx.title}": ${txInsertError.message}`);
        } else if (insertedTx) {
          idMap.transactions[lTx.id] = insertedTx.id;
          persistIdMap();
          transactionsCount++;
        }
      }

      // 5. Migrate Transfers (Using RPC execute_financial_transfer)
      for (const lTr of localTransfers) {
        if (idMap.transfers[lTr.id]) continue; // Already mapped

        const mappedFrom = idMap.accounts[lTr.from_account_id];
        const mappedTo = idMap.accounts[lTr.to_account_id];

        if (!mappedFrom || !mappedTo || mappedFrom === mappedTo) {
          errors.push(
            `Transfer ID ${lTr.id}: Rekening asal/tujuan tidak valid (${lTr.from_account_id} -> ${lTr.to_account_id})`
          );
          continue;
        }

        const cleanAmount = parseBigIntSafe(lTr.amount, "amount", 0);
        const cleanFee = parseBigIntSafe(lTr.fee, "fee", 0);

        // Live pre-transfer check: Query Supabase dynamically before RPC
        const { data: liveTransfers, error: trCheckError } = await supabase
          .from("financial_transfers")
          .select("id, from_account_id, to_account_id, amount, transfer_date")
          .eq("user_id", userId)
          .eq("from_account_id", mappedFrom)
          .eq("to_account_id", mappedTo)
          .eq("transfer_date", lTr.transfer_date)
          .eq("amount", cleanAmount);

        if (!trCheckError && liveTransfers && liveTransfers.length > 0) {
          idMap.transfers[lTr.id] = liveTransfers[0].id;
          persistIdMap();
          continue;
        }

        const { data: rpcRes, error: rpcError } = await supabase.rpc(
          "execute_financial_transfer",
          {
            p_from_account_id: mappedFrom,
            p_to_account_id: mappedTo,
            p_amount: cleanAmount,
            p_fee: cleanFee,
            p_transfer_date: lTr.transfer_date,
            p_notes: lTr.notes || null,
          }
        );

        if (rpcError) {
          errors.push(`Transfer ${lTr.id}: ${rpcError.message}`);
        } else if (rpcRes && (rpcRes as any).transfer_id) {
          idMap.transfers[lTr.id] = (rpcRes as any).transfer_id;
          persistIdMap();
          transfersCount++;
        }
      }

      // 6. Migrate Budgets
      for (const lBg of localBudgets) {
        if (idMap.budgets[lBg.id]) continue; // Already mapped

        const mappedCatId = idMap.categories[lBg.category_id];
        if (!mappedCatId) {
          errors.push(`Anggaran ${lBg.id}: Kategori (${lBg.category_id}) tidak ditemukan.`);
          continue;
        }

        const cleanAmount = parseBigIntSafe(lBg.amount, "amount", 0);

        const { data: upsertedBg, error: bgError } = await supabase
          .from("financial_budgets")
          .upsert(
            {
              user_id: userId,
              category_id: mappedCatId,
              month: lBg.month,
              amount: cleanAmount,
            },
            { onConflict: "user_id,category_id,month" }
          )
          .select("id")
          .single();

        if (bgError) {
          errors.push(`Anggaran bulan ${lBg.month}: ${bgError.message}`);
        } else if (upsertedBg) {
          idMap.budgets[lBg.id] = upsertedBg.id;
          persistIdMap();
          budgetsCount++;
        }
      }

      // 7. Post-migration Verification: Query Supabase view_financial_account_balances
      const { data: dbBalances, error: balanceFetchError } = await supabase
        .from("view_financial_account_balances")
        .select("id, name, initial_balance, current_balance");

      let postMigrationTotalBalance = 0;
      if (!balanceFetchError && dbBalances) {
        postMigrationTotalBalance = dbBalances.reduce(
          (sum, b) => sum + parseBigIntSafe(b.current_balance, "current_balance", 0),
          0
        );
      }

      const balanceConsistent =
        activeLocalAccounts.length === 0 ||
        preMigrationTotalBalance === postMigrationTotalBalance;

      console.log(
        `[Jobora Migration] Verifikasi Pasca-Migrasi: Supabase Total Saldo = Rp${postMigrationTotalBalance.toLocaleString("id-ID")} (Konsisten: ${balanceConsistent})`,
        dbBalances
      );

      if (!balanceConsistent && activeLocalAccounts.length > 0) {
        errors.push(
          `Inkonsistensi saldo: Saldo lokal (Rp${preMigrationTotalBalance.toLocaleString("id-ID")}) tidak cocok dengan saldo Supabase (Rp${postMigrationTotalBalance.toLocaleString("id-ID")}).`
        );
      }

      // Save audit log to localStorage for user/developer inspection
      const auditLog = {
        migratedAt: new Date().toISOString(),
        preMigrationBalances,
        preMigrationTotalBalance,
        postMigrationTotalBalance,
        balanceConsistent,
        accountsCount,
        transactionsCount,
        transfersCount,
        budgetsCount,
        skippedDummyAccounts,
        errors,
      };
      setLocalData(`jobora_finance_audit_${userId}`, auditLog);

      // Persist final mapping dictionary
      persistIdMap();

      // If no critical unrecoverable errors and balance is consistent, mark migration completed
      if (errors.length === 0 && balanceConsistent) {
        localStorage.setItem(statusKey, "COMPLETED");
      }

      return {
        migrated: true,
        alreadyMigrated: false,
        accountsCount,
        categoriesCount,
        transactionsCount,
        transfersCount,
        budgetsCount,
        skippedDummyAccounts,
        errors,
        backupKey,
        preMigrationBalances,
        preMigrationTotalBalance,
        postMigrationTotalBalance,
        balanceConsistent,
      };
    } catch (err: any) {
      console.error("Migration error:", err);
      errors.push(err.message || String(err));
      persistIdMap();
      return {
        migrated: false,
        alreadyMigrated: false,
        accountsCount,
        categoriesCount,
        transactionsCount,
        transfersCount,
        budgetsCount,
        skippedDummyAccounts,
        errors,
        backupKey,
      };
    } finally {
      localStorage.removeItem(lockKey);
      activeMigrationPromises.delete(userId);
    }
  })();

  activeMigrationPromises.set(userId, migrationExecution);
  return migrationExecution;
}
