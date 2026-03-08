import { useState } from "react";
import CoopProjectCard, { type CoopProject } from "./CoopProjectCard";

// ─── Sample projects ──────────────────────────────────────────────────────────
const SAMPLE_PROJECTS: CoopProject[] = [
  {
    id: "1",
    title: "Green Valley Community Farm",
    description:
      "A 40-hectare cooperative farm supplying fresh organic produce to 3,200 households while training the next generation of sustainable farmers across the Lagos metropolitan area.",
    category: "Agriculture",
    status: "Active",
    goalAmount: 280_000,
    amountFunded: 194_600,
    memberCount: 312,
    lead: "Amara Okonkwo",
    location: "Lagos, Nigeria",
    tags: ["organic", "food-security", "training", "sustainable"],
  },
  {
    id: "2",
    title: "Cooperative Housing Initiative",
    description:
      "Affordable, community-owned housing for 180 families using a land-trust model that locks in affordability forever — not just for this generation but for all who come after.",
    category: "Housing",
    status: "Planning",
    goalAmount: 1_200_000,
    amountFunded: 360_000,
    memberCount: 87,
    lead: "Priya Nair",
    location: "Bangalore, India",
    tags: ["housing", "land-trust", "affordability", "urban"],
  },
  {
    id: "3",
    title: "Solar Energy Collective",
    description:
      "Installing a 2.4 MW community solar microgrid powering 1,500 homes and small businesses in three underserved barrios, with full fractional co-ownership for every household.",
    category: "Energy",
    status: "Active",
    goalAmount: 650_000,
    amountFunded: 507_000,
    memberCount: 1_502,
    lead: "Carlos Medina",
    location: "Bogotá, Colombia",
    tags: ["solar", "microgrid", "clean-energy", "ownership"],
  },
  {
    id: "4",
    title: "Digital Skills Co-op",
    description:
      "A worker-owned digital agency providing web development, data analysis, and UX design services — all profits shared equally among 60 member technologists across East Africa.",
    category: "Technology",
    status: "Completed",
    goalAmount: 95_000,
    amountFunded: 95_000,
    memberCount: 60,
    lead: "Wanjiku Kamau",
    location: "Nairobi, Kenya",
    tags: ["tech", "worker-owned", "digital-agency", "east-africa"],
  },
  {
    id: "5",
    title: "Community Health Cooperative",
    description:
      "Member-owned primary healthcare clinics delivering preventive care, maternal health, and mental-wellness services to 8,000+ residents who co-govern the clinics through annual assemblies.",
    category: "Health",
    status: "Active",
    goalAmount: 420_000,
    amountFunded: 210_000,
    memberCount: 445,
    lead: "Fatima Al-Hassan",
    location: "Kano, Nigeria",
    tags: ["health", "preventive-care", "member-owned", "governance"],
  },
  {
    id: "6",
    title: "Pan-African Credit Union",
    description:
      "A cross-border cooperative financial institution offering micro-loans, savings, and insurance products to informal traders and artisans underserved by traditional banking.",
    category: "Finance",
    status: "Planning",
    goalAmount: 750_000,
    amountFunded: 112_500,
    memberCount: 228,
    lead: "Kwame Asante",
    location: "Accra, Ghana",
    tags: ["finance", "micro-loans", "credit-union", "informal-economy"],
  },
];

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

type FilterStatus = "All" | CoopProject["status"];
const FILTERS: FilterStatus[] = ["All", "Active", "Planning", "Completed"];

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ projects }: { projects: CoopProject[] }) {
  const totalFunded = projects.reduce((s, p) => s + p.amountFunded, 0);
  const totalMembers = projects.reduce((s, p) => s + p.memberCount, 0);
  const activeCount = projects.filter((p) => p.status === "Active").length;

  const statStyle = {
    fontFamily: FONT_BODY,
    textAlign: "center" as const,
    flex: 1,
    padding: "12px 16px",
  };

  return (
    <div
      data-ocid="coopgrid.stats.panel"
      style={{
        display: "flex",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: "14px",
        marginBottom: "28px",
        overflow: "hidden",
        flexWrap: "wrap",
      }}
    >
      {[
        { label: "Total Projects", value: projects.length.toString() },
        { label: "Active Now", value: activeCount.toString() },
        { label: "Total Members", value: totalMembers.toLocaleString() },
        {
          label: "Total Funded",
          value:
            totalFunded >= 1_000_000
              ? `$${(totalFunded / 1_000_000).toFixed(1)}M`
              : `$${(totalFunded / 1_000).toFixed(0)}K`,
        },
      ].map((stat, i, arr) => (
        <div
          key={stat.label}
          style={{
            ...statStyle,
            borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: T.charcoal,
              marginBottom: "2px",
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: T.muted,
              fontWeight: 600,
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

// ─── CoopProjectGrid ──────────────────────────────────────────────────────────
export default function CoopProjectGrid() {
  const [filter, setFilter] = useState<FilterStatus>("All");

  const filtered =
    filter === "All"
      ? SAMPLE_PROJECTS
      : SAMPLE_PROJECTS.filter((p) => p.status === filter);

  const filterCount = (f: FilterStatus) =>
    f === "All"
      ? SAMPLE_PROJECTS.length
      : SAMPLE_PROJECTS.filter((p) => p.status === f).length;

  return (
    <section data-ocid="coopgrid.section" style={{ marginBottom: "48px" }}>
      {/* Section header */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "1.7rem",
            fontWeight: 700,
            color: T.charcoal,
            marginBottom: "6px",
          }}
        >
          Collective Projects
        </h2>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.88rem",
            color: T.muted,
            lineHeight: 1.6,
          }}
        >
          Real-world co-operative ventures where every member holds a meaningful
          share
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar projects={SAMPLE_PROJECTS} />

      {/* Filter tabs */}
      <div
        data-ocid="coopgrid.filter.tab"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.8rem",
                fontWeight: active ? 700 : 500,
                color: active ? T.white : T.muted,
                background: active ? T.green : T.white,
                border: `1.5px solid ${active ? T.green : T.border}`,
                borderRadius: "999px",
                padding: "6px 16px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {f}
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  background: active ? "oklch(1 0 0 / 0.25)" : T.cream,
                  borderRadius: "999px",
                  padding: "1px 7px",
                  color: active ? T.white : T.muted,
                }}
              >
                {filterCount(f)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div
          data-ocid="coopgrid.list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((project, i) => (
            <CoopProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      ) : (
        <div
          data-ocid="coopgrid.empty_state"
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: "16px",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🌱</div>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.9rem",
              color: T.muted,
            }}
          >
            No {filter.toLowerCase()} projects at this time.
          </p>
        </div>
      )}
    </section>
  );
}
