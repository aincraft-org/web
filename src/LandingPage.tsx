import { useEffect } from 'react';
import { journalSections } from './content';
import { HeroSection } from './components/HeroSection';
import { IntroSection } from './components/IntroSection';
import { JoinSection } from './components/JoinSection';
import { JournalSection } from './components/JournalSection';
import type { CopyHandler, CopyState } from './components/CopyIpButton';

interface LandingPageProps {
  copiedButtons: CopyState;
  feedback: { hero: boolean; join: boolean };
  onCopy: CopyHandler;
  setActiveSection: (section: string) => void;
}

export default function LandingPage({ copiedButtons, feedback, onCopy, setActiveSection }: LandingPageProps) {
  useEffect(() => {
    document.documentElement.dataset.activeSection = 'hero';

    return () => {
      delete document.documentElement.dataset.activeSection;
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    if (!('IntersectionObserver' in window) || !sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActiveSection]);

  return (
    <>
      <HeroSection
        copiedButtons={copiedButtons}
        feedbackVisible={feedback.hero}
        onCopy={onCopy}
      />
      <IntroSection />
      {journalSections.map((section) => (
        <JournalSection key={section.id} section={section} />
      ))}
      <JoinSection
        copiedButtons={copiedButtons}
        feedbackVisible={feedback.join}
        onCopy={onCopy}
      />
    </>
  );
}
