import BottomCta from "../src/components/landing/BottomCta";
import FeatureGrid from "../src/components/landing/FeatureGrid";
import HeroSection from "../src/components/landing/HeroSection";
import WorkflowSection from "../src/components/landing/WorkflowSection";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app-gradient">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <BottomCta />
    </main>
  );
}
