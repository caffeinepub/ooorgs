import { useState } from "react";
import { ChevronDown } from "lucide-react";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

type PhaseStatus = "In Progress" | "Planned";

interface Phase {
  number: number;
  title: string;
  description: string;
  status: PhaseStatus;
}

const PHASES: Phase[] = [
  {
    number: 1,
    title: "Foundation & Navigation Shell",
    description: "Brand identity, navigation, and placeholder pages",
    status: "In Progress",
  },
  {
    number: 2,
    title: "OOO Charitable: Campaigns",
    description: "Campaign cards, goals, progress tracking",
    status: "Planned",
  },
  {
    number: 3,
    title: "OOO Charitable: Donations & Fractionalization",
    description: "Donation modals, FinFranFran units, volunteer sign-up",
    status: "Planned",
  },
  {
    number: 4,
    title: "OOO Corporations: Accounting Core",
    description: "Chart of accounts, income and expense registers",
    status: "Planned",
  },
  {
    number: 5,
    title: "OOO Corporations: Reporting",
    description: "ROI charts, executive summaries, financial reports",
    status: "Planned",
  },
  {
    number: 6,
    title: "OOO Co-operatives: Collective Projects",
    description: "Project cards, fractional ownership, member directory",
    status: "Planned",
  },
  {
    number: 7,
    title: "OOO DAO: Governance",
    description: "Proposals, voting, passed resolutions, sovereignty services",
    status: "Planned",
  },
  {
    number: 8,
    title: "Unified Dashboard",
    description: "KPI command center with live data from all branches",
    status: "Planned",
  },
  {
    number: 9,
    title: "Multi-User & Authorization",
    description: "Role-based access: Visitor, Donor, Member, Manager, Admin",
    status: "Planned",
  },
  {
    number: 10,
    title: "Wallet & Live Payments",
    description: "Real wallet connections, live donations, cross-branch ledger sync",
    status: "Planned",
  },
];

interface PhaseItemProps {
  phase: Phase;
  isOpen: boolean;
  onToggle: () => void;
}

function PhaseItem({ phase, isOpen, onToggle }: PhaseItemProps) {
  const isInProgress = phase.status === "In Progress";

  return (
    <div
      style={{
        border: `1px solid ${isOpen ? "oklch(0.38 0.12 155 / 0.25)" : "oklch(0.88 0.03 88)"}`,
        borderRadius: "10px",
        overflow: "hidden",
        background: isOpen ? "oklch(0.38 0.12 155 / 0.03)" : "oklch(0.97 0.02 88)",
        transition: "border-color 0.2s ease, background 0.2s ease",
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Phase number circle */}
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isInProgress ? OOO_GREEN : "oklch(0.88 0.03 88)",
            color: isInProgress ? "oklch(0.97 0.02 88)" : OOO_CHARCOAL,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 700,
            flexShrink: 0,
            transition: "background 0.2s ease",
          }}
        >
          {phase.number}
        </span>

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.9375rem",
            fontWeight: isOpen ? 600 : 500,
            color: OOO_CHARCOAL,
            lineHeight: 1.4,
          }}
        >
          {phase.title}
        </span>

        {/* Status badge */}
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: isInProgress ? "oklch(0.38 0.12 155 / 0.1)" : "oklch(0.88 0.03 88)",
            color: isInProgress ? OOO_GREEN : "oklch(0.55 0.02 200)",
            flexShrink: 0,
          }}
        >
          {phase.status}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={18}
          style={{
            color: "oklch(0.55 0.02 200)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div
          style={{
            padding: "0 20px 16px 64px",
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.875rem",
              color: OOO_CHARCOAL,
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            {phase.description}
          </p>
          {isInProgress && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: OOO_GREEN,
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: OOO_GREEN,
                  letterSpacing: "0.03em",
                }}
              >
                Active — building now
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RoadmapAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  function handleToggle(index: number) {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }

  return (
    <section
      aria-label="10-Phase Implementation Roadmap"
      style={{
        background: "oklch(0.93 0.02 88)",
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Section heading */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: OOO_GOLD,
              marginBottom: "8px",
            }}
          >
            Our Journey
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: OOO_CHARCOAL,
              lineHeight: 1.2,
            }}
          >
            Our 10-Phase Journey
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.9375rem",
              color: OOO_CHARCOAL,
              opacity: 0.55,
              marginTop: "10px",
              lineHeight: 1.5,
            }}
          >
            A transparent roadmap — you know exactly where we are and where we are going.
          </p>
        </div>

        {/* Accordion list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PHASES.map((phase, index) => (
            <PhaseItem
              key={phase.number}
              phase={phase}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Completion indicator */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "999px",
              background: "oklch(0.88 0.03 88)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "10%",
                height: "100%",
                background: `linear-gradient(to right, ${OOO_GREEN}, ${OOO_GOLD})`,
                borderRadius: "999px",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: OOO_GREEN,
              whiteSpace: "nowrap",
            }}
          >
            1 of 10 phases
          </span>
        </div>
      </div>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
}

export default RoadmapAccordion;
