"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { FeatureHighlights } from "./FeatureHighlights";
import { CtaSection } from "./CtaSection";
import { Footer } from "@/components/layout/Footer";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

interface LandingPageProps {
  user?: User | null;
}

export default function LandingPage({ user }: LandingPageProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Navbar */}
      <LandingNavbar user={user} />

      {/* 2. Hero Section with Custom-Coded Dashboard Preview */}
      <main className="flex-1">
        <HeroSection user={user} />
        <FeatureHighlights />
        <CtaSection user={user} />
      </main>

      {/* 3. Footer */}
      <Footer onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* 4. Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
