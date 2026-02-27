import { Link } from "@tanstack/react-router";
import { Users, ArrowLeft } from "lucide-react";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

export function CooperativesPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "oklch(0.97 0.02 88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Back link */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: OOO_CHARCOAL,
            textDecoration: "none",
            opacity: 0.6,
            marginBottom: "48px",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6";
          }}
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>

        {/* Icon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "oklch(0.38 0.12 155 / 0.08)",
            color: OOO_GREEN,
            marginBottom: "28px",
            border: "1px solid oklch(0.38 0.12 155 / 0.15)",
          }}
        >
          <Users size={36} strokeWidth={1.5} />
        </div>

        {/* Badge */}
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "5px 16px",
              borderRadius: "999px",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "oklch(0.72 0.14 72 / 0.1)",
              color: OOO_GOLD,
              border: "1px solid oklch(0.72 0.14 72 / 0.2)",
            }}
          >
            Coming in Phase 6
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            color: OOO_GREEN,
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          OOO Co-operatives
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "1.125rem",
            color: OOO_GOLD,
            marginBottom: "20px",
          }}
        >
          Collaborative ownership for all
        </p>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "1rem",
            color: OOO_CHARCOAL,
            opacity: 0.7,
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          Phase 6 will bring collective project cards, the FinFranFran fractional
          ownership model, and a member directory — new ways of working together
          that spread ownership and opportunity to everyone.
        </p>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, transparent, oklch(0.88 0.03 88), transparent)",
            marginBottom: "32px",
          }}
        />

        {/* What's coming */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {[
            "Collective project cards with collaborative goals",
            "FinFranFran fractional ownership display and unit acquisition",
            "Member directory and profile management",
            "Collaborative actions board for community initiatives",
          ].map((item) => (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.9rem",
                color: OOO_CHARCOAL,
                opacity: 0.75,
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: OOO_GREEN,
                  marginTop: "7px",
                  flexShrink: 0,
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default CooperativesPage;
