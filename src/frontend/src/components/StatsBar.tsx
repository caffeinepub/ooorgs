import { Megaphone, DollarSign, Users, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

const OOO_GREEN = "oklch(0.38 0.12 155)";
const OOO_GOLD = "oklch(0.72 0.14 72)";
const OOO_CHARCOAL = "oklch(0.18 0.01 200)";
const OOO_STATS_BG = "oklch(0.93 0.02 88)";
const OOO_TILE_BG = "oklch(0.97 0.02 88)";

interface StatTile {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
}

const STATS: StatTile[] = [
  {
    icon: Megaphone,
    label: "Total Campaigns",
    value: "0",
    subtitle: "Worldwide",
  },
  {
    icon: DollarSign,
    label: "Total Raised",
    value: "$0",
    subtitle: "& growing",
  },
  {
    icon: Users,
    label: "Active Members",
    value: "0",
    subtitle: "& growing",
  },
  {
    icon: Building2,
    label: "Organizations",
    value: "0",
    subtitle: "Worldwide",
  },
];

export function StatsBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="stats"
      aria-label="Global statistics"
      style={{ background: OOO_STATS_BG }}
    >
      <div
        className="px-6 py-12 md:py-16"
        style={{ maxWidth: "1100px", margin: "0 auto" }}
      >
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2
            className="text-xl md:text-2xl font-bold mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: OOO_GREEN,
            }}
          >
            Our Global Reach
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              color: OOO_CHARCOAL,
              opacity: 0.6,
            }}
          >
            Numbers grow as our community comes together
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map(({ icon: Icon, label, value, subtitle }, tileIndex) => (
            <div
              key={label}
              className="flex flex-col items-center text-center p-6 md:p-8 rounded-lg"
              style={{
                background: OOO_TILE_BG,
                boxShadow: "0 2px 12px oklch(0.38 0.12 155 / 0.06)",
                border: "1px solid oklch(0.88 0.03 88)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.5s ease ${tileIndex * 100}ms, transform 0.5s ease ${tileIndex * 100}ms`,
              }}
            >
              {/* Icon */}
              <div
                className="mb-3 p-3 rounded-full"
                style={{
                  background: "oklch(0.72 0.14 72 / 0.08)",
                  color: OOO_GOLD,
                }}
              >
                <Icon size={22} strokeWidth={1.5} />
              </div>

              {/* Label */}
              <span
                className="text-xs font-medium tracking-wider uppercase mb-2 block"
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: OOO_CHARCOAL,
                  opacity: 0.55,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>

              {/* Value */}
              <span
                className="text-4xl md:text-5xl font-bold leading-none mb-1 block"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: OOO_GREEN,
                }}
              >
                {value}
              </span>

              {/* Subtitle */}
              <span
                className="text-xs italic block"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: OOO_GOLD,
                  opacity: 0.8,
                }}
              >
                {subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBar;
