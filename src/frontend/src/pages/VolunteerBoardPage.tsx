import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useActor } from "../hooks/useActor";
import type { Campaign } from "../backend.d.ts";
import VolunteerOpportunityCard from "../components/VolunteerOpportunityCard";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
  gold: "oklch(0.72 0.14 72)",
  cream: "oklch(0.97 0.02 88)",
  border: "oklch(0.88 0.03 88)",
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  white: "oklch(1 0 0)",
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function VolunteerCardSkeleton() {
  const shimmerStyle: React.CSSProperties = {
    background:
      "linear-gradient(90deg, oklch(0.90 0.02 88) 25%, oklch(0.95 0.01 88) 50%, oklch(0.90 0.02 88) 75%)",
    backgroundSize: "200% 100%",
    animation: "ooo-shimmer 1.5s infinite",
  };

  return (
    <div
      style={{
        background: T.white,
        borderRadius: "16px",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
      }}
    >
      <div style={{ height: "4px", ...shimmerStyle }} />
      <div style={{ padding: "22px 24px 24px" }}>
        {/* Category badge + volunteer pill row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "22px",
              borderRadius: "999px",
              ...shimmerStyle,
            }}
          />
          <div
            style={{
              width: "130px",
              height: "22px",
              borderRadius: "999px",
              ...shimmerStyle,
            }}
          />
        </div>
        {/* Title */}
        <div
          style={{
            width: "80%",
            height: "22px",
            borderRadius: "6px",
            marginBottom: "8px",
            ...shimmerStyle,
          }}
        />
        <div
          style={{
            width: "55%",
            height: "22px",
            borderRadius: "6px",
            marginBottom: "16px",
            ...shimmerStyle,
          }}
        />
        {/* Description lines */}
        <div
          style={{
            width: "100%",
            height: "14px",
            borderRadius: "4px",
            marginBottom: "6px",
            ...shimmerStyle,
          }}
        />
        <div
          style={{
            width: "75%",
            height: "14px",
            borderRadius: "4px",
            marginBottom: "20px",
            ...shimmerStyle,
          }}
        />
        {/* Availability tags */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>
          {[
            { w: 80, k: "sk-a" },
            { w: 100, k: "sk-b" },
            { w: 65, k: "sk-c" },
            { w: 80, k: "sk-d" },
          ].map(({ w, k }) => (
            <div
              key={k}
              style={{
                width: `${w}px`,
                height: "24px",
                borderRadius: "6px",
                ...shimmerStyle,
              }}
            />
          ))}
        </div>
        {/* Button */}
        <div
          style={{
            width: "100%",
            height: "42px",
            borderRadius: "10px",
            ...shimmerStyle,
          }}
        />
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
interface VolunteerStatsBarProps {
  campaigns: Campaign[];
  totalVolunteers: number;
}

function VolunteerStatsBar({ campaigns, totalVolunteers }: VolunteerStatsBarProps) {
  const activeCampaigns = campaigns.filter((c) => c.active).length;
  const skillsCount = new Set(campaigns.map((c) => c.category)).size * 3;
  const timeSlotsCount = 4; // weekday morning/afternoon, evenings, weekends

  const stats = [
    { label: "Total Opportunities", value: activeCampaigns.toString() },
    { label: "Volunteers Registered", value: totalVolunteers.toLocaleString() },
    { label: "Skills Welcomed", value: `${skillsCount}+` },
    { label: "Time Slots Available", value: timeSlotsCount.toString() },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "1px",
        background: T.border,
        borderRadius: "14px",
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        marginBottom: "48px",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: T.white,
            padding: "18px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: T.green,
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.7rem",
              color: T.muted,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function VolunteerBoardPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const loadedRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!actor || actorLoading || loadedRef.current) return;
    loadedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const allCampaigns = await actor.allCampaigns();
      setCampaigns(allCampaigns);

      // Load volunteer counts in parallel
      if (allCampaigns.length > 0) {
        const volunteerCounts = await Promise.all(
          allCampaigns.map((c) =>
            actor
              .getVolunteersByCampaign(c.id)
              .then((vs) => vs.length)
              .catch(() => 0)
          )
        );
        setTotalVolunteers(volunteerCounts.reduce((sum, n) => sum + n, 0));
      }
    } catch (err) {
      setError("Unable to load volunteer opportunities. Please try again shortly.");
      console.error("Volunteer board load error:", err);
      loadedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [actor, actorLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLoading = loading || actorLoading;
  const activeCampaigns = campaigns.filter((c) => c.active);

  return (
    <>
      <style>{`
        @keyframes ooo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ooo-fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ooo-expand {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ooo-vol-card-enter {
          animation: ooo-fadeInUp 0.35s ease forwards;
        }
      `}</style>

      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: T.cream,
          paddingBottom: "80px",
        }}
      >
        {/* ── Page header ─────────────────────────────────────── */}
        <header
          style={{
            background:
              "linear-gradient(160deg, oklch(0.94 0.04 155) 0%, oklch(0.97 0.02 88) 60%)",
            borderBottom: `1px solid ${T.border}`,
            padding: "56px 24px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 16px",
                  borderRadius: "999px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "oklch(0.72 0.14 72 / 0.12)",
                  color: T.gold,
                  border: "1px solid oklch(0.72 0.14 72 / 0.25)",
                }}
              >
                OrganicOpulence Network
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                fontWeight: 700,
                color: T.green,
                lineHeight: 1.1,
                marginBottom: "12px",
              }}
            >
              Volunteer Hub
            </h1>

            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: T.gold,
                marginBottom: "16px",
              }}
            >
              Give your time, skills &amp; heart
            </p>

            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.95rem",
                color: T.muted,
                lineHeight: 1.7,
                maxWidth: "540px",
                margin: "0 auto 24px",
              }}
            >
              Every cause here needs passionate people, not just funding. Offer your time, your skills, or your presence — and become part of the change you want to see in the world.
            </p>

            <button
              type="button"
              onClick={() => navigate({ to: "/charitable" })}
              style={{
                padding: "9px 22px",
                borderRadius: "8px",
                border: `1.5px solid ${T.green}`,
                background: "transparent",
                color: T.green,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.green;
                e.currentTarget.style.color = T.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = T.green;
              }}
            >
              ← View All Campaigns
            </button>
          </div>
        </header>

        {/* ── Content container ────────────────────────────────── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 0" }}>
          {/* Stats bar */}
          {!isLoading && !error && campaigns.length > 0 && (
            <VolunteerStatsBar campaigns={campaigns} totalVolunteers={totalVolunteers} />
          )}

          {/* ── Error state ───────────────────────────────────── */}
          {error && (
            <div
              style={{
                background: "oklch(0.95 0.04 15)",
                border: "1px solid oklch(0.85 0.06 15)",
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.9rem",
                  color: "oklch(0.38 0.12 15)",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  loadedRef.current = false;
                  loadData();
                }}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: T.green,
                  color: T.white,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Section heading ───────────────────────────────── */}
          {!isLoading && !error && campaigns.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: T.charcoal,
                  marginBottom: "6px",
                }}
              >
                Open Opportunities
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.875rem",
                  color: T.muted,
                }}
              >
                {activeCampaigns.length} campaign{activeCampaigns.length !== 1 ? "s" : ""} welcoming volunteers — find the one that speaks to you.
              </p>
            </div>
          )}

          {/* ── Opportunity grid ──────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {isLoading ? (
              ["s0", "s1", "s2"].map((key) => (
                <VolunteerCardSkeleton key={key} />
              ))
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <div
                  key={Number(campaign.id)}
                  className="ooo-vol-card-enter"
                  style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
                >
                  <VolunteerOpportunityCard campaign={campaign} />
                </div>
              ))
            ) : (
              // Empty state
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "80px 24px",
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
                    background: "oklch(0.92 0.04 155)",
                    marginBottom: "24px",
                    fontSize: "2.2rem",
                  }}
                >
                  🤝
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "10px",
                  }}
                >
                  No opportunities yet
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.9rem",
                    color: T.muted,
                    maxWidth: "380px",
                    margin: "0 auto 24px",
                    lineHeight: 1.7,
                  }}
                >
                  Volunteer opportunities will appear here once campaigns are launched. Check back soon — or start a campaign yourself!
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/charitable" })}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    border: "none",
                    background: T.green,
                    color: T.white,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Explore Campaigns
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default VolunteerBoardPage;
