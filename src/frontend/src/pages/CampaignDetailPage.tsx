import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useActor } from "../hooks/useActor";
import type { Campaign } from "../backend.d.ts";
import { ContributionPanel } from "../components/ContributionPanel";
import { FinFranFranPanel } from "../components/FinFranFranPanel";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
  gold: "oklch(0.72 0.14 72)",
  goldLight: "oklch(0.96 0.04 72)",
  goldBorder: "oklch(0.88 0.06 72)",
  cream: "oklch(0.97 0.02 88)",
  border: "oklch(0.88 0.03 88)",
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  white: "oklch(1 0 0)",
  errorBg: "oklch(0.95 0.04 15)",
  errorBorder: "oklch(0.85 0.06 15)",
  errorText: "oklch(0.38 0.12 15)",
};

// ─── Category color map ───────────────────────────────────────────────────────
type CategoryColors = { bg: string; text: string; bar: string };

const CATEGORY_COLORS: Record<string, CategoryColors> = {
  Environment: {
    bg: "oklch(0.92 0.06 155)",
    text: "oklch(0.32 0.10 155)",
    bar: "oklch(0.48 0.13 155)",
  },
  Education: {
    bg: "oklch(0.92 0.05 240)",
    text: "oklch(0.32 0.12 240)",
    bar: "oklch(0.48 0.14 240)",
  },
  Health: {
    bg: "oklch(0.93 0.06 15)",
    text: "oklch(0.35 0.14 15)",
    bar: "oklch(0.52 0.18 15)",
  },
  Community: {
    bg: "oklch(0.94 0.07 60)",
    text: "oklch(0.40 0.14 55)",
    bar: "oklch(0.62 0.16 55)",
  },
  Arts: {
    bg: "oklch(0.92 0.07 310)",
    text: "oklch(0.35 0.14 310)",
    bar: "oklch(0.52 0.18 310)",
  },
  Emergency: {
    bg: "oklch(0.95 0.09 70)",
    text: "oklch(0.42 0.15 65)",
    bar: "oklch(0.65 0.18 65)",
  },
};

const CATEGORY_DEFAULT: CategoryColors = {
  bg: "oklch(0.92 0.03 88)",
  text: "oklch(0.40 0.05 88)",
  bar: T.green,
};

function getCategoryColors(category: string): CategoryColors {
  return CATEGORY_COLORS[category] ?? CATEGORY_DEFAULT;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatGBP = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (ts: bigint) => {
  try {
    return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const calcDaysRemaining = (endAt: bigint): number =>
  Math.max(0, Math.ceil((Number(endAt / 1_000_000n) - Date.now()) / 86400000));

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  const shimmer: React.CSSProperties = {
    background:
      "linear-gradient(90deg, oklch(0.90 0.02 88) 25%, oklch(0.95 0.01 88) 50%, oklch(0.90 0.02 88) 75%)",
    backgroundSize: "200% 100%",
    animation: "ooo-shimmer 1.5s infinite",
    borderRadius: "6px",
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        background: T.cream,
        padding: "40px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "840px", margin: "0 auto" }}>
        {/* Back button placeholder */}
        <div style={{ width: "160px", height: "18px", marginBottom: "36px", ...shimmer }} />
        {/* Badge + title */}
        <div style={{ width: "90px", height: "24px", marginBottom: "16px", borderRadius: "999px", ...shimmer }} />
        <div style={{ width: "70%", height: "40px", marginBottom: "12px", ...shimmer }} />
        <div style={{ width: "50%", height: "40px", marginBottom: "36px", ...shimmer }} />
        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1px",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "28px",
          }}
        >
          {["raised","goal","funded","contrib","days"].map((k) => (
            <div key={k} style={{ height: "80px", ...shimmer, borderRadius: 0 }} />
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ height: "12px", borderRadius: "999px", marginBottom: "36px", ...shimmer }} />
        {/* Description block */}
        {(["line1","line2","line3","line4short"] as const).map((k) => (
          <div
            key={k}
            style={{
              width: k === "line4short" ? "75%" : "100%",
              height: "14px",
              marginBottom: "10px",
              ...shimmer,
            }}
          />
        ))}
      </div>
    </main>
  );
}

// ─── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: T.white,
        padding: "16px 20px",
        textAlign: "center",
        borderRight: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: highlight ? T.gold : T.green,
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.65rem",
          color: T.muted,
          fontWeight: 500,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Main detail page ─────────────────────────────────────────────────────────
export function CampaignDetailPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!actor || actorLoading) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    actor
      .getCampaign(BigInt(campaignId))
      .then((result) => {
        if (cancelled) return;
        if (result === null) {
          setNotFound(true);
        } else {
          setCampaign(result);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch campaign:", err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, actorLoading, campaignId]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || actorLoading) return <DetailSkeleton />;

  // ── Not found / error state ───────────────────────────────────────────────
  if (notFound || !campaign) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: T.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            background: T.errorBg,
            border: `1px solid ${T.errorBorder}`,
            borderRadius: "16px",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: "480px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.5rem",
              color: T.charcoal,
              marginBottom: "12px",
            }}
          >
            Campaign Not Found
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.9rem",
              color: T.muted,
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            We couldn't locate this campaign. It may have been removed or the link may be incorrect.
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
            ← Back to Campaigns
          </button>
        </div>
      </main>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const colors = getCategoryColors(campaign.category);
  const pct =
    campaign.goalAmount > 0
      ? Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100)
      : 0;
  const daysRemaining = calcDaysRemaining(campaign.endAt);

  return (
    <>
      <style>{`
        @keyframes ooo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ooo-fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ooo-progressFill {
          from { width: 0%; }
          to { width: ${pct}%; }
        }
        .ooo-detail-enter {
          animation: ooo-fadeInUp 0.45s ease forwards;
        }
      `}</style>

      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: T.cream,
          paddingBottom: "80px",
        }}
      >
        {/* ── Page header with category accent ─────────────────── */}
        <header
          style={{
            background: `linear-gradient(160deg, ${colors.bg} 0%, oklch(0.97 0.02 88) 70%)`,
            borderBottom: `1px solid ${T.border}`,
            padding: "40px 24px 36px",
          }}
        >
          <div style={{ maxWidth: "840px", margin: "0 auto" }}>
            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate({ to: "/charitable" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: T.green,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0",
                marginBottom: "28px",
                textDecoration: "none",
                opacity: 0.85,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            >
              ← Back to Campaigns
            </button>

            {/* Category badge */}
            <div style={{ marginBottom: "14px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.bar}44`,
                }}
              >
                {campaign.category}
              </span>
            </div>

            {/* Campaign title */}
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
                fontWeight: 700,
                color: T.charcoal,
                lineHeight: 1.15,
                marginBottom: "0",
                animation: "ooo-fadeInUp 0.45s ease forwards",
              }}
            >
              {campaign.title}
            </h1>
          </div>
        </header>

        {/* ── Content container ─────────────────────────────────── */}
        <div
          className="ooo-detail-enter"
          style={{
            maxWidth: "840px",
            margin: "0 auto",
            padding: "36px 24px 0",
          }}
        >
          {/* ── Hero stats bar ────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              background: T.border,
              borderRadius: "14px",
              overflow: "hidden",
              border: `1px solid ${T.border}`,
              marginBottom: "24px",
              boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
            }}
          >
            <StatCell label="Raised" value={formatGBP(campaign.amountRaised)} />
            <StatCell label="Goal" value={formatGBP(campaign.goalAmount)} />
            <StatCell
              label="Funded"
              value={`${Math.round(pct)}%`}
              highlight={pct >= 75}
            />
            <StatCell
              label="Contributors"
              value={Number(campaign.contributors).toLocaleString()}
            />
            <div
              style={{
                background: T.white,
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: daysRemaining <= 7 ? T.errorText : T.charcoal,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {daysRemaining}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.65rem",
                  color: T.muted,
                  fontWeight: 500,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                Days Left
              </div>
            </div>
          </div>

          {/* ── Animated progress bar ─────────────────────────── */}
          <div
            style={{
              height: "12px",
              borderRadius: "999px",
              background: "oklch(0.92 0.02 88)",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: "999px",
                background: colors.bar,
                animation: "ooo-progressFill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                minWidth: pct > 0 ? "12px" : "0",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.78rem",
              color: T.muted,
              marginBottom: "44px",
              textAlign: "right",
            }}
          >
            {Math.round(pct)}% of goal reached
          </div>

          {/* ── Full description ──────────────────────────────── */}
          <section style={{ marginBottom: "40px" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: T.charcoal,
                marginBottom: "16px",
                paddingBottom: "10px",
                borderBottom: `2px solid ${T.border}`,
              }}
            >
              About This Campaign
            </h2>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "1rem",
                color: T.charcoal,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}
            >
              {campaign.fullDescription}
            </p>
          </section>

          {/* ── Organizer bio card ────────────────────────────── */}
          <section
            style={{
              background: T.goldLight,
              border: `1px solid ${T.goldBorder}`,
              borderRadius: "14px",
              padding: "28px 32px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Organizer icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: T.gold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1.3rem",
                }}
              >
                🌿
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "8px",
                  }}
                >
                  {campaign.organizerName}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.9rem",
                    color: T.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {campaign.organizerBio}
                </p>
              </div>
            </div>
          </section>

          {/* ── Tags row ──────────────────────────────────────── */}
          {campaign.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "28px",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: T.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginRight: "4px",
                  flexShrink: 0,
                }}
              >
                Topics:
              </span>
              {campaign.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.78rem",
                    color: T.muted,
                    background: "oklch(0.93 0.01 200)",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    border: `1px solid ${T.border}`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Campaign dates row ────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              marginBottom: "40px",
              padding: "16px 20px",
              background: T.white,
              borderRadius: "10px",
              border: `1px solid ${T.border}`,
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: T.muted,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                Campaign Started
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "0.92rem",
                  color: T.charcoal,
                  fontWeight: 600,
                }}
              >
                {formatDate(campaign.startAt)}
              </span>
            </div>
            <div
              style={{
                width: "1px",
                background: T.border,
                alignSelf: "stretch",
                flexShrink: 0,
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: T.muted,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                Campaign Ends
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "0.92rem",
                  color: daysRemaining <= 7 ? T.errorText : T.charcoal,
                  fontWeight: 600,
                }}
              >
                {formatDate(campaign.endAt)}
              </span>
            </div>
          </div>

          {/* ── Contribution panel ────────────────────────────── */}
          <ContributionPanel
            campaign={campaign}
            onCampaignUpdated={(updated) => setCampaign(updated)}
          />

          {/* ── FinFranFran™ fractionalization panel ──────────── */}
          <FinFranFranPanel campaignId={campaign.id} />
        </div>
      </main>
    </>
  );
}

export default CampaignDetailPage;
