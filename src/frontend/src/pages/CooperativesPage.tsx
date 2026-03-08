import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Campaign,
  FractionalizationSettings,
  UnitClaim,
} from "../backend.d.ts";
import { CollabActionsBoard } from "../components/CollabActionsBoard";
import CoopProjectGrid from "../components/CoopProjectGrid";
import {
  MemberDirectoryCard,
  SAMPLE_MEMBERS,
} from "../components/MemberDirectoryCard";
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
  errorText: "oklch(0.42 0.15 15)",
  errorBg: "oklch(0.96 0.03 15)",
  successText: "oklch(0.35 0.14 155)",
  successBg: "oklch(0.93 0.05 155)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

const UNIT_PRESETS = [1, 5, 10, 25, 50];
const GRID_SIZE = 100;

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

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, oklch(0.90 0.02 88) 25%, oklch(0.95 0.01 88) 50%, oklch(0.90 0.02 88) 75%)",
  backgroundSize: "200% 100%",
  animation: "coopShimmer 1.5s infinite",
  borderRadius: "8px",
};

function PageSkeleton() {
  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 0" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: "28px",
        }}
      >
        {(["skeleton-0", "skeleton-1", "skeleton-2"] as const).map((key) => (
          <div
            key={key}
            style={{
              background: T.white,
              borderRadius: "18px",
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.06)",
            }}
          >
            <div style={{ height: "5px", ...shimmerStyle, borderRadius: 0 }} />
            <div style={{ padding: "28px" }}>
              <div
                style={{
                  width: "100px",
                  height: "22px",
                  borderRadius: "999px",
                  marginBottom: "16px",
                  ...shimmerStyle,
                }}
              />
              <div
                style={{
                  width: "75%",
                  height: "26px",
                  marginBottom: "8px",
                  ...shimmerStyle,
                }}
              />
              <div
                style={{
                  width: "60%",
                  height: "18px",
                  marginBottom: "24px",
                  ...shimmerStyle,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1px",
                  marginBottom: "24px",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {(["s0", "s1", "s2", "s3"] as const).map((k) => (
                  <div
                    key={k}
                    style={{ height: "64px", ...shimmerStyle, borderRadius: 0 }}
                  />
                ))}
              </div>
              <div style={{ height: "160px", ...shimmerStyle }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Unit ownership grid ──────────────────────────────────────────────────────
interface UnitGridProps {
  totalUnits: bigint;
  unitsSold: bigint;
  pendingUnits?: number;
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
          padding: "14px",
          background: T.cream,
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
        }}
      >
        {Array.from({ length: GRID_SIZE }, (_, i) => `grid-cell-${i}`).map(
          (cellKey, i) => {
            const isClaimed = i < claimedCells;
            const isPending = !isClaimed && i < claimedCells + pendingCells;
            return (
              <div
                key={cellKey}
                style={{
                  aspectRatio: "1",
                  borderRadius: "2px",
                  border: `1px solid ${
                    isClaimed ? T.greenCell : isPending ? T.goldMid : T.border
                  }`,
                  background: isClaimed
                    ? T.greenCell
                    : isPending
                      ? T.goldLight
                      : "oklch(0.94 0.01 88)",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              />
            );
          },
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          marginTop: "8px",
          justifyContent: "flex-end",
        }}
      >
        {[
          { color: T.greenCell, border: T.greenCell, label: "Claimed" },
          ...(pendingCells > 0
            ? [
                {
                  color: T.goldLight,
                  border: T.goldMid,
                  label: "Your Selection",
                },
              ]
            : []),
          {
            color: "oklch(0.94 0.01 88)",
            border: T.border,
            label: "Available",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: item.color,
                border: `1px solid ${item.border}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.68rem",
                color: T.muted,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent claims list ───────────────────────────────────────────────────────
function RecentClaims({ claims }: { claims: UnitClaim[] }) {
  if (claims.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          background: T.cream,
          borderRadius: "10px",
          border: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.82rem",
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
      {claims.slice(0, 5).map((claim, i) => (
        <div
          key={`${claim.claimantName}-${String(claim.timestamp)}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
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
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: T.greenLight,
                border: `2px solid ${T.green}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
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
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: T.charcoal,
                  marginBottom: "1px",
                }}
              >
                {claim.claimantName}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.7rem",
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
              fontSize: "0.95rem",
              fontWeight: 700,
              color: T.green,
              textAlign: "right",
            }}
          >
            {Number(claim.unitsClaimed).toLocaleString()}
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.67rem",
                fontWeight: 500,
                color: T.muted,
                marginLeft: "4px",
              }}
            >
              units
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activate FinFranFran panel ───────────────────────────────────────────────
interface ActivatePanelProps {
  campaign: Campaign;
  onActivated: () => void;
}

function ActivateFinFranFranPanel({
  campaign,
  onActivated,
}: ActivatePanelProps) {
  const { actor } = useActor();
  const [totalUnits, setTotalUnits] = useState("1000");
  const [pricePerUnit, setPricePerUnit] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalValue = Number(totalUnits || 0) * Number(pricePerUnit || 0);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    const units = Number.parseInt(totalUnits, 10);
    const price = Number.parseFloat(pricePerUnit);
    if (!units || units < 1 || !price || price <= 0) {
      setError("Please enter valid units (≥1) and price (>0).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const success = await actor.setFractionalizationSettings(
        campaign.id,
        BigInt(units),
        price,
      );
      if (success) {
        toast.success(`FinFranFran™ activated for "${campaign.title}"! 🌿`);
        onActivated();
      } else {
        setError("Activation failed. Please try again.");
      }
    } catch (err) {
      console.error("Activate error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: T.white,
        borderRadius: "18px",
        border: `1.5px dashed ${T.goldBorder}`,
        overflow: "hidden",
        boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.05)",
      }}
    >
      {/* Top accent */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${T.gold}, oklch(0.82 0.12 88))`,
        }}
      />

      <div style={{ padding: "28px" }}>
        {/* Campaign info */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.gold,
                background: T.goldLight,
                border: `1px solid ${T.goldBorder}`,
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {campaign.category}
            </span>
          </div>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: T.charcoal,
              marginBottom: "6px",
              lineHeight: 1.3,
            }}
          >
            {campaign.title}
          </h3>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.85rem",
              color: T.muted,
              lineHeight: 1.65,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {campaign.shortDescription}
          </p>
        </div>

        {/* Activate form */}
        <div
          style={{
            background: T.goldLight,
            border: `1px solid ${T.goldBorder}`,
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>🌿</span>
            <div>
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: T.charcoal,
                  marginBottom: "2px",
                }}
              >
                Activate FinFranFran™
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                Enable fractional co-ownership for this campaign
              </p>
            </div>
          </div>

          <form onSubmit={handleActivate}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  htmlFor={`units-${String(campaign.id)}`}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: T.muted,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Total Units
                </label>
                <input
                  id={`units-${String(campaign.id)}`}
                  type="number"
                  min="1"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${T.goldBorder}`,
                    background: T.white,
                    fontFamily: FONT_BODY,
                    fontSize: "0.9rem",
                    color: T.charcoal,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = T.gold;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = T.goldBorder;
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor={`price-${String(campaign.id)}`}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: T.muted,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Price Per Unit ($)
                </label>
                <input
                  id={`price-${String(campaign.id)}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${T.goldBorder}`,
                    background: T.white,
                    fontFamily: FONT_BODY,
                    fontSize: "0.9rem",
                    color: T.charcoal,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = T.gold;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = T.goldBorder;
                  }}
                />
              </div>
            </div>

            {/* Preview total value */}
            {totalValue > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: T.white,
                  border: `1px solid ${T.goldBorder}`,
                  borderRadius: "9px",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.78rem",
                    color: T.muted,
                  }}
                >
                  Total campaign value
                </span>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: T.charcoal,
                  }}
                >
                  {formatCurrency(totalValue)}
                </span>
              </div>
            )}

            {error && (
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.8rem",
                  color: T.errorText,
                  background: T.errorBg,
                  borderRadius: "8px",
                  padding: "9px 13px",
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "11px 20px",
                borderRadius: "9px",
                border: "none",
                background: submitting ? T.goldMid : T.gold,
                color: T.charcoal,
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid oklch(0.18 0.01 200 / 0.2)",
                      borderTopColor: T.charcoal,
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "coopSpin 0.7s linear infinite",
                    }}
                  />
                  Activating…
                </>
              ) : (
                "🌿 Activate FinFranFran™"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Active collective project card ──────────────────────────────────────────
interface CollectiveProjectCardProps {
  campaign: Campaign;
  settings: FractionalizationSettings;
  onRefresh: () => void;
}

function CollectiveProjectCard({
  campaign,
  settings,
  onRefresh,
}: CollectiveProjectCardProps) {
  const { actor } = useActor();
  const [claims, setClaims] = useState<UnitClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [selectedUnits, setSelectedUnits] = useState(5);
  const [claimantName, setClaimantName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const totalUnitsNum = Number(settings.totalUnits);
  const soldNum = Number(settings.unitsSold);
  const available = totalUnitsNum - soldNum;
  const pct = totalUnitsNum > 0 ? (soldNum / totalUnitsNum) * 100 : 0;
  const totalCost = selectedUnits * settings.pricePerUnit;
  const isOverLimit = selectedUnits > available;

  const loadClaims = useCallback(async () => {
    if (!actor) return;
    setLoadingClaims(true);
    try {
      const result = await actor.getUnitClaims(campaign.id);
      setClaims(result);
    } catch (err) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoadingClaims(false);
    }
  }, [actor, campaign.id]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (isOverLimit) {
      setFormError("Not enough units available.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const success = await actor.claimUnits(
        campaign.id,
        claimantName.trim() || "Anonymous",
        BigInt(selectedUnits),
      );
      if (success) {
        toast.success(
          `${selectedUnits} unit${selectedUnits !== 1 ? "s" : ""} claimed! 🎉`,
        );
        setClaimantName("");
        setSelectedUnits(5);
        await Promise.all([loadClaims(), onRefresh()]);
      } else {
        setFormError("Not enough units available.");
      }
    } catch (err) {
      console.error("Claim error:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: T.white,
        borderRadius: "18px",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: "0 4px 24px oklch(0.18 0.01 200 / 0.07)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: "5px",
          background: `linear-gradient(90deg, ${T.green}, ${T.greenCell})`,
        }}
      />

      <div
        style={{
          padding: "28px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Campaign header */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
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
              {campaign.category}
            </span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.7rem",
                fontWeight: 600,
                color: available === 0 ? T.errorText : T.successText,
                background: available === 0 ? T.errorBg : T.successBg,
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {available === 0
                ? "Fully Claimed"
                : `${available.toLocaleString()} units left`}
            </span>
          </div>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: T.charcoal,
              lineHeight: 1.3,
              marginBottom: "6px",
            }}
          >
            {campaign.title}
          </h3>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.85rem",
              color: T.muted,
              lineHeight: 1.65,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {campaign.shortDescription}
          </p>
        </div>

        {/* Stats row */}
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
          {[
            {
              label: "Total Units",
              value: totalUnitsNum.toLocaleString(),
              accent: false,
            },
            {
              label: "Unit Price",
              value: formatCurrency(settings.pricePerUnit),
              accent: false,
            },
            { label: "Claimed", value: soldNum.toLocaleString(), accent: true },
            {
              label: "Available",
              value: available.toLocaleString(),
              accent: false,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                borderRight: i < 3 ? `1px solid ${T.goldBorder}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: stat.accent ? T.green : T.charcoal,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.58rem",
                  color: T.muted,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div
            style={{
              height: "8px",
              borderRadius: "999px",
              background: "oklch(0.92 0.02 88)",
              overflow: "hidden",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: "999px",
                background: `linear-gradient(90deg, ${T.green}, ${T.greenCell})`,
                minWidth: pct > 0 ? "8px" : "0",
                transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_BODY,
              fontSize: "0.72rem",
              color: T.muted,
            }}
          >
            <span>{Math.round(pct)}% claimed</span>
            <span>
              Total value:{" "}
              {formatCurrency(totalUnitsNum * settings.pricePerUnit)}
            </span>
          </div>
        </div>

        {/* Ownership map */}
        <div>
          <h4
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "0.9rem",
              fontWeight: 700,
              color: T.charcoal,
              marginBottom: "10px",
            }}
          >
            Ownership Map
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.68rem",
                fontWeight: 500,
                color: T.muted,
                marginLeft: "8px",
              }}
            >
              (each cell = 1% of units)
            </span>
          </h4>
          <UnitGrid
            totalUnits={settings.totalUnits}
            unitsSold={settings.unitsSold}
            pendingUnits={selectedUnits}
          />
        </div>

        {/* Claim form */}
        {available > 0 && (
          <form onSubmit={handleClaim}>
            <div
              style={{
                background: T.cream,
                border: `1px solid ${T.border}`,
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              {/* Unit selector */}
              <div style={{ marginBottom: "14px" }}>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: T.muted,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  How Many Units?
                </span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {UNIT_PRESETS.map((qty) => {
                    const isSelected = selectedUnits === qty;
                    const isOver = qty > available;
                    return (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => {
                          setSelectedUnits(qty);
                          setFormError(null);
                        }}
                        disabled={isOver}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "8px",
                          border: `1.5px solid ${isSelected ? T.green : isOver ? T.border : T.inputBorder}`,
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
                          fontSize: "0.88rem",
                          fontWeight: isSelected ? 700 : 500,
                          cursor: isOver ? "not-allowed" : "pointer",
                          opacity: isOver ? 0.5 : 1,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {qty}
                      </button>
                    );
                  })}
                  <input
                    type="number"
                    min="1"
                    max={available}
                    value={selectedUnits}
                    onChange={(e) => {
                      const v = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(v) && v >= 1) {
                        setSelectedUnits(v);
                        setFormError(null);
                      }
                    }}
                    style={{
                      width: "70px",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      border: `1.5px solid ${isOverLimit ? T.errorText : T.inputBorder}`,
                      background: T.white,
                      fontFamily: FONT_BODY,
                      fontSize: "0.88rem",
                      color: T.charcoal,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = T.green;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = isOverLimit
                        ? T.errorText
                        : T.inputBorder;
                    }}
                  />
                </div>
              </div>

              {/* Cost calculator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: T.goldLight,
                  border: `1px solid ${T.goldBorder}`,
                  borderRadius: "9px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.8rem",
                    color: T.muted,
                  }}
                >
                  {selectedUnits.toLocaleString()} ×{" "}
                  {formatCurrency(settings.pricePerUnit)}
                </span>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: T.charcoal,
                  }}
                >
                  {formatCurrency(totalCost)}
                </span>
              </div>

              {/* Name input */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor={`name-${String(campaign.id)}`}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: T.muted,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Your Name (Optional)
                </label>
                <input
                  id={`name-${String(campaign.id)}`}
                  type="text"
                  placeholder="Anonymous co-owner"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${T.inputBorder}`,
                    background: T.white,
                    fontFamily: FONT_BODY,
                    fontSize: "0.88rem",
                    color: T.charcoal,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = T.green;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = T.inputBorder;
                  }}
                />
              </div>

              {formError && (
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.8rem",
                    color: T.errorText,
                    background: T.errorBg,
                    borderRadius: "8px",
                    padding: "9px 13px",
                    marginBottom: "10px",
                  }}
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || isOverLimit}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "9px",
                  border: "none",
                  background:
                    submitting || isOverLimit
                      ? "oklch(0.65 0.06 155)"
                      : T.green,
                  color: T.white,
                  fontFamily: FONT_BODY,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: submitting || isOverLimit ? "not-allowed" : "pointer",
                  transition: "background 0.15s, transform 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!submitting && !isOverLimit)
                    e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid oklch(1 0 0 / 0.25)",
                        borderTopColor: T.white,
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "coopSpin 0.7s linear infinite",
                      }}
                    />
                    Claiming…
                  </>
                ) : isOverLimit ? (
                  `Only ${available.toLocaleString()} units available`
                ) : (
                  `🌿 Claim ${selectedUnits} Unit${selectedUnits !== 1 ? "s" : ""}`
                )}
              </button>
            </div>
          </form>
        )}

        {/* Fully claimed state */}
        {available === 0 && (
          <div
            style={{
              padding: "16px",
              background: T.successBg,
              border: "1px solid oklch(0.72 0.08 155)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "1rem",
                fontWeight: 700,
                color: T.green,
                marginBottom: "4px",
              }}
            >
              🎉 All Units Claimed
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.8rem",
                color: T.muted,
              }}
            >
              This collective project is fully co-owned!
            </p>
          </div>
        )}

        {/* Recent co-owners */}
        <div>
          <h4
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "0.9rem",
              fontWeight: 700,
              color: T.charcoal,
              marginBottom: "10px",
            }}
          >
            Recent Co-Owners
          </h4>
          {loadingClaims ? (
            <div style={{ height: "60px", ...shimmerStyle }} />
          ) : (
            <RecentClaims claims={claims} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Community stats bar ──────────────────────────────────────────────────────
interface CommunityStatsProps {
  campaigns: Campaign[];
  settingsMap: Map<string, FractionalizationSettings>;
}

function CommunityStatsBar({ campaigns, settingsMap }: CommunityStatsProps) {
  const activeCampaigns = campaigns.filter((c) =>
    settingsMap.has(String(c.id)),
  );
  const totalUnitsClaimed = activeCampaigns.reduce((sum, c) => {
    const s = settingsMap.get(String(c.id));
    return sum + (s ? Number(s.unitsSold) : 0);
  }, 0);
  const totalValue = activeCampaigns.reduce((sum, c) => {
    const s = settingsMap.get(String(c.id));
    return sum + (s ? Number(s.unitsSold) * s.pricePerUnit : 0);
  }, 0);
  const totalCoOwners = activeCampaigns.reduce((sum, c) => {
    const s = settingsMap.get(String(c.id));
    return sum + (s ? Number(s.unitsSold) : 0);
  }, 0);

  const stats = [
    { label: "Active Collectives", value: activeCampaigns.length.toString() },
    { label: "Units Claimed", value: totalUnitsClaimed.toLocaleString() },
    { label: "Collective Value", value: formatCurrency(totalValue) },
    { label: "Co-Owner Actions", value: totalCoOwners.toLocaleString() },
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
        marginBottom: "48px",
        boxShadow: "0 2px 12px oklch(0.18 0.01 200 / 0.05)",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: T.white,
            padding: "20px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.7rem",
              fontWeight: 700,
              color: T.green,
              lineHeight: 1,
              marginBottom: "5px",
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.67rem",
              color: T.muted,
              fontWeight: 600,
              letterSpacing: "0.07em",
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
export function CooperativesPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settingsMap, setSettingsMap] = useState<
    Map<string, FractionalizationSettings>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      const [allCampaigns, allSettings] = await Promise.all([
        actor.allCampaigns(),
        actor.getAllFractionalizationSettings(),
      ]);
      setCampaigns(allCampaigns);
      const map = new Map<string, FractionalizationSettings>();
      for (const [id, settings] of allSettings) {
        map.set(String(id), settings);
      }
      setSettingsMap(map);
    } catch (err) {
      console.error("Failed to load Co-operatives data:", err);
      setError("Unable to load collective projects. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || actorLoading) return;
    loadData();
  }, [actor, actorLoading, loadData]);

  const withSettings = campaigns.filter((c) => settingsMap.has(String(c.id)));
  const withoutSettings = campaigns.filter(
    (c) => !settingsMap.has(String(c.id)),
  );
  const isLoading = loading || actorLoading;

  return (
    <>
      <style>{`
        @keyframes coopShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes coopSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes coopFadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .coop-card-enter {
          animation: coopFadeInUp 0.4s ease forwards;
        }
        .coop-section-enter {
          animation: coopFadeInUp 0.5s ease forwards;
        }
      `}</style>

      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: T.cream,
          paddingBottom: "80px",
        }}
      >
        {/* ── Page hero ─────────────────────────────────────── */}
        <header
          style={{
            background:
              "linear-gradient(160deg, oklch(0.94 0.04 155) 0%, oklch(0.97 0.02 88) 65%)",
            borderBottom: `1px solid ${T.border}`,
            padding: "56px 24px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "740px", margin: "0 auto" }}>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 18px",
                  borderRadius: "999px",
                  fontFamily: FONT_BODY,
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
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                fontWeight: 700,
                color: T.green,
                lineHeight: 1.1,
                marginBottom: "12px",
              }}
            >
              OOO Co-operatives
            </h1>

            <p
              style={{
                fontFamily: FONT_DISPLAY,
                fontStyle: "italic",
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: T.gold,
                marginBottom: "20px",
              }}
            >
              Collectives AsA SerVSys — FinFranFran™ ownership for all
            </p>

            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.95rem",
                color: T.muted,
                lineHeight: 1.8,
                maxWidth: "580px",
                margin: "0 auto",
              }}
            >
              We take a collaborative approach as NewerWaysNow — spreading
              ownership, opportunity, and participation beyond traditional
              borders. Through FinFranFran™ fractional units, everyone can
              co-own a share of the projects that matter most.
            </p>
          </div>
        </header>

        {/* ── Content container ─────────────────────────────── */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "48px 24px 0",
          }}
        >
          {/* Collective Projects grid */}
          <CoopProjectGrid />

          {/* FinFranFran explainer card */}
          <div
            className="coop-section-enter"
            style={{
              background: `linear-gradient(135deg, oklch(0.94 0.05 155 / 0.5) 0%, ${T.goldLight} 100%)`,
              border: `1.5px solid ${T.goldBorder}`,
              borderRadius: "18px",
              padding: "28px 32px",
              marginBottom: "40px",
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: `linear-gradient(135deg, ${T.green}, ${T.greenCell})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                flexShrink: 0,
                boxShadow: "0 4px 16px oklch(0.38 0.12 155 / 0.25)",
              }}
            >
              🌿
            </div>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "8px",
                }}
              >
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: T.charcoal,
                  }}
                >
                  FinFranFran™
                </h2>
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
                  Financial Fractionalization
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.9rem",
                  color: T.muted,
                  lineHeight: 1.75,
                  maxWidth: "620px",
                }}
              >
                FinFranFran™ divides large collective projects into affordable
                participation units, spreading cost-effective ownership across
                all our players — within and beyond traditional borders of
                business and nation building. You don't need to fund an entire
                project alone. Claim your fraction, own your share, and together
                we build what none of us could alone.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                }}
              >
                {[
                  "Fractional ownership",
                  "Cost-effective for everyone",
                  "Beyond borders",
                  "Collective accountability",
                ].map((point) => (
                  <span
                    key={point}
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: T.green,
                      background: T.greenLight,
                      borderRadius: "6px",
                      padding: "4px 12px",
                      border: "1px solid oklch(0.82 0.06 155)",
                    }}
                  >
                    ✓ {point}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          {!isLoading && !error && campaigns.length > 0 && (
            <CommunityStatsBar
              campaigns={campaigns}
              settingsMap={settingsMap}
            />
          )}

          {/* Error state */}
          {error && (
            <div
              style={{
                background: T.errorBg,
                border: "1px solid oklch(0.85 0.06 15)",
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.9rem",
                  color: T.errorText,
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={loadData}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: T.green,
                  color: T.white,
                  fontFamily: FONT_BODY,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <PageSkeleton />}

          {/* Empty state */}
          {!isLoading && !error && campaigns.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 24px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "72px",
                  height: "72px",
                  borderRadius: "18px",
                  background: T.greenLight,
                  marginBottom: "20px",
                  fontSize: "2.2rem",
                }}
              >
                🌱
              </div>
              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1.4rem",
                  color: T.charcoal,
                  marginBottom: "10px",
                }}
              >
                No collective projects yet
              </h3>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "0.9rem",
                  color: T.muted,
                  lineHeight: 1.7,
                }}
              >
                Visit the Charitable section to view campaigns, then return here
                to activate FinFranFran™ ownership.
              </p>
            </div>
          )}

          {/* Active collective projects */}
          {!isLoading && !error && withSettings.length > 0 && (
            <section style={{ marginBottom: "56px" }}>
              <div style={{ marginBottom: "28px" }}>
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "6px",
                  }}
                >
                  Active Collective Projects
                </h2>
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.88rem",
                    color: T.muted,
                  }}
                >
                  Claim units to become a fractional co-owner of these campaigns
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                  gap: "28px",
                }}
              >
                {withSettings.map((campaign, i) => {
                  const settings = settingsMap.get(String(campaign.id));
                  if (!settings) return null;
                  return (
                    <div
                      key={String(campaign.id)}
                      className="coop-card-enter"
                      style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                    >
                      <CollectiveProjectCard
                        campaign={campaign}
                        settings={settings}
                        onRefresh={loadData}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Campaigns without fractionalization */}
          {!isLoading && !error && withoutSettings.length > 0 && (
            <section>
              <div style={{ marginBottom: "28px" }}>
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: T.charcoal,
                    marginBottom: "6px",
                  }}
                >
                  Ready to Activate
                </h2>
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: "0.88rem",
                    color: T.muted,
                  }}
                >
                  These campaigns can be enabled for FinFranFran™ fractional
                  co-ownership
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
                  gap: "24px",
                }}
              >
                {withoutSettings.map((campaign, i) => (
                  <div
                    key={String(campaign.id)}
                    className="coop-card-enter"
                    style={{
                      animationDelay: `${(withSettings.length + i) * 80}ms`,
                      opacity: 0,
                    }}
                  >
                    <ActivateFinFranFranPanel
                      campaign={campaign}
                      onActivated={loadData}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Member Directory ───────────────────────────────────────────── */}
        <div
          data-ocid="member_directory.section"
          style={{
            padding: "2.5rem 2rem",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', serif)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "oklch(var(--foreground))",
              marginBottom: "1.25rem",
            }}
          >
            Member Directory
          </h2>
          <div
            data-ocid="member_directory.list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {SAMPLE_MEMBERS.map((member, idx) => (
              <MemberDirectoryCard
                key={member.id}
                member={member}
                index={idx + 1}
              />
            ))}
          </div>
        </div>

        {/* ── Collaborative Actions Board ────────────────────────────────── */}
        <div
          style={{
            padding: "0 2rem 3rem",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <CollabActionsBoard />
        </div>
      </main>
    </>
  );
}

export default CooperativesPage;
