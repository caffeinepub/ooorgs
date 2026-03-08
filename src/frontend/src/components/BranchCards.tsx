import { Link } from "@tanstack/react-router";
import { Building2, Heart, Scale, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

interface Branch {
  icon: LucideIcon;
  name: string;
  tagline: string;
  to: string;
  accentColor: string;
  bgAccent: string;
}

const BRANCHES: Branch[] = [
  {
    icon: Heart,
    name: "OOO Charitable",
    tagline: "Crowdfunding with heart and purpose",
    to: "/charitable",
    accentColor: OOO_GREEN,
    bgAccent: "oklch(0.38 0.12 155 / 0.06)",
  },
  {
    icon: Building2,
    name: "OOO Corporations",
    tagline: "Accounting suite for modern management",
    to: "/corporations",
    accentColor: OOO_GOLD,
    bgAccent: "oklch(0.72 0.14 72 / 0.06)",
  },
  {
    icon: Users,
    name: "OOO Co-operatives",
    tagline: "Collaborative ownership for all",
    to: "/cooperatives",
    accentColor: OOO_GREEN,
    bgAccent: "oklch(0.38 0.12 155 / 0.06)",
  },
  {
    icon: Scale,
    name: "OOO DAO",
    tagline: "Governance and sovereignty services",
    to: "/dao",
    accentColor: OOO_GOLD,
    bgAccent: "oklch(0.72 0.14 72 / 0.06)",
  },
];

function BranchCard({ branch }: { branch: Branch }) {
  const [hovered, setHovered] = useState(false);
  const Icon = branch.icon;

  return (
    <Link
      to={branch.to}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: "12px",
        border: `1px solid ${hovered ? branch.accentColor : "oklch(0.88 0.03 88)"}`,
        background: hovered ? branch.bgAccent : "oklch(0.97 0.02 88)",
        padding: "28px 24px",
        transition: "all 0.2s ease",
        boxShadow: hovered
          ? `0 8px 32px ${branch.accentColor.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`
          : "0 2px 8px oklch(0.18 0.01 200 / 0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "10px",
          background: branch.bgAccent,
          color: branch.accentColor,
          marginBottom: "16px",
          border: `1px solid ${branch.accentColor.replace(")", " / 0.2)").replace("oklch(", "oklch(")}`,
          transition: "background 0.2s ease",
        }}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.1875rem",
          fontWeight: 700,
          color: OOO_CHARCOAL,
          marginBottom: "6px",
          lineHeight: 1.3,
        }}
      >
        {branch.name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.875rem",
          color: OOO_CHARCOAL,
          opacity: 0.65,
          lineHeight: 1.5,
          marginBottom: "16px",
        }}
      >
        {branch.tagline}
      </p>

      {/* Arrow CTA */}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: branch.accentColor,
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "gap 0.15s ease",
        }}
      >
        Explore →
      </span>
    </Link>
  );
}

export function BranchCards() {
  return (
    <section
      aria-label="Our Four Branches"
      style={{
        background: "oklch(0.97 0.02 88)",
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Section heading */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: OOO_GREEN,
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            Our Four Branches
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "1rem",
              color: OOO_CHARCOAL,
              opacity: 0.6,
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Each branch plays a distinct role in building a fairer, more
            connected world for all.
          </p>
        </div>

        {/* 2×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {BRANCHES.map((branch) => (
            <BranchCard key={branch.to} branch={branch} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BranchCards;
