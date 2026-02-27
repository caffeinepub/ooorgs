import { useState } from "react";
import type { Campaign } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
  green: "oklch(0.38 0.12 155)",
  greenLight: "oklch(0.92 0.04 155)",
  greenDark: "oklch(0.28 0.10 155)",
  greenDisabled: "oklch(0.62 0.06 155)",
  gold: "oklch(0.72 0.14 72)",
  goldLight: "oklch(0.96 0.04 72)",
  goldBorder: "oklch(0.88 0.06 72)",
  cream: "oklch(0.97 0.02 88)",
  border: "oklch(0.88 0.03 88)",
  charcoal: "oklch(0.18 0.01 200)",
  muted: "oklch(0.50 0.02 200)",
  white: "oklch(1 0 0)",
  successBg: "oklch(0.95 0.04 155)",
  successBorder: "oklch(0.84 0.08 155)",
  successText: "oklch(0.30 0.10 155)",
  inputBg: "oklch(0.99 0.01 88)",
  inputBorder: "oklch(0.85 0.03 88)",
  inputFocus: "oklch(0.38 0.12 155)",
  errorText: "oklch(0.42 0.15 15)",
  errorBg: "oklch(0.95 0.04 15)",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey = "cash" | "inkind" | "volunteer";

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: "cash", label: "Cash Donation", icon: "💷" },
  { key: "inkind", label: "In-Kind Gift", icon: "🎁" },
  { key: "volunteer", label: "Volunteer Time", icon: "🤝" },
];

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

const AVAILABILITY_OPTIONS = [
  { id: "weekday-morning", label: "Weekday Mornings" },
  { id: "weekday-afternoon", label: "Weekday Afternoons" },
  { id: "evenings", label: "Evenings" },
  { id: "weekends", label: "Weekends" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
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
  fontSize: "0.78rem",
  fontWeight: 600,
  color: T.muted,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "6px",
};

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

// ─── Inline error message ─────────────────────────────────────────────────────
function InlineError({ message }: { message: string }) {
  return (
    <p
      style={{
        fontFamily: FONT_BODY,
        fontSize: "0.82rem",
        color: T.errorText,
        marginTop: "10px",
        textAlign: "center",
      }}
    >
      {message}
    </p>
  );
}

// ─── Success card ─────────────────────────────────────────────────────────────
const SUCCESS_MESSAGES: Record<TabKey, string> = {
  cash:
    "Your generous donation is making a real difference. Every contribution, large or small, brings this campaign closer to its goal.",
  inkind:
    "Your in-kind gift has been received. Our team will be in touch soon to arrange collection or delivery details.",
  volunteer:
    "Your volunteer interest has been registered. We'll be in touch with opportunities that match your availability and skills.",
};

function SuccessCard({
  tabKey,
  onReset,
}: {
  tabKey: TabKey;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        background: T.successBg,
        border: `1px solid ${T.successBorder}`,
        borderRadius: "12px",
        padding: "36px 28px",
        textAlign: "center",
        animation: "ooo-fadeInUp 0.35s ease forwards",
      }}
    >
      {/* Checkmark icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: T.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "1.5rem",
        }}
      >
        ✓
      </div>

      <h3
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "1.5rem",
          fontWeight: 700,
          color: T.successText,
          marginBottom: "12px",
        }}
      >
        Thank You!
      </h3>

      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: "0.9rem",
          color: T.successText,
          lineHeight: 1.75,
          maxWidth: "380px",
          margin: "0 auto 28px",
          opacity: 0.85,
        }}
      >
        {SUCCESS_MESSAGES[tabKey]}
      </p>

      <button
        type="button"
        onClick={onReset}
        style={{
          fontFamily: FONT_BODY,
          fontSize: "0.85rem",
          fontWeight: 600,
          color: T.green,
          background: "transparent",
          border: `1.5px solid ${T.green}`,
          borderRadius: "8px",
          padding: "9px 22px",
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = T.green;
          e.currentTarget.style.color = T.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = T.green;
        }}
      >
        Make Another Contribution
      </button>
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────
function SubmitButton({
  label,
  disabled,
  isLoading,
}: {
  label: string;
  disabled: boolean;
  isLoading: boolean;
}) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={{
        width: "100%",
        padding: "13px 24px",
        borderRadius: "10px",
        border: "none",
        background: isDisabled ? T.inputBorder : T.green,
        color: isDisabled ? T.muted : T.white,
        fontFamily: FONT_BODY,
        fontSize: "0.95rem",
        fontWeight: 700,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        letterSpacing: "0.03em",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.background = T.greenDark;
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.background = T.green;
      }}
    >
      {isLoading ? "Processing..." : label}
    </button>
  );
}

// ─── Cash donation tab ────────────────────────────────────────────────────────
function CashTab({
  campaignId,
  actor,
  onSuccess,
  onCampaignUpdated,
}: {
  campaignId: bigint;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onSuccess: () => void;
  onCampaignUpdated?: (updated: Campaign) => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const finalAmount = isCustom ? parseFloat(customAmount) : (selectedAmount ?? 0);
  const hasAmount = finalAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAmount) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await actor.recordDonation(campaignId, finalAmount, donorName || "Anonymous");
      if (result !== null && onCampaignUpdated) {
        onCampaignUpdated(result);
      }
      onSuccess();
    } catch (err) {
      console.error("Donation error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Preset amounts */}
      <FieldGroup label="Select Amount">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAmountClick(amount)}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: `1.5px solid ${selectedAmount === amount ? T.green : T.inputBorder}`,
                background: selectedAmount === amount ? T.greenLight : T.inputBg,
                color: selectedAmount === amount ? T.green : T.charcoal,
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                fontWeight: selectedAmount === amount ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              £{amount}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: `1.5px solid ${isCustom ? T.green : T.inputBorder}`,
              background: isCustom ? T.greenLight : T.inputBg,
              color: isCustom ? T.green : T.charcoal,
              fontFamily: FONT_BODY,
              fontSize: "0.9rem",
              fontWeight: isCustom ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Custom
          </button>
        </div>
      </FieldGroup>

      {/* Custom amount input */}
      {isCustom && (
        <FieldGroup label="Custom Amount (£)">
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
          />
        </FieldGroup>
      )}

      {/* Donor name */}
      <FieldGroup label="Your Name (Optional)">
        <input
          type="text"
          placeholder="Anonymous"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      {/* Submit */}
      <SubmitButton label="💷 Donate Now" disabled={!hasAmount} isLoading={isLoading} />
      {error && <InlineError message={error} />}
    </form>
  );
}

// ─── In-Kind tab ──────────────────────────────────────────────────────────────
function InKindTab({
  campaignId,
  actor,
  onSuccess,
}: {
  campaignId: bigint;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onSuccess: () => void;
}) {
  const [itemName, setItemName] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = itemName.trim().length > 0 && contactEmail.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await actor.recordGift(
        campaignId,
        itemName,
        estimatedValue ? parseFloat(estimatedValue) : 0,
        description,
        contactEmail,
      );
      onSuccess();
    } catch (err) {
      console.error("Gift error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup label="Item Name">
        <input
          type="text"
          placeholder="e.g. Office supplies, Laptop, Clothing"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      <FieldGroup label="Estimated Value (£)">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Approximate market value"
          value={estimatedValue}
          onChange={(e) => setEstimatedValue(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      <FieldGroup label="Description">
        <textarea
          placeholder="Describe the item, its condition, and any relevant details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      <FieldGroup label="Contact Email">
        <input
          type="email"
          placeholder="your@email.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      <SubmitButton label="🎁 Submit Gift" disabled={!isValid} isLoading={isLoading} />
      {error && <InlineError message={error} />}
    </form>
  );
}

// ─── Volunteer tab ────────────────────────────────────────────────────────────
function VolunteerTab({
  campaignId,
  actor,
  onSuccess,
}: {
  campaignId: bigint;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAvailability = (id: string) => {
    setAvailability((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const isValid = fullName.trim().length > 0 && email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await actor.registerVolunteer(campaignId, fullName, email, availability, skills);
      onSuccess();
    } catch (err) {
      console.error("Volunteer error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup label="Full Name">
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
      </FieldGroup>

      <FieldGroup label="Email">
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
      </FieldGroup>

      <FieldGroup label="Availability">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {AVAILABILITY_OPTIONS.map((opt) => {
            const active = availability.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleAvailability(opt.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  border: `1.5px solid ${active ? T.green : T.inputBorder}`,
                  background: active ? T.greenLight : T.inputBg,
                  color: active ? T.green : T.muted,
                  fontFamily: FONT_BODY,
                  fontSize: "0.82rem",
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
      </FieldGroup>

      <FieldGroup label="Skills & Interests">
        <textarea
          placeholder="Tell us what skills you'd like to bring (e.g. teaching, carpentry, fundraising, admin)..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.inputBorder; }}
        />
      </FieldGroup>

      <SubmitButton label="🤝 Register Interest" disabled={!isValid} isLoading={isLoading} />
      {error && <InlineError message={error} />}
    </form>
  );
}

// ─── Main ContributionPanel component ────────────────────────────────────────
interface ContributionPanelProps {
  campaign: Campaign;
  onCampaignUpdated?: (updated: Campaign) => void;
}

export function ContributionPanel({ campaign, onCampaignUpdated }: ContributionPanelProps) {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<TabKey>("cash");
  const [submitted, setSubmitted] = useState<TabKey | null>(null);

  const handleSuccess = () => {
    setSubmitted(activeTab);
  };

  const handleReset = () => {
    setSubmitted(null);
  };

  // If actor isn't available yet, show a subtle loading state
  if (!actor) {
    return (
      <section
        style={{
          background: T.white,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 4px 24px oklch(0.18 0.01 200 / 0.07)",
        }}
      >
        <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: T.muted }}>
          Loading contribution options…
        </p>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ooo-fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ooo-contribution-panel {
          background: oklch(1 0 0);
          border-radius: 16px;
          border: 1px solid oklch(0.88 0.03 88);
          box-shadow: 0 4px 24px oklch(0.18 0.01 200 / 0.07), 0 1px 4px oklch(0.18 0.01 200 / 0.04);
          overflow: hidden;
        }
        .ooo-tab-btn {
          flex: 1;
          padding: 14px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.18s;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .ooo-tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 8px;
          right: 8px;
          height: 2.5px;
          border-radius: 2px 2px 0 0;
          background: transparent;
          transition: background 0.18s;
        }
        .ooo-tab-btn.active::after {
          background: oklch(0.38 0.12 155);
        }
      `}</style>

      <section className="ooo-contribution-panel">
        {/* Panel heading */}
        <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${T.border}` }}>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.25rem",
              fontWeight: 700,
              color: T.charcoal,
              marginBottom: "4px",
            }}
          >
            Support "{campaign.title}"
          </h3>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.83rem",
              color: T.muted,
              marginBottom: "16px",
            }}
          >
            Choose how you'd like to contribute — every act of generosity counts.
          </p>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderTop: `1px solid ${T.border}`,
              marginTop: "4px",
              marginLeft: "-28px",
              marginRight: "-28px",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`ooo-tab-btn${isActive ? " active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSubmitted(null);
                  }}
                  style={{
                    color: isActive ? T.green : T.muted,
                    fontFamily: FONT_BODY,
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{tab.icon}</span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: "28px" }} key={activeTab}>
          {submitted !== null ? (
            <SuccessCard tabKey={submitted} onReset={handleReset} />
          ) : (
            <>
              {activeTab === "cash" && (
                <CashTab
                  campaignId={campaign.id}
                  actor={actor}
                  onSuccess={handleSuccess}
                  onCampaignUpdated={onCampaignUpdated}
                />
              )}
              {activeTab === "inkind" && (
                <InKindTab
                  campaignId={campaign.id}
                  actor={actor}
                  onSuccess={handleSuccess}
                />
              )}
              {activeTab === "volunteer" && (
                <VolunteerTab
                  campaignId={campaign.id}
                  actor={actor}
                  onSuccess={handleSuccess}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default ContributionPanel;
