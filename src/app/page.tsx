'use client';
import { Layouts } from '@/components/landing-page/layouts';
import { Sections } from '@/components/landing-page/sections';

export default function HomePage() {
  return (
    <div className="h-screen bg-white font-sans antialiased">
      <Layouts.NavBar />
      <Sections.HeroSection />
      <Sections.StatsSection />
      <Sections.ProcessSection />
      <Sections.RequirementsSection />
      <Sections.BenefitsSection />
      <Sections.CtaSection />
      <Layouts.Footer />
    </div>
  );
}
