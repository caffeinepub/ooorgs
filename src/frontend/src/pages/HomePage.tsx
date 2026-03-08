import BranchCards from "../components/BranchCards";
import HeroSection from "../components/HeroSection";
import RoadmapAccordion from "../components/RoadmapAccordion";
import StatsBar from "../components/StatsBar";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <BranchCards />
      <RoadmapAccordion />
    </>
  );
}

export default HomePage;
