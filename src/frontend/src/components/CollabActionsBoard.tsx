import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CollabAction {
  id: string;
  title: string;
  description: string;
  category:
    | "Planning"
    | "Outreach"
    | "Finance"
    | "Technology"
    | "Training"
    | "Governance";
  status: "Open" | "In Progress" | "Completed";
  lead: string;
  participants: string[];
  dueDate: string;
  createdAt: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_ACTIONS: CollabAction[] = [
  {
    id: "ca1",
    title: "Launch FinFranFran Unit Registry",
    description:
      "Set up the fractional ownership registry for all active co-operative projects to enable transparent unit tracking.",
    category: "Finance",
    status: "In Progress",
    lead: "Fatima Al-Hassan",
    participants: ["Kwame Asante", "Priya Nair"],
    dueDate: "2026-04-15",
    createdAt: "2026-02-01",
  },
  {
    id: "ca2",
    title: "Community Onboarding Workshops",
    description:
      "Run three regional onboarding sessions to bring new members into the co-operative framework and explain their rights and responsibilities.",
    category: "Training",
    status: "Open",
    lead: "Zawadi Ochieng",
    participants: ["Amara Diallo"],
    dueDate: "2026-05-01",
    createdAt: "2026-02-10",
  },
  {
    id: "ca3",
    title: "Solar Grid Feasibility Report",
    description:
      "Compile technical and financial feasibility data for expanding the Solar Energy Collective to two new districts.",
    category: "Planning",
    status: "In Progress",
    lead: "Carlos Mendez",
    participants: ["Fatima Al-Hassan", "Kwame Asante"],
    dueDate: "2026-04-30",
    createdAt: "2026-01-20",
  },
  {
    id: "ca4",
    title: "DAO Governance Charter Draft",
    description:
      "Draft the foundational governance charter for OOOrgs DAO including voting thresholds, proposal categories, and resolution procedures.",
    category: "Governance",
    status: "Completed",
    lead: "Kwame Asante",
    participants: ["Priya Nair", "Zawadi Ochieng"],
    dueDate: "2026-03-01",
    createdAt: "2026-01-05",
  },
  {
    id: "ca5",
    title: "Digital Skills Platform Build",
    description:
      "Develop the online learning platform for the Digital Skills Co-op, including course modules, progress tracking, and certification.",
    category: "Technology",
    status: "In Progress",
    lead: "Zawadi Ochieng",
    participants: ["Carlos Mendez"],
    dueDate: "2026-06-15",
    createdAt: "2026-02-15",
  },
  {
    id: "ca6",
    title: "Stakeholder Outreach Campaign",
    description:
      "Identify and contact 50 potential partner organisations across Africa, Asia, and South America for the OrganicOpulence network.",
    category: "Outreach",
    status: "Open",
    lead: "Amara Diallo",
    participants: ["Fatima Al-Hassan", "Priya Nair", "Kwame Asante"],
    dueDate: "2026-05-30",
    createdAt: "2026-03-01",
  },
];

// ─── Colour maps ──────────────────────────────────────────────────────────────
const CATEGORY_COLOURS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Finance: { bg: "rgba(234,179,8,0.12)", text: "#a16207", border: "#ca8a0433" },
  Training: {
    bg: "rgba(168,85,247,0.12)",
    text: "#7c3aed",
    border: "#7c3aed33",
  },
  Planning: {
    bg: "rgba(59,130,246,0.12)",
    text: "#2563eb",
    border: "#2563eb33",
  },
  Governance: {
    bg: "rgba(20,184,166,0.12)",
    text: "#0f766e",
    border: "#14b8a633",
  },
  Technology: {
    bg: "rgba(34,197,94,0.12)",
    text: "#16a34a",
    border: "#16a34a33",
  },
  Outreach: {
    bg: "rgba(249,115,22,0.12)",
    text: "#c2410c",
    border: "#f9731633",
  },
};

const STATUS_COLOURS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Open: { bg: "rgba(148,163,184,0.12)", text: "#475569", dot: "#94a3b8" },
  "In Progress": {
    bg: "rgba(59,130,246,0.12)",
    text: "#2563eb",
    dot: "#3b82f6",
  },
  Completed: { bg: "rgba(34,197,94,0.12)", text: "#16a34a", dot: "#22c55e" },
};

const FILTERS = ["All", "Open", "In Progress", "Completed"] as const;
type FilterType = (typeof FILTERS)[number];

// ─── Component ────────────────────────────────────────────────────────────────
export function CollabActionsBoard() {
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered =
    filter === "All"
      ? SAMPLE_ACTIONS
      : SAMPLE_ACTIONS.filter((a) => a.status === filter);

  const counts = {
    All: SAMPLE_ACTIONS.length,
    Open: SAMPLE_ACTIONS.filter((a) => a.status === "Open").length,
    "In Progress": SAMPLE_ACTIONS.filter((a) => a.status === "In Progress")
      .length,
    Completed: SAMPLE_ACTIONS.filter((a) => a.status === "Completed").length,
  };

  return (
    <section
      data-ocid="collab_actions.section"
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', serif)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "oklch(var(--foreground))",
              margin: 0,
            }}
          >
            Collaborative Actions Board
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "oklch(var(--muted-foreground))",
              margin: "0.25rem 0 0",
            }}
          >
            Shared initiatives across all OOO Co-operative projects
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["Open", "In Progress", "Completed"] as const).map((s) => {
            const c = STATUS_COLOURS[s];
            return (
              <span
                key={s}
                style={{
                  background: c.bg,
                  color: c.text,
                  borderRadius: "999px",
                  padding: "0.2rem 0.65rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <span
                  style={{
                    width: "0.45rem",
                    height: "0.45rem",
                    borderRadius: "50%",
                    background: c.dot,
                    display: "inline-block",
                  }}
                />
                {counts[s]} {s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div
        data-ocid="collab_actions.filter.tab"
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          borderBottom: "1px solid oklch(var(--border) / 0.5)",
          paddingBottom: "0.5rem",
        }}
      >
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.3rem 0.85rem",
              borderRadius: "999px",
              border: "1px solid",
              borderColor:
                filter === f
                  ? "oklch(var(--primary))"
                  : "oklch(var(--border) / 0.5)",
              background:
                filter === f ? "oklch(var(--primary))" : "transparent",
              color:
                filter === f
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {f}
            <span
              style={{
                marginLeft: "0.4rem",
                background:
                  filter === f
                    ? "rgba(255,255,255,0.25)"
                    : "oklch(var(--muted) / 0.5)",
                color:
                  filter === f
                    ? "oklch(var(--primary-foreground))"
                    : "oklch(var(--foreground) / 0.6)",
                borderRadius: "999px",
                padding: "0.05rem 0.4rem",
                fontSize: "0.7rem",
              }}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div
          data-ocid="collab_actions.empty_state"
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "oklch(var(--muted-foreground))",
            fontSize: "0.9rem",
          }}
        >
          No actions match this filter.
        </div>
      ) : (
        <div
          data-ocid="collab_actions.list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((action, idx) => {
            const cat = CATEGORY_COLOURS[action.category] ?? {
              bg: "rgba(100,116,139,0.1)",
              text: "#475569",
              border: "#64748b33",
            };
            const sta = STATUS_COLOURS[action.status];
            const due = new Date(action.dueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const isOverdue =
              new Date(action.dueDate) < new Date() &&
              action.status !== "Completed";

            return (
              <div
                key={action.id}
                data-ocid={`collab_actions.item.${idx + 1}`}
                style={{
                  background: "oklch(var(--card) / 1)",
                  border: "1px solid oklch(var(--border) / 0.6)",
                  borderRadius: "0.875rem",
                  padding: "1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 6px 20px oklch(var(--primary) / 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Badges */}
                <div
                  style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
                >
                  <span
                    style={{
                      background: cat.bg,
                      color: cat.text,
                      border: `1px solid ${cat.border}`,
                      borderRadius: "999px",
                      padding: "0.15rem 0.55rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {action.category}
                  </span>
                  <span
                    style={{
                      background: sta.bg,
                      color: sta.text,
                      borderRadius: "999px",
                      padding: "0.15rem 0.55rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        width: "0.4rem",
                        height: "0.4rem",
                        borderRadius: "50%",
                        background: sta.dot,
                        display: "inline-block",
                      }}
                    />
                    {action.status}
                  </span>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily:
                      "var(--font-display, 'Playfair Display', serif)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "oklch(var(--foreground))",
                    lineHeight: 1.4,
                  }}
                >
                  {action.title}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "oklch(var(--muted-foreground))",
                    lineHeight: 1.5,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {action.description}
                </p>

                {/* Lead */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.78rem",
                    color: "oklch(var(--muted-foreground))",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "oklch(var(--foreground) / 0.75)",
                    }}
                  >
                    {action.lead}
                  </span>
                  {action.participants.length > 0 && (
                    <span>
                      + {action.participants.length} participant
                      {action.participants.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Due date */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.75rem",
                    color: isOverdue
                      ? "#dc2626"
                      : "oklch(var(--muted-foreground))",
                    fontWeight: isOverdue ? 600 : 400,
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {isOverdue ? "Overdue · " : "Due · "}
                  {due}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
