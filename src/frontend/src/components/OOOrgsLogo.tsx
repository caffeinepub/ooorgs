interface OOOrgsLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 40, title: "text-lg", subtitle: "text-xs" },
  md: { img: 64, title: "text-2xl", subtitle: "text-sm" },
  lg: { img: 96, title: "text-4xl", subtitle: "text-base" },
  xl: { img: 128, title: "text-5xl", subtitle: "text-lg" },
};

export function OOOrgsLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: OOOrgsLogoProps) {
  const { img, title, subtitle } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src="/assets/generated/ooorgs-emblem-transparent.dim_200x200.png"
        alt="OOOrgs trefoil emblem"
        width={img}
        height={img}
        style={{ width: img, height: img, objectFit: "contain" }}
      />
      {showWordmark && (
        <div className="text-center">
          <div
            className={`${title} font-bold leading-tight`}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "oklch(0.38 0.12 155)",
            }}
          >
            OOOrgs
          </div>
          <div
            className={`${subtitle} font-medium tracking-[0.2em] uppercase`}
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              color: "oklch(0.72 0.14 72)",
            }}
          >
            OrganicOpulence
          </div>
        </div>
      )}
    </div>
  );
}

export default OOOrgsLogo;
