import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Scale, Shield, Users } from "lucide-react";
import { ProposalGrid } from "../components/ProposalGrid";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

export function DaoPage() {
  return (
    <main
      data-ocid="dao.page"
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "oklch(0.97 0.02 88)",
      }}
    >
      {/* Page header */}
      <header
        data-ocid="dao.section"
        style={{
          borderBottom: "1px solid oklch(0.88 0.03 88)",
          background: "#fff",
          padding: "40px 24px 48px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Back link */}
          <Link
            to="/"
            data-ocid="dao.link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: OOO_CHARCOAL,
              textDecoration: "none",
              opacity: 0.5,
              marginBottom: "32px",
              transition: "opacity 0.15s ease",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.5";
            }}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to Home
          </Link>

          {/* Header layout: icon + text */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >
            {/* Icon box */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "72px",
                height: "72px",
                borderRadius: "18px",
                background: "oklch(0.72 0.14 72 / 0.08)",
                color: OOO_GOLD,
                border: "1px solid oklch(0.72 0.14 72 / 0.18)",
                flexShrink: 0,
              }}
            >
              <Scale size={32} strokeWidth={1.5} />
            </div>

            {/* Title + tagline + description */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  color: OOO_GREEN,
                  lineHeight: 1.1,
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                OOO DAO
              </h1>

              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  color: OOO_GOLD,
                  margin: "0 0 12px 0",
                  lineHeight: 1.4,
                }}
              >
                Governance, Sovereignty &amp; Collective Voice
              </p>

              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "0.95rem",
                  color: OOO_CHARCOAL,
                  opacity: 0.65,
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: "620px",
                }}
              >
                Every OOOrgs member has a voice. Submit proposals, cast votes —
                For, Against, or Abstain — and shape the direction of our
                collective. Passed resolutions become binding commitments across
                all branches of OrganicOpulence.
              </p>
            </div>
          </div>

          {/* Key pillars row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "36px",
            }}
          >
            {[
              {
                icon: FileText,
                label: "Propose",
                desc: "Any member can raise a motion",
              },
              {
                icon: Users,
                label: "Vote",
                desc: "Collective decision-making",
              },
              {
                icon: Shield,
                label: "Enact",
                desc: "Passed resolutions are binding",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "oklch(0.97 0.02 88)",
                  border: "1px solid oklch(0.88 0.03 88)",
                  minWidth: "180px",
                  flex: "1 1 180px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9px",
                    background: "oklch(0.38 0.12 155 / 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: OOO_GREEN,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: OOO_CHARCOAL,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: "0.75rem",
                      color: OOO_CHARCOAL,
                      opacity: 0.5,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ProposalGrid section */}
      <section
        data-ocid="dao.panel"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        <ProposalGrid />
      </section>
    </main>
  );
}

export default DaoPage;
