import HeroSection from "../components/HeroSection";
import StatsBar from "../components/StatsBar";
import BranchCards from "../components/BranchCards";
import RoadmapAccordion from "../components/RoadmapAccordion";

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
