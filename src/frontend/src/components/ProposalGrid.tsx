import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { type Proposal, ProposalCard } from "./ProposalCard";

type FilterStatus = "All" | "Active" | "Passed" | "Rejected";

// Sample proposals shown while backend loads or if empty
const SAMPLE_PROPOSALS: Proposal[] = [
  {
    id: BigInt(1),
    title: "Establish Global Volunteer Recognition Programme",
    description:
      "Create a tiered recognition system for volunteers across all OOOrgs branches, including digital certificates, milestone badges, and an annual awards ceremony. This proposal aims to increase volunteer retention by 40% over 12 months.",
    proposedBy: "Amara Okafor",
    category: "Governance",
    status: "Active",
    votesFor: BigInt(47),
    votesAgainst: BigInt(8),
    votesAbstain: BigInt(5),
    createdAt: BigInt(0),
    closingDate: "2026-04-15",
  },
  {
    id: BigInt(2),
    title: "Allocate 15% of Surplus to FinFranFran Reserve Fund",
    description:
      "Mandate that 15% of any quarterly surplus across OOO Corporations be allocated to a dedicated FinFranFran reserve fund, ensuring sustainable fractional ownership liquidity for co-operative members in perpetuity.",
    proposedBy: "Priya Nair",
    category: "Finance",
    status: "Active",
    votesFor: BigInt(63),
    votesAgainst: BigInt(12),
    votesAbstain: BigInt(3),
    createdAt: BigInt(0),
    closingDate: "2026-04-30",
  },
  {
    id: BigInt(3),
    title: "Adopt Carbon Neutral Operations Standard by 2027",
    description:
      "Commit OOOrgs and all its branches to carbon neutral operations by end of 2027, with quarterly progress reporting to all members and a dedicated sustainability officer role.",
    proposedBy: "Diego Morales",
    category: "Policy",
    status: "Active",
    votesFor: BigInt(89),
    votesAgainst: BigInt(4),
    votesAbstain: BigInt(7),
    createdAt: BigInt(0),
    closingDate: "2026-05-10",
  },
  {
    id: BigInt(4),
    title: "Launch Youth Mentorship Initiative in Nairobi and Lagos",
    description:
      "Fund and staff a 12-month youth mentorship initiative across Nairobi and Lagos, targeting 500 young people aged 16-24 in technology, entrepreneurship, and cooperative business models.",
    proposedBy: "Kwame Asante",
    category: "Programs",
    status: "Passed",
    votesFor: BigInt(112),
    votesAgainst: BigInt(6),
    votesAbstain: BigInt(4),
    createdAt: BigInt(0),
    closingDate: "2026-02-28",
  },
  {
    id: BigInt(5),
    title: "Revise Member Voting Threshold from Simple to Supermajority",
    description:
      "Amend the DAO charter to require a 66.7% supermajority for any proposal that alters financial allocation, membership structure, or core organisational policies.",
    proposedBy: "Sofia Reyes",
    category: "Governance",
    status: "Passed",
    votesFor: BigInt(98),
    votesAgainst: BigInt(21),
    votesAbstain: BigInt(9),
    createdAt: BigInt(0),
    closingDate: "2026-01-31",
  },
  {
    id: BigInt(6),
    title: "Pilot Open-Source Accounting Dashboard",
    description:
      "Commission an open-source version of the OOO Corporations accounting dashboard for publication under Creative Commons, enabling other NGOs and co-operatives worldwide to adopt the same model.",
    proposedBy: "Tariq Hassan",
    category: "Technology",
    status: "Rejected",
    votesFor: BigInt(34),
    votesAgainst: BigInt(67),
    votesAbstain: BigInt(11),
    createdAt: BigInt(0),
    closingDate: "2026-03-01",
  },
];

const FILTER_TABS: FilterStatus[] = ["All", "Active", "Passed", "Rejected"];

const STATUS_COUNT_COLORS: Record<string, string> = {
  Active: "oklch(0.55 0.18 145 / 0.15)",
  Passed: "oklch(0.38 0.12 155 / 0.12)",
  Rejected: "oklch(0.55 0.22 27 / 0.12)",
};

export function ProposalGrid() {
  const { actor, isFetching: actorLoading } = useActor();
  const [proposals, setProposals] = useState<Proposal[]>(SAMPLE_PROPOSALS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("All");

  useEffect(() => {
    if (!actor || actorLoading) return;
    actor
      .getAllProposals()
      .then((data) => {
        if (data.length > 0) setProposals(data as Proposal[]);
      })
      .catch(() => {
        // Keep sample data on error
      })
      .finally(() => setLoading(false));
  }, [actor, actorLoading]);

  const filtered =
    filter === "All" ? proposals : proposals.filter((p) => p.status === filter);

  const counts = {
    All: proposals.length,
    Active: proposals.filter((p) => p.status === "Active").length,
    Passed: proposals.filter((p) => p.status === "Passed").length,
    Rejected: proposals.filter((p) => p.status === "Rejected").length,
  };

  const handleVote = async (
    proposalId: bigint,
    vote: "for" | "against" | "abstain",
  ) => {
    if (!actor) return;
    await actor.voteOnProposal(proposalId, vote);
  };

  // Stats summary
  const totalVotes = proposals.reduce(
    (acc, p) =>
      acc +
      Number(p.votesFor) +
      Number(p.votesAgainst) +
      Number(p.votesAbstain),
    0,
  );
  const passRate =
    proposals.length > 0
      ? Math.round((counts.Passed / proposals.length) * 100)
      : 0;

  return (
    <section
      data-ocid="proposal_grid.section"
      style={{
        width: "100%",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Stats summary bar */}
      <div
        data-ocid="proposal_grid.stats_bar"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {[
          {
            label: "Total Proposals",
            value: proposals.length,
            color: "oklch(0.38 0.12 155)",
          },
          {
            label: "Active",
            value: counts.Active,
            color: "oklch(0.55 0.18 145)",
          },
          {
            label: "Passed",
            value: counts.Passed,
            color: "oklch(0.38 0.12 155)",
          },
          {
            label: "Total Votes Cast",
            value: totalVotes,
            color: "oklch(0.72 0.14 72)",
          },
          {
            label: "Pass Rate",
            value: `${passRate}%`,
            color: "oklch(0.55 0.18 145)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            data-ocid="proposal_grid.stat_card"
            style={{
              background: "#fff",
              border: "1px solid oklch(0.88 0.03 88)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: stat.color,
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "oklch(0.18 0.01 200)",
                opacity: 0.55,
                fontWeight: 500,
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        data-ocid="proposal_grid.filter_tabs"
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = filter === tab;
          const countColor = STATUS_COUNT_COLORS[tab] ?? "oklch(0.88 0.03 88)";
          return (
            <button
              type="button"
              key={tab}
              data-ocid={`proposal_grid.filter_${tab.toLowerCase()}_tab`}
              onClick={() => setFilter(tab)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 16px",
                borderRadius: "999px",
                border: isActive
                  ? "1.5px solid oklch(0.38 0.12 155)"
                  : "1px solid oklch(0.88 0.03 88)",
                background: isActive ? "oklch(0.38 0.12 155)" : "#fff",
                color: isActive ? "#fff" : "oklch(0.18 0.01 200)",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  background: isActive ? "rgba(255,255,255,0.2)" : countColor,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0 5px",
                  color: isActive ? "#fff" : "oklch(0.25 0.01 200)",
                }}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div
          data-ocid="proposal_grid.loading_state"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "280px",
                background:
                  "linear-gradient(90deg, oklch(0.94 0.01 88) 25%, oklch(0.97 0.01 88) 50%, oklch(0.94 0.01 88) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                borderRadius: "16px",
                border: "1px solid oklch(0.88 0.03 88)",
              }}
            />
          ))}
        </div>
      )}

      {/* Proposal cards grid */}
      {!loading && filtered.length > 0 && (
        <div
          data-ocid="proposal_grid.list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filtered.map((proposal, idx) => (
            <div
              key={String(proposal.id)}
              data-ocid={`proposal_grid.item.${idx + 1}`}
            >
              <ProposalCard proposal={proposal} onVote={handleVote} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div
          data-ocid="proposal_grid.empty_state"
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "#fff",
            border: "1px dashed oklch(0.82 0.04 88)",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "oklch(0.72 0.14 72 / 0.08)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🗳
          </div>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.1rem",
              color: "oklch(0.38 0.12 155)",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            No {filter === "All" ? "" : filter.toLowerCase()} proposals yet
          </p>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.85rem",
              color: "oklch(0.18 0.01 200)",
              opacity: 0.55,
              margin: 0,
            }}
          >
            {filter === "Active"
              ? "No active proposals at this time."
              : `No ${filter.toLowerCase()} proposals to display.`}
          </p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

export default ProposalGrid;
