import { useState, useEffect } from "react";
import type { Campaign } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
  greenDark: "oklch(0.28 0.10 155)",
  greenPill: "oklch(0.90 0.05 155)",
  greenPillText: "oklch(0.28 0.10 155)",
  gold: "oklch(0.72 0.14 72)",
  cream: "oklch(0.97 0.02 88)",
  border: "oklch(0.88 0.03 88)",
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  white: "oklch(1 0 0)",
  inputBg: "oklch(0.99 0.01 88)",
  inputBorder: "oklch(0.85 0.03 88)",
  inputFocus: "oklch(0.38 0.12 155)",
  successBg: "oklch(0.95 0.04 155)",
  successBorder: "oklch(0.84 0.08 155)",
  successText: "oklch(0.30 0.10 155)",
  errorText: "oklch(0.42 0.15 15)",
  errorBg: "oklch(0.95 0.04 15)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

// ─── Category colors (matches CharitablePage) ─────────────────────────────────
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

// ─── Availability options ─────────────────────────────────────────────────────
const AVAILABILITY_OPTIONS = [
  { id: "weekday-morning", label: "Weekday Mornings" },
  { id: "weekday-afternoon", label: "Weekday Afternoons" },
  { id: "evenings", label: "Evenings" },
  { id: "weekends", label: "Weekends" },
];

// ─── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: `1px solid ${T.inputBorder}`,
  background: T.inputBg,
  fontFamily: FONT_BODY,
  fontSize: "0.9rem",
  color: T.charcoal,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: T.muted,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "6px",
};

// ─── Inline sign-up form ──────────────────────────────────────────────────────
interface SignUpFormProps {
  campaignId: bigint;
  onSuccess: (volunteerName: string) => void;
  onCancel: () => void;
}

function SignUpForm({ campaignId, onSuccess, onCancel }: SignUpFormProps) {
  const { actor } = useActor();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = fullName.trim().length > 0 && email.includes("@");

  const toggleAvailability = (id: string) => {
    setAvailability((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !actor) return;

    setIsLoading(true);
    setError(null);

    try {
      await actor.registerVolunteer(campaignId, fullName, email, availability, skills);
      onSuccess(fullName);
    } catch (err) {
      console.error("Volunteer registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "16px",
        padding: "20px",
        background: T.greenLight,
        borderRadius: "12px",
        border: `1px solid oklch(0.84 0.07 155)`,
        animation: "ooo-expand 0.3s ease forwards",
      }}
    >
      {/* Full Name */}
      <div style={{ marginBottom: "14px" }}>
        <span style={labelStyle}>Full Name</span>
        <input
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "14px" }}>
        <span style={labelStyle}>Email</span>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </div>

      {/* Availability checkboxes */}
      <div style={{ marginBottom: "14px" }}>
        <span style={labelStyle}>Availability</span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {AVAILABILITY_OPTIONS.map((opt) => {
            const active = availability.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleAvailability(opt.id)}
                style={{
                  padding: "6px 13px",
                  borderRadius: "999px",
                  border: `1.5px solid ${active ? T.green : T.inputBorder}`,
                  background: active ? T.white : "transparent",
                  color: active ? T.green : T.muted,
                  fontFamily: FONT_BODY,
                  fontSize: "0.78rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {active ? "✓ " : ""}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: "18px" }}>
        <span style={labelStyle}>Skills & Interests</span>
        <textarea
          placeholder="What skills would you like to contribute? (e.g. teaching, admin, carpentry)..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          style={{
            flex: 1,
            padding: "11px 20px",
            borderRadius: "9px",
            border: "none",
            background: !isValid || isLoading ? T.inputBorder : T.green,
            color: !isValid || isLoading ? T.muted : T.white,
            fontFamily: FONT_BODY,
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: !isValid || isLoading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (isValid && !isLoading) e.currentTarget.style.background = T.greenDark;
          }}
          onMouseLeave={(e) => {
            if (isValid && !isLoading) e.currentTarget.style.background = T.green;
          }}
        >
          {isLoading ? "Registering..." : "🤝 Register Interest"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 16px",
            borderRadius: "9px",
            border: `1.5px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontFamily: FONT_BODY,
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      {error && (
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.82rem",
            color: T.errorText,
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
interface VolunteerOpportunityCardProps {
  campaign: Campaign;
}

export function VolunteerOpportunityCard({ campaign }: VolunteerOpportunityCardProps) {
  const { actor } = useActor();
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  const colors = getCategoryColors(campaign.category);

  // Load volunteer count for this campaign
  useEffect(() => {
    if (!actor) return;
    actor
      .getVolunteersByCampaign(campaign.id)
      .then((volunteers) => setVolunteerCount(volunteers.length))
      .catch(() => setVolunteerCount(0));
  }, [actor, campaign.id]);

  const handleSuccess = (name: string) => {
    setSuccessName(name);
    setFormOpen(false);
    setVolunteerCount((prev) => (prev !== null ? prev + 1 : 1));
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        height: "100%",
      }}
    >
      {/* Category accent bar */}
      <div style={{ height: "4px", background: colors.bar, flexShrink: 0 }} />

      <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Top row: category badge + volunteer count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: FONT_BODY,
              background: colors.bg,
              color: colors.text,
            }}
          >
            {campaign.category}
          </span>

          {volunteerCount !== null && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 11px",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: FONT_BODY,
                background: T.greenPill,
                color: T.greenPillText,
              }}
            >
              <span style={{ fontSize: "0.9em" }}>🤝</span>
              {volunteerCount} volunteer{volunteerCount !== 1 ? "s" : ""} registered
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
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
            fontFamily: FONT_BODY,
            fontSize: "0.875rem",
            color: T.muted,
            lineHeight: 1.6,
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {campaign.shortDescription}
        </p>

        {/* Time commitment / availability tags */}
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.7rem",
              fontWeight: 600,
              color: T.muted,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Time Commitment
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <span
                key={opt.id}
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontFamily: FONT_BODY,
                  fontWeight: 500,
                  color: T.muted,
                  background: "oklch(0.93 0.01 200)",
                  border: `1px solid ${T.border}`,
                }}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>

        {/* Organizer */}
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontStyle: "italic",
            fontSize: "0.78rem",
            color: T.gold,
            marginBottom: "18px",
          }}
        >
          By {campaign.organizerName}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: T.border, marginBottom: "18px" }} />

        {/* Success message */}
        {successName && !formOpen && (
          <div
            style={{
              background: T.successBg,
              border: `1px solid ${T.successBorder}`,
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "ooo-fadeInUp 0.3s ease forwards",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: "0.875rem",
                color: T.successText,
                fontWeight: 500,
              }}
            >
              Thank you, <strong>{successName}</strong>! We'll be in touch.
            </span>
          </div>
        )}

        {/* Volunteer button */}
        {!formOpen && (
          <button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setSuccessName(null);
            }}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: T.green,
              color: T.white,
              fontFamily: FONT_BODY,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.greenDark; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.green; }}
          >
            🌿 I Want to Volunteer
          </button>
        )}

        {/* Inline sign-up form */}
        {formOpen && (
          <SignUpForm
            campaignId={campaign.id}
            onSuccess={handleSuccess}
            onCancel={() => setFormOpen(false)}
          />
        )}
      </div>
    </article>
  );
}

export default VolunteerOpportunityCard;
