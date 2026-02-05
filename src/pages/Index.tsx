import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { ProblemSection } from '@/components/ProblemSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FeaturesSection } from '@/components/FeaturesSection';

type Section = 'home' | 'problem' | 'how-it-works' | 'features';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSection = (location.hash.replace('#', '') || 'home') as Section;

  const handleNavigation = (section: Section) => {
    if (section === 'problem') {
      navigate('/orbit-risk');
    } else {
      navigate(`#${section}`, { replace: true });
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'problem':
        return <ProblemSection />;
      case 'how-it-works':
        return <HowItWorksSection />;
      case 'features':
        return <FeaturesSection />;
      case 'home':
      default:
        return <HeroSection onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      {renderSection()}
    </div>
  );
};

export default Index;
