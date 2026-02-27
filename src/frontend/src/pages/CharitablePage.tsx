import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useActor } from "../hooks/useActor";
import type { Campaign } from "../backend.d.ts";

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

// ─── Seed data ────────────────────────────────────────────────────────────────
// startAt and endAt are nanosecond bigint timestamps for the backend
type CreateCampaignArgs = [
  string, string, string, string, number,
  string, string, string, bigint, bigint,
  string[]
];

function dateToNs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

const SEED_CAMPAIGNS: CreateCampaignArgs[] = [
  [
    "Clean Water for Rural Communities",
    "Bringing safe drinking water to 12 underserved villages in East Africa through bore-hole wells and filtration units.",
    "Millions of people in rural East Africa walk hours each day to fetch water from contaminated sources. This campaign funds 12 bore-hole wells with hand pumps, water filtration units, and community maintenance training. Each well serves approximately 500 people.",
    "Environment",
    500000,
    "AquaLife Foundation",
    "AquaLife Foundation has delivered clean water solutions to over 200 communities across Sub-Saharan Africa since 2008.",
    "",
    dateToNs("2026-01-01"),
    dateToNs("2026-12-31"),
    ["water", "africa", "infrastructure", "health"],
  ],
  [
    "Children's Literacy Program",
    "Books, tablets, and trained teachers for 5,000 children in underserved schools across 4 regions.",
    "Reading proficiency by age 8 is the single greatest predictor of lifelong success. This campaign equips 50 schools with curated book libraries, pre-loaded learning tablets, and professional development for 200 teachers.",
    "Education",
    75000,
    "ReadForward Alliance",
    "ReadForward Alliance partners with governments and NGOs to improve literacy outcomes for over 100,000 children annually.",
    "",
    dateToNs("2026-02-01"),
    dateToNs("2026-08-31"),
    ["education", "literacy", "children", "books"],
  ],
  [
    "Mobile Health Clinic Network",
    "Solar-powered mobile clinics delivering primary care to remote and underserved regions.",
    "This campaign funds 3 fully equipped solar-powered mobile clinics staffed by volunteer doctors and nurses, each covering a 200-km radius with preventive care, vaccinations, and maternal health services.",
    "Health",
    180000,
    "MediReach Global",
    "MediReach Global coordinates volunteer medical professionals to deliver care in 22 countries.",
    "",
    dateToNs("2026-03-01"),
    dateToNs("2026-11-30"),
    ["health", "medical", "mobile", "volunteers"],
  ],
  [
    "Urban Community Garden Collective",
    "Transforming 8 vacant city lots into thriving community food gardens for urban neighbourhoods.",
    "This campaign converts 8 abandoned lots across 4 city neighbourhoods into productive community gardens with raised beds, composting systems, rainwater collection, and tool libraries.",
    "Community",
    28000,
    "GreenRoots Collective",
    "GreenRoots Collective is a grassroots urban agriculture network active in 14 cities with over 3,000 active gardener members.",
    "",
    dateToNs("2026-01-15"),
    dateToNs("2026-06-30"),
    ["urban", "food", "gardens", "sustainability"],
  ],
  [
    "Traditional Arts Preservation Fund",
    "Documenting and teaching endangered traditional crafts before irreplaceable knowledge is lost.",
    "This campaign funds a 3-year documentation project with video archiving, master-apprentice stipends for 40 young learners, and a travelling cultural exhibition across 12 venues.",
    "Arts",
    45000,
    "Heritage Alive Trust",
    "Heritage Alive Trust has preserved over 180 traditional art forms across 30 countries through documentation and public exhibition.",
    "",
    dateToNs("2026-04-01"),
    dateToNs("2027-03-31"),
    ["arts", "culture", "heritage", "preservation"],
  ],
  [
    "Emergency Disaster Relief Response",
    "A standing rapid-deployment fund for immediate food, shelter, and medical aid after disasters.",
    "When disaster strikes, the first 72 hours are critical. This standing emergency fund enables immediate deployment of relief teams with food packages, temporary shelter kits, water purification tablets, and first-aid supplies within hours of a verified emergency.",
    "Emergency",
    250000,
    "RapidAid Network",
    "RapidAid Network has responded to 47 disasters in 31 countries, delivering aid to over 500,000 affected people since 2012.",
    "",
    dateToNs("2026-01-01"),
    dateToNs("2026-12-31"),
    ["emergency", "relief", "disaster", "shelter"],
  ],
];

// ─── Filter categories ────────────────────────────────────────────────────────
const FILTERS = ["All", "Environment", "Education", "Health", "Community", "Arts", "Emergency"];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function CampaignSkeleton() {
  const shimmerStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, oklch(0.90 0.02 88) 25%, oklch(0.95 0.01 88) 50%, oklch(0.90 0.02 88) 75%)",
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
      <div style={{ padding: "24px" }}>
        <div style={{ width: "90px", height: "22px", borderRadius: "999px", marginBottom: "16px", ...shimmerStyle }} />
        <div style={{ width: "80%", height: "22px", borderRadius: "6px", marginBottom: "8px", ...shimmerStyle }} />
        <div style={{ width: "55%", height: "22px", borderRadius: "6px", marginBottom: "16px", ...shimmerStyle }} />
        <div style={{ width: "100%", height: "14px", borderRadius: "4px", marginBottom: "8px", ...shimmerStyle }} />
        <div style={{ width: "85%", height: "14px", borderRadius: "4px", marginBottom: "20px", ...shimmerStyle }} />
        <div style={{ height: "8px", borderRadius: "999px", marginBottom: "10px", ...shimmerStyle }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "45%", height: "12px", borderRadius: "4px", ...shimmerStyle }} />
          <div style={{ width: "25%", height: "12px", borderRadius: "4px", ...shimmerStyle }} />
        </div>
      </div>
    </div>
  );
}

// ─── Campaign card ────────────────────────────────────────────────────────────
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const colors = getCategoryColors(campaign.category);
  const pct = campaign.goalAmount > 0
    ? Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100)
    : 0;

  const formatGBP = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  const formatDate = (ts: bigint) => {
    try {
      return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() =>
        navigate({
          to: "/charitable/$campaignId",
          params: { campaignId: String(campaign.id) },
        })
      }
      style={{
        background: T.white,
        borderRadius: "16px",
        border: `1px solid ${hovered ? "oklch(0.38 0.12 155 / 0.3)" : T.border}`,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 32px oklch(0.38 0.12 155 / 0.12)"
          : "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        height: "100%",
        width: "100%",
        textAlign: "left",
        padding: 0,
        fontFamily: "inherit",
      }}
    >
      {/* Category accent bar */}
      <div style={{ height: "4px", background: colors.bar, flexShrink: 0 }} />

      <div style={{ padding: "22px 24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Category badge */}
        <div style={{ marginBottom: "14px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "'Inter', system-ui, sans-serif",
              background: colors.bg,
              color: colors.text,
            }}
          >
            {campaign.category}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: T.charcoal,
            lineHeight: 1.35,
            marginBottom: "10px",
          }}
        >
          {campaign.title}
        </h3>

        {/* Short description — 2 lines max */}
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.875rem",
            color: T.muted,
            lineHeight: 1.6,
            marginBottom: "20px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {campaign.shortDescription}
        </p>

        {/* Progress bar */}
        <div
          style={{
            height: "8px",
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
              transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              minWidth: pct > 0 ? "8px" : "0",
            }}
          />
        </div>

        {/* Progress stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.78rem",
              color: T.charcoal,
              fontWeight: 600,
            }}
          >
            {formatGBP(campaign.amountRaised)}{" "}
            <span style={{ fontWeight: 400, color: T.muted }}>
              raised of {formatGBP(campaign.goalAmount)}
            </span>
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: colors.text,
            }}
          >
            {Math.round(pct)}% funded
          </span>
        </div>

        {/* Contributors */}
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.75rem",
            color: T.muted,
            marginBottom: "14px",
          }}
        >
          {Number(campaign.contributors).toLocaleString()} contributor{Number(campaign.contributors) !== 1 ? "s" : ""}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: T.border, marginBottom: "12px" }} />

        {/* Footer: organizer + end date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "12px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.78rem",
              color: T.gold,
            }}
          >
            By {campaign.organizerName}
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.72rem",
              color: T.muted,
              flexShrink: 0,
            }}
          >
            Ends {formatDate(campaign.endAt)}
          </span>
        </div>

        {/* Tags */}
        {campaign.tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {campaign.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.68rem",
                  color: T.muted,
                  background: "oklch(0.93 0.01 200)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Stats summary bar ────────────────────────────────────────────────────────
function StatsSummaryBar({ campaigns }: { campaigns: Campaign[] }) {
  const totalRaised = campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
  const totalContributors = campaigns.reduce((sum, c) => sum + Number(c.contributors), 0);

  const formatCompact = (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);

  const stats = [
    { label: "Active Campaigns", value: campaigns.filter((c) => c.active).length.toString() },
    { label: "Total Raised", value: formatCompact(totalRaised) },
    { label: "Total Contributors", value: totalContributors.toLocaleString() },
    { label: "Categories", value: new Set(campaigns.map((c) => c.category)).size.toString() },
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
        marginBottom: "40px",
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
export function CharitablePage() {
  const { actor, isFetching: actorLoading } = useActor();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const seededRef = useRef(false);
  const loadedRef = useRef(false);

  const loadCampaigns = useCallback(async () => {
    if (!actor || actorLoading || loadedRef.current) return;
    loadedRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const existing = await actor.allCampaigns();

      if (existing.length === 0 && !seededRef.current) {
        seededRef.current = true;
        const seeded: Campaign[] = [];
        for (const args of SEED_CAMPAIGNS) {
          const c = await actor.createCampaign(...args);
          seeded.push(c);
        }
        setCampaigns(seeded);
      } else {
        setCampaigns(existing);
      }
    } catch (err) {
      setError("Unable to load campaigns. Please try again shortly.");
      console.error("Campaign load error:", err);
      loadedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [actor, actorLoading]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns =
    activeFilter === "All"
      ? campaigns
      : campaigns.filter((c) => c.category === activeFilter);

  const isLoading = loading || actorLoading;

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
        .ooo-card-enter {
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
            background: "linear-gradient(160deg, oklch(0.94 0.04 155) 0%, oklch(0.97 0.02 88) 60%)",
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
              OOO Charitable
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
              Crowdfunding with heart and purpose
            </p>

            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.95rem",
                color: T.muted,
                lineHeight: 1.7,
                maxWidth: "540px",
                margin: "0 auto",
              }}
            >
              Every campaign here is powered by collective generosity — your contribution of cash, kind, or time helps bring these vital projects to life.
            </p>
          </div>
        </header>

        {/* ── Content container ────────────────────────────────── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 0" }}>

          {/* Stats bar */}
          {!isLoading && !error && campaigns.length > 0 && (
            <StatsSummaryBar campaigns={campaigns} />
          )}

          {/* ── Filter bar ─────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "36px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: T.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginRight: "4px",
                flexShrink: 0,
              }}
            >
              Filter:
            </span>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f;
              const catColors = f !== "All" ? getCategoryColors(f) : null;
              return (
                <button
                  type="button"
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 16px",
                    borderRadius: "999px",
                    border: `1.5px solid ${isActive ? (catColors?.bar ?? T.green) : T.border}`,
                    background: isActive ? (catColors?.bg ?? T.greenLight) : T.white,
                    color: isActive ? (catColors?.text ?? T.green) : T.muted,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget;
                      el.style.borderColor = catColors?.bar ?? T.green;
                      el.style.color = catColors?.text ?? T.green;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget;
                      el.style.borderColor = T.border;
                      el.style.color = T.muted;
                    }
                  }}
                >
                  {f !== "All" && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: catColors?.bar ?? T.green,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {f}
                </button>
              );
            })}

            {!isLoading && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

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
                  loadCampaigns();
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

          {/* ── Campaign grid ─────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => i).map((i) => (
                <CampaignSkeleton key={`skeleton-${i}`} />
              ))
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign, index) => (
                <div
                  key={Number(campaign.id)}
                  className="ooo-card-enter"
                  style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
                >
                  <CampaignCard campaign={campaign} />
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
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "oklch(0.92 0.04 155)",
                    marginBottom: "20px",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>🌱</span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.3rem",
                    color: T.charcoal,
                    marginBottom: "8px",
                  }}
                >
                  No campaigns in this category yet
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: "0.875rem",
                    color: T.muted,
                    marginBottom: "20px",
                  }}
                >
                  Be the first to launch a {activeFilter.toLowerCase()} campaign with OOO Charitable.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter("All")}
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
                  }}
                >
                  View all campaigns
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default CharitablePage;
