# OOOrgs

## Current State
- Full Corporations accounting suite with Income Register, Expense Register, Budget Tracker, Chart of Accounts, and General Ledger placeholder
- Budget Tracker shows 8 category cards with hardcoded `BUDGET_TARGETS` constant in the frontend
- Each category card has a "Set Budget" button that is disabled with a tooltip reading "Coming in Phase 5a-ii"
- No backend storage for budget targets exists yet

## Requested Changes (Diff)

### Add
- Backend: `BudgetTarget` type with `category: Text` and `amount: Float`
- Backend: `budgetTargets` Map to store budget targets by category
- Backend: `setBudgetTarget(category: Text, amount: Float) : async Bool` — upsert a budget target
- Backend: `getBudgetTargets() : async [(Text, Float)]` — return all stored budget targets
- Frontend: `SetBudgetDialog` modal component — a small dialog with a numeric amount input and Save/Cancel buttons
- Frontend: Wire the "Set Budget" button on each category card to open the dialog pre-filled with the current budget
- Frontend: On save, call `actor.setBudgetTarget(category, amount)`, update local state, show toast confirmation
- Frontend: On page load, fetch `getBudgetTargets()` and merge with default `BUDGET_TARGETS` (backend wins if present)

### Modify
- `BudgetTracker` component: accept `actor` and `onBudgetUpdated` props; enable "Set Budget" buttons
- `CorporationsPage`: pass `actor` into `BudgetTracker` and maintain `budgetTargets` state (initialized from defaults, then hydrated from backend)

### Remove
- Nothing removed

## Implementation Plan
1. Add `setBudgetTarget` and `getBudgetTargets` functions to `main.mo` with `BudgetTarget` storage
2. Regenerate `backend.d.ts` bindings (or manually add the two new method signatures)
3. Update `CorporationsPage` to load budget targets from backend on mount and keep them in state
4. Update `BudgetTracker` to receive `budgetState`, `actor`, and `onBudgetUpdated` props
5. Add `SetBudgetDialog` inline component with amount input, validation, loading state, and toast feedback
6. Enable "Set Budget" button on each category card — opens dialog pre-filled with current budget value
7. On successful save, update local budget state so progress bars and KPI chips re-render immediately
