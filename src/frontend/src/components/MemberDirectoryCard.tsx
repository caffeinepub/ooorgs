// ─── Types ────────────────────────────────────────────────────────────────────
export interface CoopMember {
  id: string;
  fullName: string;
  role: string;
  location: string;
  skills: string[];
  projects: string[];
  joinedAt: string;
  bio: string;
  active: boolean;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
export const SAMPLE_MEMBERS: CoopMember[] = [
  {
    id: "m1",
    fullName: "Amara Diallo",
    role: "Agricultural Coordinator",
    location: "Lagos, Nigeria",
    skills: ["Permaculture", "Community Outreach", "Project Management"],
    projects: ["Green Valley Community Farm"],
    joinedAt: "2023-03-15",
    bio: "Passionate about regenerative agriculture and food sovereignty across West Africa.",
    active: true,
  },
  {
    id: "m2",
    fullName: "Priya Nair",
    role: "Housing Advocate",
    location: "Bangalore, India",
    skills: ["Urban Planning", "Co-op Law", "Finance Modeling"],
    projects: ["Cooperative Housing Initiative"],
    joinedAt: "2023-06-01",
    bio: "Working to make cooperative housing accessible and legally sound for urban communities.",
    active: true,
  },
  {
    id: "m3",
    fullName: "Carlos Mendez",
    role: "Energy Engineer",
    location: "Bogota, Colombia",
    skills: ["Solar Design", "Grid Integration", "Training & Capacity"],
    projects: ["Solar Energy Collective"],
    joinedAt: "2022-11-20",
    bio: "Solar energy specialist bridging technical expertise with grassroots co-op models.",
    active: true,
  },
  {
    id: "m4",
    fullName: "Zawadi Ochieng",
    role: "Digital Skills Trainer",
    location: "Nairobi, Kenya",
    skills: ["Web Development", "Digital Literacy", "Youth Mentorship"],
    projects: ["Digital Skills Co-op"],
    joinedAt: "2023-01-10",
    bio: "Empowering the next generation of African tech talent through cooperative learning.",
    active: true,
  },
  {
    id: "m5",
    fullName: "Fatima Al-Hassan",
    role: "Finance Manager",
    location: "Kano, Nigeria",
    skills: ["FinFranFran", "Bookkeeping", "Community Banking"],
    projects: ["Green Valley Community Farm", "Cooperative Housing Initiative"],
    joinedAt: "2023-08-05",
    bio: "Bringing transparent, fractional finance models to underserved cooperative communities.",
    active: true,
  },
  {
    id: "m6",
    fullName: "Kwame Asante",
    role: "Governance Lead",
    location: "Accra, Ghana",
    skills: ["DAO Governance", "Legal Frameworks", "Stakeholder Engagement"],
    projects: ["Solar Energy Collective", "Digital Skills Co-op"],
    joinedAt: "2022-09-18",
    bio: "Designing governance structures that put decision-making power back in community hands.",
    active: true,
  },
];

// ─── Role colour map ──────────────────────────────────────────────────────────
const ROLE_COLOURS: Record<string, { bg: string; text: string; dot: string }> =
  {
    "Agricultural Coordinator": {
      bg: "rgba(34,197,94,0.12)",
      text: "#16a34a",
      dot: "#16a34a",
    },
    "Housing Advocate": {
      bg: "rgba(59,130,246,0.12)",
      text: "#2563eb",
      dot: "#2563eb",
    },
    "Energy Engineer": {
      bg: "rgba(245,158,11,0.12)",
      text: "#b45309",
      dot: "#d97706",
    },
    "Digital Skills Trainer": {
      bg: "rgba(168,85,247,0.12)",
      text: "#7c3aed",
      dot: "#7c3aed",
    },
    "Finance Manager": {
      bg: "rgba(234,179,8,0.12)",
      text: "#a16207",
      dot: "#ca8a04",
    },
    "Governance Lead": {
      bg: "rgba(20,184,166,0.12)",
      text: "#0f766e",
      dot: "#14b8a6",
    },
  };

function getRoleColour(role: string) {
  return (
    ROLE_COLOURS[role] ?? {
      bg: "rgba(100,116,139,0.12)",
      text: "#475569",
      dot: "#64748b",
    }
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface MemberDirectoryCardProps {
  member: CoopMember;
  index: number;
}

export function MemberDirectoryCard({
  member,
  index,
}: MemberDirectoryCardProps) {
  const colour = getRoleColour(member.role);
  const initials = member.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const joinYear = new Date(member.joinedAt).getFullYear();

  return (
    <div
      data-ocid={`member_directory.item.${index}`}
      style={{
        background: "oklch(var(--card) / 1)",
        border: "1px solid oklch(var(--border) / 0.6)",
        borderRadius: "1rem",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 8px 24px ${colour.bg}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            background: colour.bg,
            border: `2px solid ${colour.dot}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display, 'Playfair Display', serif)",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: colour.text,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', serif)",
              fontWeight: 600,
              fontSize: "1rem",
              color: "oklch(var(--foreground))",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {member.fullName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.2rem",
            }}
          >
            <span
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                background: member.active ? "#22c55e" : "#94a3b8",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: "oklch(var(--muted-foreground))",
              }}
            >
              {member.active ? "Active" : "Inactive"} · Since {joinYear}
            </span>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <span
        data-ocid={`member_directory.role.${index}`}
        style={{
          display: "inline-block",
          background: colour.bg,
          color: colour.text,
          border: `1px solid ${colour.dot}33`,
          borderRadius: "999px",
          padding: "0.2rem 0.65rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        {member.role}
      </span>

      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <svg
          aria-hidden="true"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "oklch(var(--muted-foreground))", flexShrink: 0 }}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span
          style={{
            fontSize: "0.8rem",
            color: "oklch(var(--muted-foreground))",
          }}
        >
          {member.location}
        </span>
      </div>

      {/* Bio */}
      <p
        style={{
          fontSize: "0.82rem",
          color: "oklch(var(--muted-foreground))",
          lineHeight: 1.5,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {member.bio}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {member.skills.map((skill) => (
          <span
            key={skill}
            style={{
              background: "oklch(var(--muted) / 0.5)",
              color: "oklch(var(--foreground) / 0.7)",
              borderRadius: "0.35rem",
              padding: "0.15rem 0.5rem",
              fontSize: "0.72rem",
              fontWeight: 500,
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Projects */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "oklch(var(--muted-foreground))",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600 }}>Projects:</span>
        {member.projects.map((p) => (
          <span
            key={p}
            style={{
              background: "oklch(var(--primary) / 0.08)",
              color: "oklch(var(--primary))",
              borderRadius: "0.3rem",
              padding: "0.1rem 0.45rem",
              fontSize: "0.72rem",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
