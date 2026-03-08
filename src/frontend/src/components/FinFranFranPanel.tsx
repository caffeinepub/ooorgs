import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { FractionalizationSettings, UnitClaim } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
  greenDark: "oklch(0.28 0.10 155)",
  greenCell: "oklch(0.42 0.13 155)",
  gold: "oklch(0.72 0.14 72)",
  goldLight: "oklch(0.96 0.04 72)",
  goldBorder: "oklch(0.88 0.06 72)",
  goldMid: "oklch(0.82 0.10 72)",
  cream: "oklch(0.97 0.02 88)",
  border: "oklch(0.88 0.03 88)",
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  white: "oklch(1 0 0)",
  inputBg: "oklch(0.99 0.01 88)",
  inputBorder: "oklch(0.85 0.03 88)",
  inputFocus: "oklch(0.38 0.12 155)",
  errorText: "oklch(0.42 0.15 15)",
  errorBg: "oklch(0.96 0.03 15)",
  cellClaimed: "oklch(0.42 0.13 155)",
  cellAvailable: "oklch(0.93 0.02 88)",
  cellBorder: "oklch(0.84 0.04 88)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

// ─── Preset unit quantities ───────────────────────────────────────────────────
const UNIT_PRESETS = [1, 5, 10, 25, 50];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

function formatTimestamp(ts: bigint): string {
  try {
    return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ─── Unit grid ────────────────────────────────────────────────────────────────
// Renders up to GRID_SIZE cells representing percentage of total units.
// Claimed cells = forest green. Available = parchment outline.
const GRID_SIZE = 100;

interface UnitGridProps {
  totalUnits: bigint;
  unitsSold: bigint;
  pendingUnits?: number; // units user is about to claim (highlight these)
}

function UnitGrid({ totalUnits, unitsSold, pendingUnits = 0 }: UnitGridProps) {
  const total = Number(totalUnits);
  const sold = Number(unitsSold);
  const claimedPercent = total > 0 ? (sold / total) * GRID_SIZE : 0;
  const pendingPercent = total > 0 ? (pendingUnits / total) * GRID_SIZE : 0;

  const claimedCells = Math.round(claimedPercent);
  const pendingCells = Math.min(
    Math.round(pendingPercent),
    GRID_SIZE - claimedCells,
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, 1fr)",
          gap: "3px",
          padding: "16px",
          background: T.cream,
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
        }}
      >
        {Array.from({ length: GRID_SIZE }, (_, i) => {
          const isClaimed = i < claimedCells;
          const isPending = !isClaimed && i < claimedCells + pendingCells;
          const cellKey = `cell-${i}`;
          return (
            <div
              key={cellKey}
              style={{
                aspectRatio: "1",
                borderRadius: "3px",
                border: `1px solid ${
                  isClaimed
                    ? T.cellClaimed
                    : isPending
                      ? T.goldMid
                      : T.cellBorder
                }`,
                background: isClaimed
                  ? T.cellClaimed
                  : isPending
                    ? T.goldLight
                    : T.cellAvailable,
                transition: "background 0.2s, border-color 0.2s",
                animation: isClaimed
                  ? `fffCellPop 0.3s ease ${i * 8}ms backwards`
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          marginTop: "10px",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              background: T.cellClaimed,
              border: `1px solid ${T.cellClaimed}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.72rem",
              color: T.muted,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Claimed
          </span>
        </div>
        {pendingCells > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "3px",
                background: T.goldLight,
                border: `1px solid ${T.goldMid}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.72rem",
                color: T.muted,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Your Selection
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              background: T.cellAvailable,
              border: `1px solid ${T.cellBorder}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.72rem",
              color: T.muted,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Available
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
interface FFFStatsBarProps {
  settings: FractionalizationSettings;
}

function FFFStatsBar({ settings }: FFFStatsBarProps) {
  const available = Number(settings.totalUnits) - Number(settings.unitsSold);
  const stats = [
    {
      label: "Total Units",
      value: Number(settings.totalUnits).toLocaleString(),
      accent: false,
    },
    {
      label: "Unit Price",
      value: formatCurrency(settings.pricePerUnit),
      accent: false,
    },
    {
      label: "Claimed",
      value: Number(settings.unitsSold).toLocaleString(),
      accent: true,
    },
    {
      label: "Available",
      value: available.toLocaleString(),
      accent: false,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        border: `1px solid ${T.goldBorder}`,
        borderRadius: "12px",
        overflow: "hidden",
        background: T.goldLight,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: "14px 16px",
            textAlign: "center",
            borderRight: i < 3 ? `1px solid ${T.goldBorder}` : "none",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.25rem",
              fontWeight: 700,
              color: s.accent ? T.green : T.charcoal,
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.62rem",
              color: T.muted,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recent claims list ───────────────────────────────────────────────────────
interface RecentClaimsProps {
  claims: UnitClaim[];
}

function RecentClaims({ claims }: RecentClaimsProps) {
  if (claims.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: T.cream,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.85rem",
            color: T.muted,
            fontStyle: "italic",
          }}
        >
          No units claimed yet — be the first co-owner!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${T.border}`,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {claims.slice(0, 5).map((claim, i) => {
        const claimKey = `${claim.claimantName}-${String(claim.timestamp)}-${i}`;
        return (
          <div
            key={claimKey}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: i % 2 === 0 ? T.white : T.cream,
              borderBottom:
                i < Math.min(claims.length, 5) - 1
                  ? `1px solid ${T.border}`
                  : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: T.greenLight,
                  border: `2px solid ${T.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: T.green,
                  fontFamily: FONT_MONO,
                  flexShrink: 0,
                }}
              >
                {claim.claimantName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: T.charcoal,
                    marginBottom: "2px",
                  }}
                >
                  {claim.claimantName}
                </p>
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.72rem",
                    color: T.muted,
                  }}
                >
                  {formatTimestamp(claim.timestamp)}
                </p>
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "1rem",
                fontWeight: 700,
                color: T.green,
                textAlign: "right",
              }}
            >
              {Number(claim.unitsClaimed).toLocaleString()}
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: T.muted,
                  marginLeft: "4px",
                }}
              >
                units
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── No-settings state ────────────────────────────────────────────────────────
function NoFracSettingsCard() {
  return (
    <div
      style={{
        background: T.goldLight,
        border: `1px solid ${T.goldBorder}`,
        borderRadius: "14px",
        padding: "28px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🌱</div>
      <p
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "1.1rem",
          fontWeight: 700,
          color: T.charcoal,
          marginBottom: "8px",
        }}
      >
        Fractionalization Coming Soon
      </p>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: "0.85rem",
          color: T.muted,
          lineHeight: 1.7,
        }}
      >
        FinFranFran™ unit offerings for this campaign are being configured.
        Check back soon to claim your share!
      </p>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
interface FinFranFranPanelProps {
  campaignId: bigint;
}

export function FinFranFranPanel({ campaignId }: FinFranFranPanelProps) {
  const { actor, isFetching: actorLoading } = useActor();

  const [settings, setSettings] = useState<FractionalizationSettings | null>(
    null,
  );
  const [claims, setClaims] = useState<UnitClaim[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [selectedUnits, setSelectedUnits] = useState<number>(5);
  const [claimantName, setClaimantName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load fractionalization settings + claims
  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoadingData(true);
    try {
      const [settingsResult, claimsResult] = await Promise.all([
        actor.getFractionalizationSettings(campaignId),
        actor.getUnitClaims(campaignId),
      ]);
      setSettings(settingsResult);
      setClaims(claimsResult);
    } catch (err) {
      console.error("Failed to load FinFranFran data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [actor, campaignId]);

  useEffect(() => {
    if (!actor || actorLoading) return;
    loadData();
  }, [actor, actorLoading, loadData]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !settings) return;

    const available = Number(settings.totalUnits) - Number(settings.unitsSold);
    if (selectedUnits > available) {
      setFormError("Not enough units available.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const success = await actor.claimUnits(
        campaignId,
        claimantName.trim() || "Anonymous",
        BigInt(selectedUnits),
      );

      if (success) {
        toast.success(
          `${selectedUnits} unit${selectedUnits !== 1 ? "s" : ""} claimed successfully! 🎉`,
        );
        setClaimantName("");
        setSelectedUnits(5);
        // Refresh data to show updated counts
        await loadData();
      } else {
        setFormError("Not enough units available.");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (actorLoading || loadingData) {
    return (
      <section
        style={{
          background: T.white,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          padding: "36px 28px",
          marginTop: "36px",
          boxShadow: "0 4px 24px oklch(0.18 0.01 200 / 0.07)",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(90deg, oklch(0.92 0.02 88) 25%, oklch(0.96 0.01 88) 50%, oklch(0.92 0.02 88) 75%)",
            backgroundSize: "200% 100%",
            animation: "fffShimmer 1.5s infinite",
            height: "24px",
            width: "220px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        />
        <div
          style={{
            background:
              "linear-gradient(90deg, oklch(0.92 0.02 88) 25%, oklch(0.96 0.01 88) 50%, oklch(0.92 0.02 88) 75%)",
            backgroundSize: "200% 100%",
            animation: "fffShimmer 1.5s infinite",
            height: "160px",
            borderRadius: "12px",
          }}
        />
      </section>
    );
  }

  const totalCost = settings ? selectedUnits * settings.pricePerUnit : 0;
  const available = settings
    ? Number(settings.totalUnits) - Number(settings.unitsSold)
    : 0;
  const isUnitOverLimit = selectedUnits > available;

  return (
    <>
      <style>{`
        @keyframes fffShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fffFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fffCellPop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .fff-panel {
          animation: fffFadeIn 0.4s ease forwards;
        }
        .fff-unit-btn {
          transition: all 0.15s ease;
        }
        .fff-unit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px oklch(0.38 0.12 155 / 0.18);
        }
        .fff-claim-btn:hover:not(:disabled) {
          background: oklch(0.28 0.10 155) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px oklch(0.38 0.12 155 / 0.25);
        }
        .fff-claim-btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
      `}</style>

      <section
        className="fff-panel"
        style={{
          background: T.white,
          borderRadius: "18px",
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          marginTop: "36px",
          boxShadow:
            "0 4px 32px oklch(0.18 0.01 200 / 0.08), 0 1px 4px oklch(0.18 0.01 200 / 0.04)",
        }}
      >
        {/* ── Panel header ───────────────────────────────────────────────── */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.goldLight} 0%, oklch(0.94 0.03 100) 100%)`,
            borderBottom: `1px solid ${T.goldBorder}`,
            padding: "24px 28px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${T.green} 0%, oklch(0.52 0.14 155) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
                boxShadow: "0 4px 12px oklch(0.38 0.12 155 / 0.30)",
              }}
            >
              🌿
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    lineHeight: 1.1,
                  }}
                >
                  FinFranFran™
                </h3>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.green,
                    background: T.greenLight,
                    border: "1px solid oklch(0.72 0.08 155)",
                    borderRadius: "999px",
                    padding: "3px 10px",
                  }}
                >
                  Fractional Ownership
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.88rem",
                  color: T.muted,
                  lineHeight: 1.65,
                  marginTop: "6px",
                  maxWidth: "540px",
                }}
              >
                FinFranFran™ divides large projects into affordable
                participation units. Claim your share and become a fractional
                co-owner of this campaign's impact.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <div style={{ padding: "28px" }}>
          {!settings ? (
            <NoFracSettingsCard />
          ) : (
            <>
              {/* Stats bar */}
              <div style={{ marginBottom: "24px" }}>
                <FFFStatsBar settings={settings} />
              </div>

              {/* Unit grid */}
              <div style={{ marginBottom: "28px" }}>
                <h4
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "12px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Ownership Map
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: T.muted,
                      marginLeft: "10px",
                      letterSpacing: "0em",
                    }}
                  >
                    (each cell = 1% of total units)
                  </span>
                </h4>
                <UnitGrid
                  totalUnits={settings.totalUnits}
                  unitsSold={settings.unitsSold}
                  pendingUnits={selectedUnits}
                />
              </div>

              {/* Claim form */}
              <form onSubmit={handleClaim}>
                <div
                  style={{
                    background: T.cream,
                    border: `1px solid ${T.border}`,
                    borderRadius: "14px",
                    padding: "22px",
                    marginBottom: "24px",
                  }}
                >
                  {/* Unit selector */}
                  <div style={{ marginBottom: "18px" }}>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: T.muted,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      How Many Units?
                    </span>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {UNIT_PRESETS.map((qty) => {
                        const isSelected = selectedUnits === qty;
                        const isOver = qty > available;
                        return (
                          <button
                            key={qty}
                            type="button"
                            className="fff-unit-btn"
                            onClick={() => {
                              setSelectedUnits(qty);
                              setFormError(null);
                            }}
                            disabled={isOver}
                            style={{
                              padding: "9px 18px",
                              borderRadius: "9px",
                              border: `1.5px solid ${
                                isSelected
                                  ? T.green
                                  : isOver
                                    ? T.border
                                    : T.inputBorder
                              }`,
                              background: isSelected
                                ? T.greenLight
                                : isOver
                                  ? "oklch(0.93 0.01 88)"
                                  : T.white,
                              color: isSelected
                                ? T.green
                                : isOver
                                  ? T.border
                                  : T.charcoal,
                              fontFamily: FONT_BODY,
                              fontSize: "0.9rem",
                              fontWeight: isSelected ? 700 : 500,
                              cursor: isOver ? "not-allowed" : "pointer",
                              opacity: isOver ? 0.5 : 1,
                            }}
                          >
                            {qty}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost calculation */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: T.goldLight,
                      border: `1px solid ${T.goldBorder}`,
                      borderRadius: "10px",
                      marginBottom: "18px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: "0.82rem",
                        color: T.muted,
                      }}
                    >
                      {selectedUnits.toLocaleString()} units ×{" "}
                      {formatCurrency(settings.pricePerUnit)}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: T.charcoal,
                      }}
                    >
                      {formatCurrency(totalCost)}
                    </span>
                  </div>

                  {/* Name input */}
                  <div style={{ marginBottom: "18px" }}>
                    <label
                      htmlFor="fff-claimant-name"
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: T.muted,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "7px",
                      }}
                    >
                      Your Name (Optional)
                    </label>
                    <input
                      id="fff-claimant-name"
                      type="text"
                      placeholder="Anonymous co-owner"
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "9px",
                        border: `1.5px solid ${T.inputBorder}`,
                        background: T.white,
                        fontFamily: FONT_BODY,
                        fontSize: "0.9rem",
                        color: T.charcoal,
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = T.inputFocus;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.inputBorder;
                      }}
                    />
                  </div>

                  {/* Claim button */}
                  <button
                    type="submit"
                    className="fff-claim-btn"
                    disabled={
                      isSubmitting || isUnitOverLimit || available === 0
                    }
                    style={{
                      width: "100%",
                      padding: "13px 24px",
                      borderRadius: "10px",
                      border: "none",
                      background: T.green,
                      color: T.white,
                      fontFamily: FONT_BODY,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                      transition:
                        "background 0.15s, transform 0.15s, box-shadow 0.15s",
                    }}
                  >
                    {isSubmitting ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid oklch(1 0 0 / 0.3)",
                            borderTopColor: T.white,
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Claiming…
                      </span>
                    ) : available === 0 ? (
                      "All Units Claimed"
                    ) : (
                      `🌿 Claim ${selectedUnits} Unit${selectedUnits !== 1 ? "s" : ""}`
                    )}
                  </button>

                  {/* Inline error */}
                  {formError && (
                    <p
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: "0.83rem",
                        color: T.errorText,
                        background: T.errorBg,
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginTop: "12px",
                        textAlign: "center",
                      }}
                    >
                      {formError}
                    </p>
                  )}
                </div>
              </form>

              {/* Recent claims */}
              <div>
                <h4
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "12px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Recent Co-Owners
                </h4>
                <RecentClaims claims={claims} />
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default FinFranFranPanel;
