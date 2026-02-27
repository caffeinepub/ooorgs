import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import OOOrgsLogo from "./OOOrgsLogo";
import { Menu, X } from "lucide-react";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_CREAM = "oklch(0.97 0.02 88)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";

const NAV_LINKS = [
  { label: "Charitable", to: "/charitable" },
  { label: "Corporations", to: "/corporations" },
  { label: "Co-operatives", to: "/cooperatives" },
  { label: "DAO", to: "/dao" },
] as const;

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: OOO_CREAM,
        borderBottom: `1px solid oklch(0.88 0.03 88)`,
        boxShadow: scrolled ? "0 2px 16px oklch(0.38 0.12 155 / 0.08)" : "none",
        transition: "box-shadow 0.25s ease",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ textDecoration: "none", flexShrink: 0 }}
          aria-label="OOOrgs home"
        >
          <OOOrgsLogo size="sm" showWordmark={true} />
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? OOO_GREEN : OOO_CHARCOAL,
                  textDecoration: "none",
                  background: isActive ? "oklch(0.38 0.12 155 / 0.07)" : "transparent",
                  transition: "color 0.15s ease, background 0.15s ease",
                  letterSpacing: "0.01em",
                  borderBottom: isActive ? `2px solid ${OOO_GREEN}` : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = OOO_GREEN;
                    (e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.38 0.12 155 / 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = OOO_CHARCOAL;
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Join Us CTA + Hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Join Us — desktop only */}
          <Link
            to="/charitable"
            className="hidden md:inline-flex"
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: OOO_GREEN,
              textDecoration: "none",
              border: `2px solid ${OOO_GREEN}`,
              background: "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = OOO_GREEN;
              (e.currentTarget as HTMLAnchorElement).style.color = OOO_CREAM;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = OOO_GREEN;
            }}
          >
            Join Us
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="flex md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              padding: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: OOO_CHARCOAL,
              borderRadius: "6px",
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          style={{
            background: OOO_CREAM,
            borderTop: "1px solid oklch(0.88 0.03 88)",
            padding: "12px 24px 16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV_LINKS.map(({ label, to }) => {
              const isActive = currentPath === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "6px",
                    fontSize: "0.9375rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? OOO_GREEN : OOO_CHARCOAL,
                    textDecoration: "none",
                    background: isActive ? "oklch(0.38 0.12 155 / 0.07)" : "transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid oklch(0.88 0.03 88)" }}>
              <Link
                to="/charitable"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: OOO_CREAM,
                  textDecoration: "none",
                  background: OOO_GREEN,
                }}
              >
                Join Us
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default NavBar;
