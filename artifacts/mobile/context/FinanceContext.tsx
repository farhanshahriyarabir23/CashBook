import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TransactionCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "housing"
  | "health"
  | "education"
  | "income"
  | "other";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: TransactionCategory;
  date: string;
  note?: string;
};

export type Budget = {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
};

export type SavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  emoji: string;
  color: string;
};

type FinanceContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (id: string, spent: number) => void;
  addSavingGoal: (g: Omit<SavingGoal, "id">) => void;
  updateSavingGoal: (id: string, savedAmount: number) => void;
  deleteSavingGoal: (id: string) => void;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEYS = {
  TRANSACTIONS: "@finance_transactions",
  BUDGETS: "@finance_budgets",
  GOALS: "@finance_goals",
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "Student Loan Disbursement",
    amount: 2500,
    type: "income",
    category: "income",
    date: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Part-time Job",
    amount: 800,
    type: "income",
    category: "income",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Monthly Rent",
    amount: 650,
    type: "expense",
    category: "housing",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "4",
    title: "Grocery Run",
    amount: 78.5,
    type: "expense",
    category: "food",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "5",
    title: "Uber to Campus",
    amount: 12.4,
    type: "expense",
    category: "transport",
    date: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Textbooks",
    amount: 94.99,
    type: "expense",
    category: "education",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "7",
    title: "Netflix Subscription",
    amount: 15.99,
    type: "expense",
    category: "entertainment",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "8",
    title: "Coffee + Study Snacks",
    amount: 22.3,
    type: "expense",
    category: "food",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const DEFAULT_BUDGETS: Budget[] = [
  {
    id: "b1",
    category: "food",
    limit: 300,
    spent: 100.8,
    color: "#F97316",
  },
  {
    id: "b2",
    category: "transport",
    limit: 100,
    spent: 12.4,
    color: "#8B5CF6",
  },
  {
    id: "b3",
    category: "entertainment",
    limit: 80,
    spent: 15.99,
    color: "#EC4899",
  },
  {
    id: "b4",
    category: "education",
    limit: 200,
    spent: 94.99,
    color: "#2563EB",
  },
  {
    id: "b5",
    category: "shopping",
    limit: 150,
    spent: 0,
    color: "#0EA5E9",
  },
];

const DEFAULT_GOALS: SavingGoal[] = [
  {
    id: "g1",
    title: "Laptop Upgrade",
    targetAmount: 1200,
    savedAmount: 420,
    deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
    emoji: "💻",
    color: "#2563EB",
  },
  {
    id: "g2",
    title: "Spring Break Trip",
    targetAmount: 800,
    savedAmount: 310,
    deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
    emoji: "✈️",
    color: "#16A34A",
  },
  {
    id: "g3",
    title: "Emergency Fund",
    targetAmount: 500,
    savedAmount: 175,
    deadline: new Date(Date.now() + 120 * 86400000).toISOString(),
    emoji: "🛡️",
    color: "#D97706",
  },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(DEFAULT_GOALS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txRaw, budgetsRaw, goalsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
      ]);
      if (txRaw) setTransactions(JSON.parse(txRaw));
      if (budgetsRaw) setBudgets(JSON.parse(budgetsRaw));
      if (goalsRaw) setSavingGoals(JSON.parse(goalsRaw));
    } catch {}
  };

  const saveTransactions = useCallback(async (data: Transaction[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
  }, []);

  const saveBudgets = useCallback(async (data: Budget[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data));
  }, []);

  const saveGoals = useCallback(async (data: SavingGoal[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data));
  }, []);

  const addTransaction = useCallback(
    (t: Omit<Transaction, "id">) => {
      const newT: Transaction = {
        ...t,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      };
      setTransactions((prev) => {
        const next = [newT, ...prev];
        saveTransactions(next);
        return next;
      });
    },
    [saveTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        saveTransactions(next);
        return next;
      });
    },
    [saveTransactions]
  );

  const updateBudget = useCallback(
    (id: string, spent: number) => {
      setBudgets((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, spent } : b));
        saveBudgets(next);
        return next;
      });
    },
    [saveBudgets]
  );

  const addSavingGoal = useCallback(
    (g: Omit<SavingGoal, "id">) => {
      const newG: SavingGoal = {
        ...g,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      };
      setSavingGoals((prev) => {
        const next = [newG, ...prev];
        saveGoals(next);
        return next;
      });
    },
    [saveGoals]
  );

  const updateSavingGoal = useCallback(
    (id: string, savedAmount: number) => {
      setSavingGoals((prev) => {
        const next = prev.map((g) =>
          g.id === id ? { ...g, savedAmount } : g
        );
        saveGoals(next);
        return next;
      });
    },
    [saveGoals]
  );

  const deleteSavingGoal = useCallback(
    (id: string) => {
      setSavingGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        saveGoals(next);
        return next;
      });
    },
    [saveGoals]
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0) - transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingGoals,
        addTransaction,
        deleteTransaction,
        updateBudget,
        addSavingGoal,
        updateSavingGoal,
        deleteSavingGoal,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
