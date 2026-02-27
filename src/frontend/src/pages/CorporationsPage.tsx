import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Search,
  Pencil,
  Plus,
  BookOpen,
  FileText,
  BarChart3,
  Info,
  Loader2,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useActor } from "@/hooks/useActor";
import type { IncomeEntry as BackendIncomeEntry, ExpenseEntry as BackendExpenseEntry } from "@/backend.d";

// ─── Constants ───────────────────────────────────────────────────────────────
const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CREAM = "oklch(0.97 0.02 88)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

// ─── Types ───────────────────────────────────────────────────────────────────
type IncomeCategory =
  | "Donations"
  | "Grants"
  | "Unit Sales"
  | "Sponsorship"
  | "Treasury"
  | "Membership"
  | "Events";

type ExpenseCategory =
  | "Personnel"
  | "Operations"
  | "Marketing"
  | "Technology"
  | "Programs"
  | "Admin"
  | "Events"
  | "Travel";

// Local normalized entry (bigint id converted to number for keys)
interface LocalIncomeEntry {
  id: number;
  date: string;
  ref: string;
  description: string;
  category: IncomeCategory;
  source: string;
  amount: number;
}

interface LocalExpenseEntry {
  id: number;
  date: string;
  ref: string;
  description: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
}

// Normalize a backend entry to a local entry
function normalizeEntry(entry: BackendIncomeEntry): LocalIncomeEntry {
  return {
    id: Number(entry.id),
    date: entry.date,
    ref: entry.ref,
    description: entry.description,
    category: entry.category as IncomeCategory,
    source: entry.source,
    amount: entry.amount,
  };
}

// Normalize a backend expense entry to a local expense entry
function normalizeExpenseEntry(entry: BackendExpenseEntry): LocalExpenseEntry {
  return {
    id: Number(entry.id),
    date: entry.date,
    ref: entry.ref,
    description: entry.description,
    category: entry.category as ExpenseCategory,
    vendor: entry.vendor,
    amount: entry.amount,
  };
}

interface AccountEntry {
  code: string;
  name: string;
}

interface AccountGroup {
  type: string;
  accounts: AccountEntry[];
}

// ─── Mock Data (fallback/reference only) ─────────────────────────────────────
const INCOME_ENTRIES: LocalIncomeEntry[] = [
  { id: 1,  date: "2026-02-15", ref: "INC-0015", description: "Community Clean Water Campaign Donations",  category: "Donations",  source: "OOO Charitable",  amount: 45200 },
  { id: 2,  date: "2026-02-12", ref: "INC-0014", description: "Government Grant - Education Initiative",    category: "Grants",     source: "External",        amount: 80000 },
  { id: 3,  date: "2026-02-10", ref: "INC-0013", description: "FinFranFran Unit Sales - Solar Project",    category: "Unit Sales", source: "OOO Co-operatives", amount: 25000 },
  { id: 4,  date: "2026-02-08", ref: "INC-0012", description: "Corporate Sponsorship - TechCorp",          category: "Sponsorship", source: "External",        amount: 15000 },
  { id: 5,  date: "2026-02-05", ref: "INC-0011", description: "Reforestation Fund Donations",              category: "Donations",  source: "OOO Charitable",  amount: 31500 },
  { id: 6,  date: "2026-01-30", ref: "INC-0010", description: "DAO Governance Treasury Transfer",          category: "Treasury",   source: "OOO DAO",          amount: 10000 },
  { id: 7,  date: "2026-01-25", ref: "INC-0009", description: "Women Empowerment Program Donations",       category: "Donations",  source: "OOO Charitable",  amount: 18700 },
  { id: 8,  date: "2026-01-20", ref: "INC-0008", description: "Foundation Grant - Arts & Culture",         category: "Grants",     source: "External",        amount: 22000 },
  { id: 9,  date: "2026-01-15", ref: "INC-0007", description: "Membership Dues Q1",                        category: "Membership", source: "Members",          amount: 8400  },
  { id: 10, date: "2026-01-10", ref: "INC-0006", description: "Urban Garden Cooperative Unit Sales",       category: "Unit Sales", source: "OOO Co-operatives", amount: 12500 },
  { id: 11, date: "2026-01-05", ref: "INC-0005", description: "Year-End Gala Fundraiser",                  category: "Events",     source: "OOO Charitable",  amount: 9800  },
  { id: 12, date: "2025-12-28", ref: "INC-0004", description: "Anonymous Major Donor Gift",                category: "Donations",  source: "External",        amount: 6400  },
];

const EXPENSE_ENTRIES: LocalExpenseEntry[] = [
  { id: 1,  date: "2026-02-14", ref: "EXP-0012", description: "Staff Salaries - February",              category: "Personnel",   vendor: "OOOrgs HR",         amount: 42000 },
  { id: 2,  date: "2026-02-11", ref: "EXP-0011", description: "Cloud Infrastructure & Hosting",         category: "Technology",  vendor: "CloudOps Ltd",      amount: 3800  },
  { id: 3,  date: "2026-02-09", ref: "EXP-0010", description: "Clean Water Campaign Field Operations",  category: "Programs",    vendor: "WaterWorks NGO",     amount: 18500 },
  { id: 4,  date: "2026-02-07", ref: "EXP-0009", description: "Social Media & Outreach Campaign",       category: "Marketing",   vendor: "ImpactMedia Co",     amount: 4200  },
  { id: 5,  date: "2026-02-04", ref: "EXP-0008", description: "Office Rent & Utilities - February",     category: "Operations",  vendor: "GreenSpace Offices", amount: 5500  },
  { id: 6,  date: "2026-01-29", ref: "EXP-0007", description: "Board Meeting & Annual Retreat",         category: "Admin",       vendor: "Internal",           amount: 7200  },
  { id: 7,  date: "2026-01-24", ref: "EXP-0006", description: "Volunteer Coordination Event",           category: "Events",      vendor: "EventsPro",          amount: 3100  },
  { id: 8,  date: "2026-01-19", ref: "EXP-0005", description: "International Program Travel - Africa",  category: "Travel",      vendor: "GlobalFly",          amount: 6400  },
  { id: 9,  date: "2026-01-14", ref: "EXP-0004", description: "Reforestation Program Supplies",         category: "Programs",    vendor: "EcoSupplies Inc",    amount: 22000 },
  { id: 10, date: "2026-01-09", ref: "EXP-0003", description: "Staff Training & Development",           category: "Personnel",   vendor: "LearnHub",           amount: 4800  },
  { id: 11, date: "2026-01-04", ref: "EXP-0002", description: "Legal & Compliance Fees",                category: "Admin",       vendor: "LegalEase LLP",      amount: 8900  },
  { id: 12, date: "2025-12-27", ref: "EXP-0001", description: "Year-End Financial Audit",               category: "Admin",       vendor: "AuditCo Partners",   amount: 6800  },
];

const CHART_OF_ACCOUNTS: AccountGroup[] = [
  {
    type: "Assets",
    accounts: [
      { code: "1100", name: "Cash & Bank Accounts" },
      { code: "1200", name: "Accounts Receivable" },
      { code: "1300", name: "Prepaid Expenses" },
      { code: "1400", name: "Equipment & Assets" },
    ],
  },
  {
    type: "Liabilities",
    accounts: [
      { code: "2100", name: "Accounts Payable" },
      { code: "2200", name: "Accrued Liabilities" },
      { code: "2300", name: "Deferred Revenue" },
    ],
  },
  {
    type: "Equity",
    accounts: [
      { code: "3100", name: "Retained Earnings" },
      { code: "3200", name: "General Reserve Fund" },
      { code: "3300", name: "Restricted Funds" },
    ],
  },
  {
    type: "Income",
    accounts: [
      { code: "4100", name: "Donations Received" },
      { code: "4200", name: "Grants & Subsidies" },
      { code: "4300", name: "Unit Sales Revenue" },
      { code: "4400", name: "Membership Dues" },
      { code: "4500", name: "Event Revenue" },
      { code: "4600", name: "Sponsorship Income" },
    ],
  },
  {
    type: "Expenses",
    accounts: [
      { code: "5100", name: "Program Expenses" },
      { code: "5200", name: "Administrative Costs" },
      { code: "5300", name: "Marketing & Outreach" },
      { code: "5400", name: "Personnel Costs" },
      { code: "5500", name: "Technology & Infrastructure" },
    ],
  },
];

// ─── Category badge styles ────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<IncomeCategory, { bg: string; text: string; border: string }> = {
  Donations:  { bg: "oklch(0.94 0.04 155)", text: "oklch(0.28 0.12 155)", border: "oklch(0.82 0.08 155)" },
  Grants:     { bg: "oklch(0.93 0.04 230)", text: "oklch(0.28 0.12 230)", border: "oklch(0.80 0.08 230)" },
  "Unit Sales":{ bg: "oklch(0.95 0.05 72)",  text: "oklch(0.48 0.14 72)",  border: "oklch(0.85 0.10 72)"  },
  Sponsorship:{ bg: "oklch(0.93 0.04 300)", text: "oklch(0.32 0.12 300)", border: "oklch(0.80 0.08 300)" },
  Treasury:   { bg: "oklch(0.92 0.01 200)", text: "oklch(0.28 0.02 200)", border: "oklch(0.78 0.03 200)" },
  Membership: { bg: "oklch(0.93 0.05 185)", text: "oklch(0.28 0.12 185)", border: "oklch(0.78 0.09 185)" },
  Events:     { bg: "oklch(0.95 0.06 55)",  text: "oklch(0.44 0.14 55)",  border: "oklch(0.83 0.10 55)"  },
};

// ─── Expense category badge styles ───────────────────────────────────────────
const EXPENSE_CATEGORY_STYLES: Record<ExpenseCategory, { bg: string; text: string; border: string }> = {
  Personnel:   { bg: "oklch(0.95 0.04 25)",  text: "oklch(0.38 0.14 25)",  border: "oklch(0.85 0.08 25)"  },
  Operations:  { bg: "oklch(0.94 0.04 45)",  text: "oklch(0.40 0.12 45)",  border: "oklch(0.84 0.08 45)"  },
  Marketing:   { bg: "oklch(0.94 0.04 300)", text: "oklch(0.32 0.12 300)", border: "oklch(0.82 0.08 300)" },
  Technology:  { bg: "oklch(0.93 0.04 230)", text: "oklch(0.28 0.12 230)", border: "oklch(0.80 0.08 230)" },
  Programs:    { bg: "oklch(0.94 0.04 155)", text: "oklch(0.28 0.12 155)", border: "oklch(0.82 0.08 155)" },
  Admin:       { bg: "oklch(0.92 0.01 200)", text: "oklch(0.28 0.02 200)", border: "oklch(0.78 0.03 200)" },
  Events:      { bg: "oklch(0.95 0.06 72)",  text: "oklch(0.44 0.14 72)",  border: "oklch(0.83 0.10 72)"  },
  Travel:      { bg: "oklch(0.94 0.03 185)", text: "oklch(0.30 0.10 185)", border: "oklch(0.80 0.07 185)" },
};

// ─── Account type badge styles ────────────────────────────────────────────────
const ACCOUNT_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Assets:      { bg: "oklch(0.93 0.04 230)", text: "oklch(0.28 0.12 230)", border: "oklch(0.80 0.08 230)" },
  Liabilities: { bg: "oklch(0.94 0.04 15)",  text: "oklch(0.36 0.12 15)",  border: "oklch(0.82 0.08 15)"  },
  Equity:      { bg: "oklch(0.93 0.04 300)", text: "oklch(0.32 0.12 300)", border: "oklch(0.80 0.08 300)" },
  Income:      { bg: "oklch(0.94 0.04 155)", text: "oklch(0.28 0.12 155)", border: "oklch(0.82 0.08 155)" },
  Expenses:    { bg: "oklch(0.95 0.06 55)",  text: "oklch(0.44 0.14 55)",  border: "oklch(0.83 0.10 55)"  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: IncomeCategory }) {
  const style = CATEGORY_STYLES[category];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}

// ─── Expense Category Badge ───────────────────────────────────────────────────
function ExpenseCategoryBadge({ category }: { category: ExpenseCategory }) {
  const style = EXPENSE_CATEGORY_STYLES[category];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}

// ─── KPI Summary Bar ──────────────────────────────────────────────────────────
interface KpiSummaryBarProps {
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
}

function KpiSummaryBar({ totalIncome, totalExpenses, netPosition }: KpiSummaryBarProps) {
  const isNetPositive = netPosition >= 0;
  const kpis = [
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      icon: <TrendingUp size={18} />,
      accent: OOO_GREEN,
      accentBg: "oklch(0.94 0.04 155)",
      positive: true,
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: <TrendingDown size={18} />,
      accent: "oklch(0.55 0.18 25)",
      accentBg: "oklch(0.95 0.03 25)",
      positive: false,
    },
    {
      label: "Net Position",
      value: formatCurrency(netPosition),
      icon: <DollarSign size={18} />,
      accent: isNetPositive ? OOO_GREEN : "oklch(0.45 0.18 25)",
      accentBg: isNetPositive ? "oklch(0.92 0.06 155)" : "oklch(0.95 0.03 25)",
      positive: isNetPositive,
      highlight: true,
    },
    {
      label: "This Month",
      value: formatCurrency(23400),
      icon: <Calendar size={18} />,
      accent: OOO_GOLD,
      accentBg: "oklch(0.96 0.04 72)",
      positive: true,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        padding: "24px 0 8px",
      }}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: kpi.highlight ? (isNetPositive ? "oklch(0.38 0.12 155)" : "oklch(0.50 0.18 25)") : "white",
            border: kpi.highlight
              ? `1.5px solid ${isNetPositive ? "oklch(0.38 0.12 155)" : "oklch(0.50 0.18 25)"}`
              : "1px solid oklch(0.88 0.03 88)",
            borderRadius: "14px",
            padding: "18px 20px",
            boxShadow: kpi.highlight
              ? `0 4px 24px ${isNetPositive ? "oklch(0.38 0.12 155 / 0.18)" : "oklch(0.50 0.18 25 / 0.18)"}`
              : "0 1px 4px oklch(0.18 0.01 200 / 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: kpi.highlight ? "oklch(0.88 0.06 155)" : "oklch(0.45 0.02 155)",
              }}
            >
              {kpi.label}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: kpi.highlight ? (isNetPositive ? "oklch(0.48 0.12 155)" : "oklch(0.60 0.18 25)") : kpi.accentBg,
                color: kpi.highlight ? (isNetPositive ? "oklch(0.90 0.06 155)" : "oklch(0.97 0.02 25)") : kpi.accent,
              }}
            >
              {kpi.icon}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: kpi.highlight ? "white" : (kpi.positive ? OOO_GREEN : "oklch(0.45 0.18 25)"),
              lineHeight: 1,
            }}
          >
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Income Register ──────────────────────────────────────────────────────────
interface IncomeRegisterProps {
  entries: LocalIncomeEntry[];
  loading: boolean;
  error: string | null;
  onEntryAdded: (entry: LocalIncomeEntry) => void;
  actor: ReturnType<typeof useActor>["actor"];
}

function IncomeRegister({ entries, loading, error, onEntryAdded, actor }: IncomeRegisterProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        search.trim() === "" ||
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.ref.toLowerCase().includes(search.toLowerCase()) ||
        entry.source.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || entry.category === categoryFilter;
      const matchesMonth =
        monthFilter === "all" || entry.date.startsWith(monthFilter);
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [entries, search, categoryFilter, monthFilter]);

  const subtotal = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.amount, 0),
    [filteredEntries]
  );

  const categories: IncomeCategory[] = [
    "Donations", "Grants", "Unit Sales", "Sponsorship", "Treasury", "Membership", "Events",
  ];

  const months = useMemo(() => {
    const seen = new Set<string>();
    entries.forEach((e) => {
      const ym = e.date.slice(0, 7);
      seen.add(ym);
    });
    return Array.from(seen)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const [year, month] = ym.split("-");
        const label = new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        return { value: ym, label };
      });
  }, [entries]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((sk) => (
          <Skeleton key={sk} style={{ height: "52px", borderRadius: "8px", background: "oklch(0.92 0.02 88)" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "oklch(0.97 0.02 25)",
          border: "1px solid oklch(0.88 0.06 25)",
          borderRadius: "12px",
          padding: "32px 24px",
          textAlign: "center",
          color: "oklch(0.45 0.12 25)",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "oklch(0.55 0.04 155)",
              pointerEvents: "none",
            }}
          />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "0.875rem" }}
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger style={{ width: "170px", height: "38px", fontSize: "0.875rem" }}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month filter */}
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger style={{ width: "170px", height: "38px", fontSize: "0.875rem" }}>
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add entry button */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger asChild>
            <Button
              style={{
                background: OOO_GREEN,
                color: "white",
                height: "38px",
                fontSize: "0.875rem",
                gap: "6px",
                marginLeft: "auto",
              }}
            >
              <Plus size={15} />
              Add Income Entry
            </Button>
          </DialogTrigger>
          <AddIncomeModal
            onClose={() => setAddModalOpen(false)}
            onSuccess={(newEntry) => {
              onEntryAdded(newEntry);
              setAddModalOpen(false);
            }}
            actor={actor}
          />
        </Dialog>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          border: "1px solid oklch(0.88 0.03 88)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: "oklch(0.96 0.02 88)",
                borderBottom: "1px solid oklch(0.88 0.03 88)",
              }}
            >
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)", paddingLeft: "20px" }}>Date</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)" }}>Reference #</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)" }}>Description</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)" }}>Category</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)" }}>Source</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.02 155)", textAlign: "right" }}>Amount</TableHead>
              <TableHead style={{ width: "48px" }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ color: "oklch(0.55 0.02 155)", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.9rem" }}>
                    No entries match your filters.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry, idx) => (
                <TableRow
                  key={entry.id}
                  style={{
                    background: idx % 2 === 0 ? "white" : "oklch(0.99 0.01 88)",
                    borderBottom: "1px solid oklch(0.93 0.02 88)",
                    transition: "background 0.12s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "oklch(0.95 0.03 155)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      idx % 2 === 0 ? "white" : "oklch(0.99 0.01 88)";
                  }}
                >
                  <TableCell style={{ paddingLeft: "20px", fontSize: "0.85rem", color: OOO_CHARCOAL, whiteSpace: "nowrap" }}>
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.78rem",
                        color: "oklch(0.45 0.08 155)",
                        background: "oklch(0.94 0.03 155)",
                        padding: "2px 8px",
                        borderRadius: "5px",
                        border: "1px solid oklch(0.86 0.06 155)",
                      }}
                    >
                      {entry.ref}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: "0.875rem", color: OOO_CHARCOAL, maxWidth: "260px" }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={entry.category} />
                  </TableCell>
                  <TableCell style={{ fontSize: "0.85rem", color: "oklch(0.45 0.02 155)", whiteSpace: "nowrap" }}>
                    {entry.source}
                  </TableCell>
                  <TableCell style={{ textAlign: "right", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: OOO_GREEN, whiteSpace: "nowrap" }}>
                    {formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell style={{ paddingRight: "16px" }}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "30px",
                              height: "30px",
                              borderRadius: "7px",
                              background: "transparent",
                              border: "1px solid oklch(0.88 0.03 88)",
                              color: "oklch(0.55 0.02 155)",
                              cursor: "pointer",
                              transition: "all 0.12s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.94 0.03 155)";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.75 0.08 155)";
                              (e.currentTarget as HTMLButtonElement).style.color = OOO_GREEN;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.88 0.03 88)";
                              (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.55 0.02 155)";
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit entry</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Subtotal bar */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 20px",
          background: "oklch(0.94 0.04 155)",
          border: "1px solid oklch(0.84 0.08 155)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.85rem", color: "oklch(0.28 0.10 155)" }}>
          Showing <strong>{filteredEntries.length}</strong> {filteredEntries.length === 1 ? "entry" : "entries"}
          {categoryFilter !== "all" && ` · Category: ${categoryFilter}`}
          {monthFilter !== "all" && ` · Month filter active`}
        </span>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: OOO_GREEN }}>
          Subtotal: {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}

// ─── Expense Register ─────────────────────────────────────────────────────────
interface ExpenseRegisterProps {
  entries: LocalExpenseEntry[];
  loading: boolean;
  error: string | null;
  onEntryAdded: (entry: LocalExpenseEntry) => void;
  actor: ReturnType<typeof useActor>["actor"];
}

function ExpenseRegister({ entries, loading, error, onEntryAdded, actor }: ExpenseRegisterProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        search.trim() === "" ||
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.ref.toLowerCase().includes(search.toLowerCase()) ||
        entry.vendor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || entry.category === categoryFilter;
      const matchesMonth =
        monthFilter === "all" || entry.date.startsWith(monthFilter);
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [entries, search, categoryFilter, monthFilter]);

  const subtotal = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.amount, 0),
    [filteredEntries]
  );

  // Running balance: cumulative sum from oldest→newest, displayed newest→oldest
  const runningBalances = useMemo(() => {
    // Sort ascending by date to compute cumulative from oldest
    const sorted = [...filteredEntries].sort((a, b) => a.date.localeCompare(b.date));
    const balanceMap = new Map<number, number>();
    let cumulative = 0;
    sorted.forEach((entry) => {
      cumulative += entry.amount;
      balanceMap.set(entry.id, cumulative);
    });
    return balanceMap;
  }, [filteredEntries]);

  const expenseCategories: ExpenseCategory[] = [
    "Personnel", "Operations", "Marketing", "Technology", "Programs", "Admin", "Events", "Travel",
  ];

  const months = useMemo(() => {
    const seen = new Set<string>();
    entries.forEach((e) => {
      const ym = e.date.slice(0, 7);
      seen.add(ym);
    });
    return Array.from(seen)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const label = new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        return { value: ym, label };
      });
  }, [entries]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((sk) => (
          <Skeleton key={sk} style={{ height: "52px", borderRadius: "8px", background: "oklch(0.95 0.02 25)" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "oklch(0.97 0.02 25)",
          border: "1px solid oklch(0.88 0.06 25)",
          borderRadius: "12px",
          padding: "32px 24px",
          textAlign: "center",
          color: "oklch(0.45 0.12 25)",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "oklch(0.55 0.04 25)",
              pointerEvents: "none",
            }}
          />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "0.875rem" }}
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger style={{ width: "170px", height: "38px", fontSize: "0.875rem" }}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {expenseCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month filter */}
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger style={{ width: "170px", height: "38px", fontSize: "0.875rem" }}>
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Expense Entry button */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger asChild>
            <Button
              style={{
                background: "oklch(0.45 0.18 25)",
                color: "white",
                height: "38px",
                fontSize: "0.875rem",
                gap: "6px",
                marginLeft: "auto",
              }}
            >
              <Plus size={15} />
              Add Expense Entry
            </Button>
          </DialogTrigger>
          <AddExpenseModal
            onClose={() => setAddModalOpen(false)}
            onSuccess={(newEntry) => {
              onEntryAdded(newEntry);
              setAddModalOpen(false);
            }}
            actor={actor}
          />
        </Dialog>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          border: "1px solid oklch(0.88 0.03 88)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: "oklch(0.97 0.02 25)",
                borderBottom: "1px solid oklch(0.90 0.04 25)",
              }}
            >
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)", paddingLeft: "20px" }}>Date</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)" }}>Reference #</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)" }}>Description</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)" }}>Category</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)" }}>Vendor</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.45 0.06 25)", textAlign: "right" }}>Amount</TableHead>
              <TableHead style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.02 155)", textAlign: "right", paddingRight: "20px" }}>Running Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ color: "oklch(0.55 0.02 155)", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.9rem" }}>
                    No entries match your filters.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry, idx) => (
                <TableRow
                  key={entry.id}
                  style={{
                    background: idx % 2 === 0 ? "white" : "oklch(0.99 0.01 25)",
                    borderBottom: "1px solid oklch(0.94 0.02 25)",
                    transition: "background 0.12s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "oklch(0.97 0.04 25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      idx % 2 === 0 ? "white" : "oklch(0.99 0.01 25)";
                  }}
                >
                  <TableCell style={{ paddingLeft: "20px", fontSize: "0.85rem", color: OOO_CHARCOAL, whiteSpace: "nowrap" }}>
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.78rem",
                        color: "oklch(0.45 0.10 25)",
                        background: "oklch(0.96 0.03 25)",
                        padding: "2px 8px",
                        borderRadius: "5px",
                        border: "1px solid oklch(0.88 0.06 25)",
                      }}
                    >
                      {entry.ref}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: "0.875rem", color: OOO_CHARCOAL, maxWidth: "260px" }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ExpenseCategoryBadge category={entry.category} />
                  </TableCell>
                  <TableCell style={{ fontSize: "0.85rem", color: "oklch(0.45 0.02 155)", whiteSpace: "nowrap" }}>
                    {entry.vendor}
                  </TableCell>
                  <TableCell style={{ textAlign: "right", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "oklch(0.45 0.18 25)", whiteSpace: "nowrap" }}>
                    {formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell style={{ textAlign: "right", paddingRight: "20px" }}>
                    <span
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.78rem",
                        color: "oklch(0.52 0.03 155)",
                        background: "oklch(0.95 0.01 155)",
                        padding: "2px 8px",
                        borderRadius: "5px",
                        border: "1px solid oklch(0.88 0.02 155)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(runningBalances.get(entry.id) ?? 0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Subtotal bar */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 20px",
          background: "oklch(0.96 0.03 25)",
          border: "1px solid oklch(0.88 0.06 25)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.85rem", color: "oklch(0.40 0.10 25)" }}>
          Showing <strong>{filteredEntries.length}</strong> {filteredEntries.length === 1 ? "entry" : "entries"}
          {categoryFilter !== "all" && ` · Category: ${categoryFilter}`}
          {monthFilter !== "all" && ` · Month filter active`}
        </span>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "oklch(0.45 0.18 25)" }}>
          Subtotal: {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}

// ─── Add Income Modal ─────────────────────────────────────────────────────────
interface AddIncomeModalProps {
  onClose: () => void;
  onSuccess: (newEntry: LocalIncomeEntry) => void;
  actor: ReturnType<typeof useActor>["actor"];
}

function AddIncomeModal({ onClose, onSuccess, actor }: AddIncomeModalProps) {
  const categories: IncomeCategory[] = [
    "Donations", "Grants", "Unit Sales", "Sponsorship", "Treasury", "Membership", "Events",
  ];

  const [date, setDate] = useState("");
  const [ref, setRef] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IncomeCategory | "">("");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValid =
    date.trim() !== "" &&
    ref.trim() !== "" &&
    description.trim() !== "" &&
    category !== "" &&
    source.trim() !== "" &&
    amount.trim() !== "" &&
    parseFloat(amount) > 0;

  async function handleSubmit() {
    if (!isValid) {
      setValidationError("Please fill in all fields. Amount must be greater than 0.");
      return;
    }
    if (!actor) {
      setValidationError("Backend not ready yet. Please wait a moment and try again.");
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      const result = await actor.addIncomeEntry(
        date.trim(),
        ref.trim(),
        description.trim(),
        category as IncomeCategory,
        source.trim(),
        parseFloat(amount)
      );
      const normalized = normalizeEntry(result);
      toast.success(`Income entry "${normalized.ref}" saved successfully.`);
      onSuccess(normalized);
    } catch (err) {
      console.error("Failed to add income entry:", err);
      toast.error("Failed to save income entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent style={{ maxWidth: "520px" }}>
      <DialogHeader>
        <DialogTitle
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.3rem",
            color: OOO_GREEN,
          }}
        >
          Add Income Entry
        </DialogTitle>
        <DialogDescription style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.875rem" }}>
          Record a new income transaction in the register.
        </DialogDescription>
      </DialogHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "8px 0" }}>
        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Reference # */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Reference #</Label>
          <Input
            placeholder="INC-0016"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Description (full width) */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Description</Label>
          <Input
            placeholder="Enter a clear description of this income..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as IncomeCategory)}>
            <SelectTrigger style={{ fontSize: "0.875rem" }}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Source</Label>
          <Input
            placeholder="e.g. OOO Charitable, External"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Amount (full width) */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Amount (USD)</Label>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            style={{
              gridColumn: "1 / -1",
              color: "oklch(0.45 0.18 25)",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.8rem",
              background: "oklch(0.97 0.02 25)",
              border: "1px solid oklch(0.88 0.06 25)",
              borderRadius: "8px",
              padding: "8px 14px",
            }}
          >
            {validationError}
          </div>
        )}
      </div>

      <DialogFooter style={{ marginTop: "8px", gap: "10px" }}>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          style={{ fontSize: "0.875rem" }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          style={{
            background: isValid && !submitting ? OOO_GREEN : "oklch(0.80 0.08 155)",
            color: "white",
            fontSize: "0.875rem",
            gap: "6px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Saving..." : "Save Entry"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
interface AddExpenseModalProps {
  onClose: () => void;
  onSuccess: (newEntry: LocalExpenseEntry) => void;
  actor: ReturnType<typeof useActor>["actor"];
}

function AddExpenseModal({ onClose, onSuccess, actor }: AddExpenseModalProps) {
  const categories: ExpenseCategory[] = [
    "Personnel", "Operations", "Marketing", "Technology", "Programs", "Admin", "Events", "Travel",
  ];

  const [date, setDate] = useState("");
  const [ref, setRef] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValid =
    date.trim() !== "" &&
    ref.trim() !== "" &&
    description.trim() !== "" &&
    category !== "" &&
    vendor.trim() !== "" &&
    amount.trim() !== "" &&
    parseFloat(amount) > 0;

  async function handleSubmit() {
    if (!isValid) {
      setValidationError("Please fill in all fields. Amount must be greater than 0.");
      return;
    }
    if (!actor) {
      setValidationError("Backend not ready yet. Please wait a moment and try again.");
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      const result = await actor.addExpenseEntry(
        date.trim(),
        ref.trim(),
        description.trim(),
        category as ExpenseCategory,
        vendor.trim(),
        parseFloat(amount)
      );
      const normalized = normalizeExpenseEntry(result);
      toast.success(`Expense entry "${normalized.ref}" saved successfully.`);
      onSuccess(normalized);
    } catch (err) {
      console.error("Failed to add expense entry:", err);
      toast.error("Failed to save expense entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const OOO_EXPENSE_RED = "oklch(0.45 0.18 25)";

  return (
    <DialogContent style={{ maxWidth: "520px" }}>
      <DialogHeader>
        <DialogTitle
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.3rem",
            color: OOO_EXPENSE_RED,
          }}
        >
          Add Expense Entry
        </DialogTitle>
        <DialogDescription style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.875rem" }}>
          Record a new expense transaction in the register.
        </DialogDescription>
      </DialogHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "8px 0" }}>
        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Reference # */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Reference #</Label>
          <Input
            placeholder="EXP-0013"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Description (full width) */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Description</Label>
          <Input
            placeholder="Enter a clear description of this expense..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
            <SelectTrigger style={{ fontSize: "0.875rem" }}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vendor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Vendor</Label>
          <Input
            placeholder="e.g. CloudOps Ltd, Internal"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Amount (full width) */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>Amount (USD)</Label>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: "0.875rem" }}
          />
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            style={{
              gridColumn: "1 / -1",
              color: OOO_EXPENSE_RED,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.8rem",
              background: "oklch(0.97 0.02 25)",
              border: "1px solid oklch(0.88 0.06 25)",
              borderRadius: "8px",
              padding: "8px 14px",
            }}
          >
            {validationError}
          </div>
        )}
      </div>

      <DialogFooter style={{ marginTop: "8px", gap: "10px" }}>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          style={{ fontSize: "0.875rem" }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          style={{
            background: isValid && !submitting ? OOO_EXPENSE_RED : "oklch(0.80 0.08 25)",
            color: "white",
            fontSize: "0.875rem",
            gap: "6px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Saving..." : "Save Entry"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Chart of Accounts ────────────────────────────────────────────────────────
function ChartOfAccounts() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {CHART_OF_ACCOUNTS.map((group) => {
        const typeStyle = ACCOUNT_TYPE_STYLES[group.type];
        return (
          <div
            key={group.type}
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.03 88)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Group header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 20px",
                background: "oklch(0.97 0.01 88)",
                borderBottom: "1px solid oklch(0.88 0.03 88)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: typeStyle.bg,
                  color: typeStyle.text,
                  border: `1px solid ${typeStyle.border}`,
                }}
              >
                {group.type}
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: OOO_CHARCOAL,
                }}
              >
                {group.type} Accounts
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.78rem",
                  color: "oklch(0.55 0.02 155)",
                }}
              >
                {group.accounts.length} accounts
              </span>
            </div>

            {/* Account rows */}
            {group.accounts.map((account, idx) => (
              <div
                key={account.code}
                className="account-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px 20px",
                  background: idx % 2 === 0 ? "white" : "oklch(0.99 0.005 88)",
                  borderBottom: idx < group.accounts.length - 1 ? "1px solid oklch(0.93 0.02 88)" : "none",
                  transition: "background 0.12s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "oklch(0.45 0.08 155)",
                    background: "oklch(0.94 0.03 155)",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "1px solid oklch(0.86 0.06 155)",
                    minWidth: "58px",
                    textAlign: "center",
                  }}
                >
                  {account.code}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.9rem",
                    color: OOO_CHARCOAL,
                    flex: 1,
                  }}
                >
                  {account.name}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.78rem",
                    color: "oklch(0.55 0.03 155)",
                    fontStyle: "italic",
                  }}
                >
                  Balance: —
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── General Ledger Placeholder ───────────────────────────────────────────────
function GeneralLedgerPlaceholder() {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid oklch(0.88 0.03 88)",
        borderRadius: "12px",
        padding: "64px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "72px",
          height: "72px",
          borderRadius: "18px",
          background: "oklch(0.95 0.05 72)",
          color: OOO_GOLD,
          marginBottom: "24px",
          border: "1px solid oklch(0.88 0.10 72)",
        }}
      >
        <BarChart3 size={34} strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: OOO_CHARCOAL,
          marginBottom: "12px",
        }}
      >
        General Ledger
      </h3>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.9rem",
          color: "oklch(0.45 0.02 155)",
          lineHeight: 1.7,
          maxWidth: "420px",
          margin: "0 auto 28px",
        }}
      >
        General Ledger entries will be added in Phase 5 — Reporting &amp; Financial Summaries. All debit/credit journal entries will appear here once wired.
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          borderRadius: "999px",
          background: "oklch(0.95 0.05 72)",
          border: "1px solid oklch(0.88 0.10 72)",
          color: "oklch(0.48 0.14 72)",
          fontSize: "0.78rem",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <Info size={13} />
        Coming in Phase 5
      </div>
    </div>
  );
}

// ─── Budget Tracker ───────────────────────────────────────────────────────────
const BUDGET_TARGETS: Record<ExpenseCategory, number> = {
  Personnel:  55000,
  Operations:  8000,
  Marketing:   7000,
  Technology:  6000,
  Programs:   45000,
  Admin:      20000,
  Events:      6000,
  Travel:     10000,
};

const EXPENSE_CATEGORIES_ORDERED: ExpenseCategory[] = [
  "Personnel", "Programs", "Admin", "Operations",
  "Marketing", "Technology", "Events", "Travel",
];

// ─── Set Budget Dialog ────────────────────────────────────────────────────────
interface SetBudgetDialogProps {
  open: boolean;
  category: ExpenseCategory;
  currentBudget: number;
  actor: ReturnType<typeof useActor>["actor"];
  onSuccess: (category: ExpenseCategory, amount: number) => void;
  onClose: () => void;
}

function SetBudgetDialog({ open, category, currentBudget, actor, onSuccess, onClose }: SetBudgetDialogProps) {
  const [amount, setAmount] = useState(String(currentBudget));
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset amount when the dialog opens or the currentBudget prop changes
  React.useEffect(() => {
    if (open) {
      setAmount(String(currentBudget));
      setValidationError(null);
    }
  }, [open, currentBudget]);

  const parsedAmount = parseFloat(amount);
  const isValid = amount.trim() !== "" && !isNaN(parsedAmount) && parsedAmount > 0;

  async function handleSave() {
    if (!isValid) {
      setValidationError("Please enter a valid positive number.");
      return;
    }
    if (!actor) {
      setValidationError("Backend not ready yet. Please wait and try again.");
      return;
    }
    setValidationError(null);
    setSaving(true);
    try {
      await actor.setBudgetTarget(category, parsedAmount);
      toast.success(`Budget for ${category} set to ${formatCurrency(parsedAmount)}.`);
      onSuccess(category, parsedAmount);
      onClose();
    } catch (err) {
      console.error("Failed to set budget target:", err);
      toast.error(`Failed to update budget for ${category}. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) onClose(); }}>
      <DialogContent style={{ maxWidth: "420px" }}>
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.25rem",
              color: OOO_GREEN,
            }}
          >
            Set Budget — {category}
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.875rem" }}>
            Update the budget target for the <strong>{category}</strong> expense category.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "8px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Label style={{ fontSize: "0.8rem", fontWeight: 600, color: OOO_CHARCOAL }}>
              Budget Amount (USD)
            </Label>
            <Input
              type="number"
              placeholder="0"
              min="1"
              step="100"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setValidationError(null);
              }}
              style={{ fontSize: "0.9rem" }}
              autoFocus
            />
          </div>

          {validationError && (
            <div
              style={{
                color: "oklch(0.45 0.18 25)",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.8rem",
                background: "oklch(0.97 0.02 25)",
                border: "1px solid oklch(0.88 0.06 25)",
                borderRadius: "8px",
                padding: "8px 14px",
              }}
            >
              {validationError}
            </div>
          )}
        </div>

        <DialogFooter style={{ gap: "10px", marginTop: "8px" }}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            style={{ fontSize: "0.875rem" }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValid}
            style={{
              background: isValid && !saving ? OOO_GREEN : "oklch(0.80 0.08 155)",
              color: "white",
              fontSize: "0.875rem",
              gap: "6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Save Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BudgetTrackerProps {
  entries: LocalExpenseEntry[];
  budgetTargets: Record<ExpenseCategory, number>;
  actor: ReturnType<typeof useActor>["actor"];
  onBudgetUpdated: (category: ExpenseCategory, amount: number) => void;
}

function BudgetTracker({ entries, budgetTargets, actor, onBudgetUpdated }: BudgetTrackerProps) {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const actuals = useMemo<Record<ExpenseCategory, number>>(() => {
    const acc: Partial<Record<ExpenseCategory, number>> = {};
    for (const entry of entries) {
      acc[entry.category] = (acc[entry.category] ?? 0) + entry.amount;
    }
    return {
      Personnel:  acc.Personnel  ?? 0,
      Operations: acc.Operations ?? 0,
      Marketing:  acc.Marketing  ?? 0,
      Technology: acc.Technology ?? 0,
      Programs:   acc.Programs   ?? 0,
      Admin:      acc.Admin      ?? 0,
      Events:     acc.Events     ?? 0,
      Travel:     acc.Travel     ?? 0,
    };
  }, [entries]);

  const totalBudgeted = useMemo(
    () => Object.values(budgetTargets).reduce((s, v) => s + v, 0),
    [budgetTargets]
  );
  const totalSpent = useMemo(
    () => Object.values(actuals).reduce((s, v) => s + v, 0),
    [actuals]
  );
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPct = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  function getStatus(budget: number, actual: number): "on-track" | "warning" | "over" {
    if (budget === 0) return "on-track";
    const pct = (actual / budget) * 100;
    if (pct >= 100) return "over";
    if (pct >= 75) return "warning";
    return "on-track";
  }

  const statusConfig = {
    "on-track": {
      label: "On Track",
      color: "oklch(0.38 0.12 155)",
      bg: "oklch(0.94 0.04 155)",
      border: "oklch(0.82 0.08 155)",
      icon: <CheckCircle2 size={13} />,
    },
    "warning": {
      label: "Warning",
      color: "oklch(0.58 0.14 72)",
      bg: "oklch(0.96 0.06 72)",
      border: "oklch(0.86 0.10 72)",
      icon: <AlertTriangle size={13} />,
    },
    "over": {
      label: "Over Budget",
      color: "oklch(0.45 0.18 25)",
      bg: "oklch(0.96 0.03 25)",
      border: "oklch(0.86 0.08 25)",
      icon: <XCircle size={13} />,
    },
  };

  function getBarColor(pct: number): string {
    if (pct >= 100) return "oklch(0.55 0.18 25)";
    if (pct >= 75)  return "oklch(0.65 0.14 72)";
    return "oklch(0.48 0.12 155)";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* Set Budget Dialog (rendered once, reused for all categories) */}
      {editingCategory && (
        <SetBudgetDialog
          open={editingCategory !== null}
          category={editingCategory}
          currentBudget={budgetTargets[editingCategory]}
          actor={actor}
          onSuccess={(cat, amt) => {
            onBudgetUpdated(cat, amt);
            setEditingCategory(null);
          }}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* ── Overall summary bar ─────────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          border: "1px solid oklch(0.88 0.03 88)",
          borderRadius: "14px",
          padding: "24px 28px",
          boxShadow: "0 1px 6px oklch(0.18 0.01 200 / 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "oklch(0.95 0.05 72)",
              color: OOO_GOLD,
              border: "1px solid oklch(0.88 0.10 72)",
              flexShrink: 0,
            }}
          >
            <Target size={17} />
          </span>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: OOO_CHARCOAL,
              margin: 0,
            }}
          >
            Overall Budget Utilisation
          </h3>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: overallPct >= 100
                ? "oklch(0.45 0.18 25)"
                : overallPct >= 75
                  ? "oklch(0.55 0.14 72)"
                  : OOO_GREEN,
            }}
          >
            {overallPct.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              height: "10px",
              borderRadius: "999px",
              background: "oklch(0.93 0.02 88)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${overallPct}%`,
                borderRadius: "999px",
                background: getBarColor((totalSpent / totalBudgeted) * 100),
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Three KPI chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Total Budgeted",
              value: formatCurrency(totalBudgeted),
              color: "oklch(0.45 0.02 155)",
              bg: "oklch(0.96 0.01 88)",
              border: "oklch(0.88 0.02 88)",
            },
            {
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              color: "oklch(0.45 0.18 25)",
              bg: "oklch(0.97 0.02 25)",
              border: "oklch(0.90 0.05 25)",
            },
            {
              label: totalRemaining >= 0 ? "Remaining" : "Over Budget",
              value: formatCurrency(Math.abs(totalRemaining)),
              color: totalRemaining >= 0 ? OOO_GREEN : "oklch(0.45 0.18 25)",
              bg: totalRemaining >= 0 ? "oklch(0.94 0.04 155)" : "oklch(0.96 0.03 25)",
              border: totalRemaining >= 0 ? "oklch(0.84 0.08 155)" : "oklch(0.86 0.08 25)",
            },
          ].map((chip) => (
            <div
              key={chip.label}
              style={{
                background: chip.bg,
                border: `1px solid ${chip.border}`,
                borderRadius: "10px",
                padding: "14px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "oklch(0.50 0.03 155)",
                  marginBottom: "6px",
                }}
              >
                {chip.label}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: chip.color,
                  lineHeight: 1,
                }}
              >
                {chip.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-category cards grid ─────────────────────────────────────── */}
      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: OOO_CHARCOAL,
            marginBottom: "16px",
          }}
        >
          Category Breakdown
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {EXPENSE_CATEGORIES_ORDERED.map((cat) => {
            const budget = budgetTargets[cat];
            const actual = actuals[cat];
            const remaining = budget - actual;
            const pct = budget > 0 ? (actual / budget) * 100 : 0;
            const capped = Math.min(pct, 100);
            const status = getStatus(budget, actual);
            const catStyle = EXPENSE_CATEGORY_STYLES[cat];
            const sc = statusConfig[status];

            return (
              <div
                key={cat}
                style={{
                  background: "white",
                  border: "1px solid oklch(0.88 0.03 88)",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 4px oklch(0.18 0.01 200 / 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Card header: category badge + status badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      background: catStyle.bg,
                      color: catStyle.text,
                      border: `1px solid ${catStyle.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sc.icon}
                    {sc.label}
                  </span>
                </div>

                {/* Budget vs Actual numbers */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "oklch(0.55 0.02 155)",
                        marginBottom: "2px",
                      }}
                    >
                      Spent
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: pct >= 100
                          ? "oklch(0.45 0.18 25)"
                          : pct >= 75
                            ? "oklch(0.52 0.14 72)"
                            : OOO_CHARCOAL,
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(actual)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "oklch(0.55 0.02 155)",
                        marginBottom: "2px",
                      }}
                    >
                      Budget
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "oklch(0.50 0.03 155)",
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(budget)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      height: "7px",
                      borderRadius: "999px",
                      background: "oklch(0.93 0.02 88)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${capped}%`,
                        borderRadius: "999px",
                        background: getBarColor(pct),
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: getBarColor(pct),
                      }}
                    >
                      {pct.toFixed(1)}% used
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: "0.72rem",
                        color: remaining >= 0 ? "oklch(0.45 0.08 155)" : "oklch(0.45 0.18 25)",
                        fontWeight: 500,
                      }}
                    >
                      {remaining >= 0
                        ? `${formatCurrency(remaining)} left`
                        : `${formatCurrency(Math.abs(remaining))} over`}
                    </span>
                  </div>
                </div>

                {/* Set Budget button */}
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(cat)}
                  style={{
                    width: "100%",
                    height: "34px",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: OOO_GREEN,
                    borderColor: "oklch(0.82 0.08 155)",
                    gap: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pencil size={13} />
                  Set Budget
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CorporationsPage() {
  const { actor, isFetching: actorFetching } = useActor();

  // ── Income state ──────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<LocalIncomeEntry[]>(INCOME_ENTRIES);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  // ── Expense state ─────────────────────────────────────────────────────────
  const [expenseEntries, setExpenseEntries] = useState<LocalExpenseEntry[]>(EXPENSE_ENTRIES);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  // ── Budget targets state ───────────────────────────────────────────────────
  const [budgetTargets, setBudgetTargets] = useState<Record<ExpenseCategory, number>>(BUDGET_TARGETS);

  const totalIncome = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries]
  );

  const totalExpenses = useMemo(
    () => expenseEntries.reduce((sum, e) => sum + e.amount, 0),
    [expenseEntries]
  );

  const netPosition = totalIncome - totalExpenses;

  useEffect(() => {
    if (!actor || actorFetching) return;
    let cancelled = false;

    async function fetchAll() {
      const [incomeResult, expenseResult, budgetResult] = await Promise.allSettled([
        actor!.getAllIncomeEntries(),
        actor!.getAllExpenseEntries(),
        actor!.getBudgetTargets(),
      ]);

      if (cancelled) return;

      // Handle income
      if (incomeResult.status === "fulfilled") {
        if (incomeResult.value.length > 0) {
          const normalized = incomeResult.value.map(normalizeEntry);
          normalized.sort((a, b) => b.date.localeCompare(a.date));
          setEntries(normalized);
        }
        setLoadingEntries(false);
      } else {
        console.error("Failed to fetch income entries:", incomeResult.reason);
        setEntriesError("Unable to load income entries from the network. Showing cached data.");
        setLoadingEntries(false);
      }

      // Handle expenses
      if (expenseResult.status === "fulfilled") {
        if (expenseResult.value.length > 0) {
          const normalized = expenseResult.value.map(normalizeExpenseEntry);
          normalized.sort((a, b) => b.date.localeCompare(a.date));
          setExpenseEntries(normalized);
        }
        setLoadingExpenses(false);
      } else {
        console.error("Failed to fetch expense entries:", expenseResult.reason);
        setExpensesError("Unable to load expense entries from the network. Showing cached data.");
        setLoadingExpenses(false);
      }

      // Handle budget targets — merge backend values over defaults
      if (budgetResult.status === "fulfilled" && budgetResult.value.length > 0) {
        setBudgetTargets((prev) => {
          const merged = { ...prev };
          for (const [cat, amt] of budgetResult.value) {
            const key = cat as ExpenseCategory;
            if (key in merged) {
              merged[key] = amt;
            }
          }
          return merged;
        });
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [actor, actorFetching]);

  function handleEntryAdded(newEntry: LocalIncomeEntry) {
    setEntries((prev) => [newEntry, ...prev]);
  }

  function handleExpenseEntryAdded(newEntry: LocalExpenseEntry) {
    setExpenseEntries((prev) => [newEntry, ...prev]);
  }

  function handleBudgetUpdated(category: ExpenseCategory, amount: number) {
    setBudgetTargets((prev) => ({ ...prev, [category]: amount }));
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        background: OOO_CREAM,
        paddingBottom: "64px",
      }}
    >
      {/* Page header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid oklch(0.88 0.03 88)",
          padding: "0 24px",
          position: "sticky",
          top: "64px",
          zIndex: 10,
          boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Top row: back link + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingTop: "20px",
              paddingBottom: "4px",
            }}
          >
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "oklch(0.55 0.04 155)",
                textDecoration: "none",
                transition: "color 0.15s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = OOO_GREEN;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.55 0.04 155)";
              }}
            >
              <ArrowLeft size={13} />
              Home
            </Link>
            <span style={{ color: "oklch(0.75 0.02 155)", fontSize: "0.8rem" }}>/</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "oklch(0.95 0.05 72)",
                  color: OOO_GOLD,
                  flexShrink: 0,
                }}
              >
                <FileText size={15} />
              </span>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: OOO_GREEN,
                  margin: 0,
                }}
              >
                OOO Corporations
              </h1>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "oklch(0.94 0.04 155)",
                  color: "oklch(0.28 0.12 155)",
                  border: "1px solid oklch(0.82 0.08 155)",
                }}
              >
                Accounting Suite
              </span>
            </div>
          </div>

          {/* KPI bar */}
          <KpiSummaryBar totalIncome={totalIncome} totalExpenses={totalExpenses} netPosition={netPosition} />
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 0" }}>
        {/* Section intro */}
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.95rem",
              color: "oklch(0.45 0.02 155)",
              lineHeight: 1.6,
              maxWidth: "680px",
            }}
          >
            Modern management tools for on-the-ground impact. Track income sources, manage your chart of accounts, and maintain complete ledger records across all OOOrgs operations.
          </p>
        </div>

        <Tabs defaultValue="income">
          <TabsList
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.03 88)",
              borderRadius: "10px",
              padding: "4px",
              height: "auto",
              marginBottom: "24px",
              gap: "4px",
            }}
          >
            <TabsTrigger
              value="income"
              style={{
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 20px",
                gap: "7px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingUp size={14} />
              Income Register
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              style={{
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 20px",
                gap: "7px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TrendingDown size={14} />
              Expense Register
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              style={{
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 20px",
                gap: "7px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Target size={14} />
              Budget Tracker
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              style={{
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 20px",
                gap: "7px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BookOpen size={14} />
              Chart of Accounts
            </TabsTrigger>
            <TabsTrigger
              value="ledger"
              style={{
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 20px",
                gap: "7px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BarChart3 size={14} />
              General Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income">
            <IncomeRegister
              entries={entries}
              loading={loadingEntries}
              error={entriesError}
              onEntryAdded={handleEntryAdded}
              actor={actor}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseRegister
              entries={expenseEntries}
              loading={loadingExpenses}
              error={expensesError}
              onEntryAdded={handleExpenseEntryAdded}
              actor={actor}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTracker
              entries={expenseEntries}
              budgetTargets={budgetTargets}
              actor={actor}
              onBudgetUpdated={handleBudgetUpdated}
            />
          </TabsContent>

          <TabsContent value="accounts">
            <ChartOfAccounts />
          </TabsContent>

          <TabsContent value="ledger">
            <GeneralLedgerPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default CorporationsPage;
