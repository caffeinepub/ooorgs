import { useEffect, useRef, useState } from "react";
import OOOrgsLogo from "./OOOrgsLogo";
import { Button } from "@/components/ui/button";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CREAM = "oklch(0.97 0.02 88)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";
const OOO_GREEN_LIGHT = "oklch(0.55 0.10 155)";

function useStaggerReveal(count: number, delayMs = 60) {
  const [revealed, setRevealed] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 200 + i * delayMs)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [count, delayMs]);
  return revealed;
}

const HEADLINE = "OrganicOpulence".split("").map((char, i) => ({
  char,
  id: `h-${char.toLowerCase()}-pos${i}`,
}));

export function HeroSection() {
  const letterRevealed = useStaggerReveal(HEADLINE.length, 65);
  const [contentVisible, setContentVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToStats = () => {
    document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="OOOrgs hero"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.38 0.12 155 / 0.06) 0%, transparent 70%),
          ${OOO_CREAM}
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative geometric rings in background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, 120vw)",
          height: "min(900px, 120vw)",
          borderRadius: "50%",
          border: "1px solid oklch(0.38 0.12 155 / 0.04)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(680px, 90vw)",
          height: "min(680px, 90vw)",
          borderRadius: "50%",
          border: "1px solid oklch(0.72 0.14 72 / 0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(460px, 70vw)",
          height: "min(460px, 70vw)",
          borderRadius: "50%",
          border: "1px solid oklch(0.38 0.12 155 / 0.07)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center text-center px-6 py-20 md:py-28 lg:py-36"
        style={{ maxWidth: "860px", margin: "0 auto" }}
      >
        {/* Logo with fade-in */}
        <div
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <OOOrgsLogo size="lg" showWordmark={false} />
        </div>

        {/* Staggered headline */}
        <h1
          className="mt-6 mb-2 leading-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.4rem, 7vw, 5rem)",
            fontWeight: 700,
            color: OOO_GREEN,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          <span className="sr-only">OrganicOpulence</span>
          {HEADLINE.map(({ char, id }, charIndex) => (
            <span
              key={id}
              aria-hidden="true"
              style={{
                display: "inline-block",
                opacity: letterRevealed[charIndex] ? 1 : 0,
                transform: letterRevealed[charIndex] ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.45s ease, transform 0.45s ease",
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Wordmark badge */}
        <div
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
          }}
        >
          <span
            className="inline-block mb-6 tracking-[0.25em] uppercase text-xs font-semibold"
            style={{
              color: OOO_GOLD,
              fontFamily: "'Inter', system-ui, sans-serif",
              padding: "4px 16px",
              border: "1px solid oklch(0.72 0.14 72 / 0.35)",
              borderRadius: "999px",
              background: "oklch(0.72 0.14 72 / 0.05)",
            }}
          >
            OOOrgs
          </span>
        </div>

        {/* Subheadline */}
        <p
          className="text-base md:text-xl leading-relaxed max-w-xl mb-3"
          style={{
            color: OOO_CHARCOAL,
            fontFamily: "'Inter', system-ui, sans-serif",
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s",
          }}
        >
          Bringing together like-minded people around the causes they care most
          passionately about.
        </p>

        {/* Tagline */}
        <p
          className="text-sm md:text-base mb-10"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            color: OOO_GOLD,
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease 0.65s, transform 0.7s ease 0.65s",
          }}
        >
          "One &amp; All are welcome."
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease 0.8s, transform 0.7s ease 0.8s",
          }}
        >
          <button
            type="button"
            onClick={scrollToStats}
            className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
            style={{
              padding: "12px 32px",
              borderRadius: "var(--radius)",
              background: OOO_GREEN,
              color: OOO_CREAM,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.95rem",
              letterSpacing: "0.01em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px oklch(0.38 0.12 155 / 0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = OOO_GREEN_LIGHT;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px oklch(0.38 0.12 155 / 0.35)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = OOO_GREEN;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px oklch(0.38 0.12 155 / 0.25)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Explore Our Branches
          </button>

          <button
            type="button"
            onClick={scrollToStats}
            className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
            style={{
              padding: "12px 32px",
              borderRadius: "var(--radius)",
              background: "transparent",
              color: OOO_GREEN,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.95rem",
              letterSpacing: "0.01em",
              border: `2px solid ${OOO_GREEN}`,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.38 0.12 155 / 0.06)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Learn More
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-14 flex flex-col items-center gap-1"
          style={{
            opacity: contentVisible ? 0.5 : 0,
            transition: "opacity 0.7s ease 1.2s",
          }}
          aria-hidden="true"
        >
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: OOO_CHARCOAL, fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Discover
          </span>
          <div
            style={{
              width: "1px",
              height: "32px",
              background: `linear-gradient(to bottom, ${OOO_GREEN}, transparent)`,
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
