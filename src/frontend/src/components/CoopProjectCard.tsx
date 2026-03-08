import type { CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CoopProject {
  id: string;
  title: string;
  description: string;
  category:
    | "Agriculture"
    | "Housing"
    | "Energy"
    | "Technology"
    | "Finance"
    | "Health"
    | "Education";
  status: "Planning" | "Active" | "Completed";
  goalAmount: number;
  amountFunded: number;
  memberCount: number;
  lead: string;
  location: string;
  tags: string[];
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  border: "oklch(0.88 0.03 88)",
  white: "oklch(1 0 0)",
  cream: "oklch(0.97 0.02 88)",
  gold: "oklch(0.72 0.14 72)",
  goldLight: "oklch(0.96 0.04 72)",
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  CoopProject["category"],
  { bg: string; text: string; border: string; emoji: string }
> = {
  Agriculture: {
    bg: "oklch(0.93 0.06 155)",
    text: "oklch(0.32 0.12 155)",
    border: "oklch(0.80 0.08 155)",
    emoji: "🌾",
  },
  Housing: {
    bg: "oklch(0.93 0.06 230)",
    text: "oklch(0.32 0.10 230)",
    border: "oklch(0.80 0.08 230)",
    emoji: "🏘️",
  },
  Energy: {
    bg: "oklch(0.96 0.08 72)",
    text: "oklch(0.42 0.14 72)",
    border: "oklch(0.84 0.10 72)",
    emoji: "⚡",
  },
  Technology: {
    bg: "oklch(0.93 0.06 290)",
    text: "oklch(0.32 0.10 290)",
    border: "oklch(0.80 0.08 290)",
    emoji: "💻",
  },
  Finance: {
    bg: T.goldLight,
    text: "oklch(0.42 0.14 72)",
    border: "oklch(0.84 0.10 72)",
    emoji: "💰",
  },
  Health: {
    bg: "oklch(0.94 0.06 10)",
    text: "oklch(0.38 0.12 10)",
    border: "oklch(0.82 0.08 10)",
    emoji: "❤️",
  },
  Education: {
    bg: "oklch(0.93 0.06 200)",
    text: "oklch(0.32 0.10 200)",
    border: "oklch(0.80 0.08 200)",
    emoji: "📚",
  },
};

const STATUS_CONFIG: Record<
  CoopProject["status"],
  { dot: string; label: string }
> = {
  Active: { dot: "oklch(0.55 0.16 155)", label: "Active" },
  Planning: { dot: "oklch(0.65 0.14 72)", label: "Planning" },
  Completed: { dot: "oklch(0.55 0.10 200)", label: "Completed" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ─── CoopProjectCard ──────────────────────────────────────────────────────────
interface CoopProjectCardProps {
  project: CoopProject;
  index?: number;
}

export default function CoopProjectCard({
  project,
  index = 0,
}: CoopProjectCardProps) {
  const cat = CATEGORY_CONFIG[project.category];
  const stat = STATUS_CONFIG[project.status];
  const progress =
    project.goalAmount > 0
      ? Math.min((project.amountFunded / project.goalAmount) * 100, 100)
      : 0;

  const cardStyle: CSSProperties = {
    background: T.white,
    borderRadius: "18px",
    border: `1px solid ${T.border}`,
    overflow: "hidden",
    boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  };

  return (
    <article
      data-ocid={`coop.project.card.${index + 1}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 8px 28px oklch(0.18 0.01 200 / 0.12), 0 0 0 1px ${cat.border}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 12px oklch(0.18 0.01 200 / 0.06)";
      }}
    >
      {/* Category stripe */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${cat.text}, ${cat.border})`,
        }}
      />

      <div style={{ padding: "22px 24px 24px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {/* Category badge */}
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: cat.text,
                background: cat.bg,
                border: `1px solid ${cat.border}`,
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {cat.emoji} {project.category}
            </span>
            {/* Status badge */}
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.68rem",
                fontWeight: 600,
                color: T.muted,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: stat.dot,
                  display: "inline-block",
                }}
              />
              {stat.label}
            </span>
          </div>
          {/* Member count pill */}
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: T.green,
              background: T.greenLight,
              border: "1px solid oklch(0.82 0.06 155)",
              borderRadius: "999px",
              padding: "3px 10px",
              whiteSpace: "nowrap",
            }}
          >
            👥 {project.memberCount} members
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: T.charcoal,
            marginBottom: "6px",
            lineHeight: 1.35,
          }}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.84rem",
            color: T.muted,
            lineHeight: 1.65,
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>

        {/* Lead + location row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.78rem",
              color: T.muted,
            }}
          >
            <span
              style={{
                color: T.gold,
                fontStyle: "italic",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 600,
              }}
            >
              {project.lead}
            </span>
            <span style={{ color: T.muted }}>, Lead</span>
          </span>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.78rem",
              color: T.muted,
            }}
          >
            📍 {project.location}
          </span>
        </div>

        {/* Funding progress */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.76rem",
                color: T.muted,
                fontWeight: 600,
              }}
            >
              {formatCurrency(project.amountFunded)} raised
            </span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.76rem",
                color: T.muted,
              }}
            >
              Goal: {formatCurrency(project.goalAmount)} ·{" "}
              <strong style={{ color: T.charcoal }}>
                {Math.round(progress)}%
              </strong>
            </span>
          </div>
          <div
            style={{
              height: "6px",
              background: T.cream,
              borderRadius: "999px",
              overflow: "hidden",
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${T.green}, oklch(0.55 0.16 155))`,
                borderRadius: "999px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  color: T.muted,
                  background: T.cream,
                  border: `1px solid ${T.border}`,
                  borderRadius: "6px",
                  padding: "2px 8px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
