import { useState } from 'react';
import Navbar from '../components/Navbar';
import Globe from '../components/Globe';
import Particles from '../components/Particles';
import JourneyTimeline from '../components/JourneyTimeline';
import FeaturesGrid from '../components/FeaturesGrid';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Expose chat opening so Hero buttons can trigger it
  const handleOpenChat = () => {
    const chatBtn = document.getElementById('chat-toggle');
    if (chatBtn && chatBtn.getAttribute('aria-expanded') === 'false') {
      chatBtn.click();
    }
  };

  return (
    <>
      <Navbar onOpenChat={handleOpenChat} />
      
      {/* ========== HERO SECTION ========== */}
      <section id="hero">
        <Particles />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Election Assistant
          </div>
          <h1>
            Your Personal<br />
            <span className="gradient-text">Election Guide</span>
          </h1>
          <p className="hero-subtitle">
            Navigate registration, verification, voting, and results with 
            an intelligent assistant tailored to Indian voters.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-lg" onClick={handleOpenChat}>
              <span>Start Your Journey</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#journey" className="btn-outline btn-lg">
              <span>Learn More</span>
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat" data-target="28" data-suffix=" States">
              <span className="stat-number">28</span>
              <span className="stat-suffix"> States</span>
              <span className="stat-label">& 8 UTs Covered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat" data-target="900" data-suffix="M+">
              <span className="stat-number">900</span>
              <span className="stat-suffix">M+</span>
              <span className="stat-label">Eligible Voters</span>
            </div>
            <div className="stat-divider" />
            <div className="stat" data-target="24" data-suffix="/7">
              <span className="stat-number">24</span>
              <span className="stat-suffix">/7</span>
              <span className="stat-label">AI Assistance</span>
            </div>
          </div>
        </div>
        <Globe />
      </section>

      <JourneyTimeline currentStep={currentStep} onStepClick={handleOpenChat} />
      <FeaturesGrid />
      <FAQ />
      <Footer />
      <ChatWidget onStepChange={setCurrentStep} />
    </>
  );
}
