import { useState } from "react";

// Self-contained Proposal type (mirrors backend)
export interface Proposal {
  id: bigint;
  title: string;
  description: string;
  proposedBy: string;
  category: string;
  status: string; // "Active" | "Passed" | "Rejected"
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  createdAt: bigint;
  closingDate: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (
    proposalId: bigint,
    vote: "for" | "against" | "abstain",
  ) => Promise<void>;
}

const CATEGORY_PALETTE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Governance: {
    bg: "oklch(0.38 0.12 155 / 0.08)",
    text: "oklch(0.38 0.12 155)",
    border: "oklch(0.38 0.12 155 / 0.2)",
  },
  Finance: {
    bg: "oklch(0.72 0.14 72 / 0.08)",
    text: "oklch(0.72 0.14 72)",
    border: "oklch(0.72 0.14 72 / 0.2)",
  },
  Policy: {
    bg: "oklch(0.55 0.16 264 / 0.08)",
    text: "oklch(0.55 0.16 264)",
    border: "oklch(0.55 0.16 264 / 0.2)",
  },
  Programs: {
    bg: "oklch(0.62 0.18 30 / 0.08)",
    text: "oklch(0.62 0.18 30)",
    border: "oklch(0.62 0.18 30 / 0.2)",
  },
  Technology: {
    bg: "oklch(0.58 0.18 300 / 0.08)",
    text: "oklch(0.58 0.18 300)",
    border: "oklch(0.58 0.18 300 / 0.2)",
  },
};

const STATUS_STYLE: Record<
  string,
  { dot: string; text: string; bg: string; border: string }
> = {
  Active: {
    dot: "oklch(0.62 0.18 145)",
    text: "oklch(0.30 0.12 145)",
    bg: "oklch(0.62 0.18 145 / 0.1)",
    border: "oklch(0.62 0.18 145 / 0.25)",
  },
  Passed: {
    dot: "oklch(0.38 0.12 155)",
    text: "oklch(0.38 0.12 155)",
    bg: "oklch(0.38 0.12 155 / 0.08)",
    border: "oklch(0.38 0.12 155 / 0.2)",
  },
  Rejected: {
    dot: "oklch(0.55 0.22 27)",
    text: "oklch(0.45 0.22 27)",
    bg: "oklch(0.55 0.22 27 / 0.08)",
    border: "oklch(0.55 0.22 27 / 0.2)",
  },
};

function VoteBar({
  votesFor,
  votesAgainst,
  votesAbstain,
}: { votesFor: number; votesAgainst: number; votesAbstain: number }) {
  const total = votesFor + votesAgainst + votesAbstain || 1;
  const forPct = (votesFor / total) * 100;
  const againstPct = (votesAgainst / total) * 100;
  const abstainPct = (votesAbstain / total) * 100;

  return (
    <div
      data-ocid="proposal.vote_bar"
      style={{ display: "flex", flexDirection: "column", gap: "6px" }}
    >
      <div
        style={{
          display: "flex",
          height: "8px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "oklch(0.92 0.01 88)",
        }}
      >
        <div
          style={{
            width: `${forPct}%`,
            background: "oklch(0.55 0.18 145)",
            transition: "width 0.4s ease",
          }}
        />
        <div
          style={{
            width: `${againstPct}%`,
            background: "oklch(0.55 0.22 27)",
            transition: "width 0.4s ease",
          }}
        />
        <div
          style={{
            width: `${abstainPct}%`,
            background: "oklch(0.7 0.04 260)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.72rem",
          color: "oklch(0.18 0.01 200)",
          opacity: 0.7,
        }}
      >
        <span style={{ color: "oklch(0.45 0.18 145)", fontWeight: 600 }}>
          For: {votesFor}
        </span>
        <span style={{ color: "oklch(0.45 0.22 27)", fontWeight: 600 }}>
          Against: {votesAgainst}
        </span>
        <span style={{ color: "oklch(0.5 0.04 260)", fontWeight: 600 }}>
          Abstain: {votesAbstain}
        </span>
        <span style={{ marginLeft: "auto" }}>Total: {total}</span>
      </div>
    </div>
  );
}

export function ProposalCard({ proposal, onVote }: ProposalCardProps) {
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState<"for" | "against" | "abstain" | null>(
    null,
  );
  const [localVotes, setLocalVotes] = useState({
    for: Number(proposal.votesFor),
    against: Number(proposal.votesAgainst),
    abstain: Number(proposal.votesAbstain),
  });

  const catStyle =
    CATEGORY_PALETTE[proposal.category] ?? CATEGORY_PALETTE.Governance;
  const statusStyle = STATUS_STYLE[proposal.status] ?? STATUS_STYLE.Active;
  const isActive = proposal.status === "Active";

  const handleVote = async (vote: "for" | "against" | "abstain") => {
    if (!onVote || voted || !isActive) return;
    setVoting(true);
    try {
      await onVote(proposal.id, vote);
      setLocalVotes((prev) => ({ ...prev, [vote]: prev[vote] + 1 }));
      setVoted(vote);
    } finally {
      setVoting(false);
    }
  };

  return (
    <article
      data-ocid="proposal.card"
      style={{
        background: "#fff",
        border: "1px solid oklch(0.88 0.03 88)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px oklch(0.38 0.12 155 / 0.1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {/* Category badge */}
        <span
          data-ocid="proposal.category_badge"
          style={{
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: catStyle.bg,
            color: catStyle.text,
            border: `1px solid ${catStyle.border}`,
            flexShrink: 0,
          }}
        >
          {proposal.category}
        </span>

        {/* Status badge */}
        <span
          data-ocid="proposal.status_badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "0.7rem",
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: statusStyle.dot,
              display: "inline-block",
            }}
          />
          {proposal.status}
        </span>

        {/* Closing date */}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.72rem",
            color: "oklch(0.18 0.01 200)",
            opacity: 0.55,
            flexShrink: 0,
          }}
        >
          {isActive
            ? `Closes ${proposal.closingDate}`
            : `Closed ${proposal.closingDate}`}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "oklch(0.18 0.01 200)",
          lineHeight: 1.35,
          margin: 0,
        }}
      >
        {proposal.title}
      </h3>

      {/* Description excerpt */}
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.85rem",
          color: "oklch(0.18 0.01 200)",
          opacity: 0.7,
          lineHeight: 1.65,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {proposal.description}
      </p>

      {/* Vote bar */}
      <VoteBar
        votesFor={localVotes.for}
        votesAgainst={localVotes.against}
        votesAbstain={localVotes.abstain}
      />

      {/* Proposed by */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: catStyle.bg,
            border: `1px solid ${catStyle.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: catStyle.text,
            flexShrink: 0,
          }}
        >
          {proposal.proposedBy
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.8rem",
            color: "oklch(0.18 0.01 200)",
            opacity: 0.65,
          }}
        >
          Proposed by{" "}
          <span style={{ fontWeight: 600, opacity: 1 }}>
            {proposal.proposedBy}
          </span>
        </span>
      </div>

      {/* Vote buttons (only for Active proposals) */}
      {isActive && onVote && (
        <div
          data-ocid="proposal.vote_buttons"
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          {(["for", "against", "abstain"] as const).map((v) => {
            const colors = {
              for: {
                bg: "oklch(0.55 0.18 145)",
                hover: "oklch(0.45 0.18 145)",
                text: "#fff",
              },
              against: {
                bg: "oklch(0.55 0.22 27)",
                hover: "oklch(0.45 0.22 27)",
                text: "#fff",
              },
              abstain: {
                bg: "oklch(0.7 0.04 260)",
                hover: "oklch(0.6 0.04 260)",
                text: "#fff",
              },
            }[v];
            const isChosen = voted === v;
            const disabled = !!voted || voting;

            return (
              <button
                type="button"
                key={v}
                data-ocid={`proposal.vote_${v}_button`}
                onClick={() => handleVote(v)}
                disabled={disabled}
                style={{
                  flex: 1,
                  minWidth: "80px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: isChosen ? colors.bg : "oklch(0.95 0.01 88)",
                  color: isChosen ? colors.text : "oklch(0.35 0.01 200)",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled && !isChosen ? 0.45 : 1,
                  transition: "background 0.15s ease, transform 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      colors.bg;
                    (e.currentTarget as HTMLButtonElement).style.color =
                      colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isChosen) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.95 0.01 88)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.35 0.01 200)";
                  }
                }}
              >
                {voting && voted === null
                  ? "..."
                  : v === "for"
                    ? "Vote For"
                    : v === "against"
                      ? "Vote Against"
                      : "Abstain"}
              </button>
            );
          })}
        </div>
      )}

      {voted && (
        <div
          data-ocid="proposal.success_state"
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            background: "oklch(0.55 0.18 145 / 0.08)",
            border: "1px solid oklch(0.55 0.18 145 / 0.25)",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.8rem",
            color: "oklch(0.35 0.18 145)",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Your vote has been recorded. Thank you for participating.
        </div>
      )}
    </article>
  );
}

export default ProposalCard;
