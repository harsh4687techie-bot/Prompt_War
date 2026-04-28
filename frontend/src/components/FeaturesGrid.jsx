import { useEffect } from 'react';
import FeatureCard from './FeatureCard';

const FEATURES = [
  { icon: '🤖', title: 'AI Assistant', description: 'Intelligent chatbot that personalizes your election journey based on age, location, and voter status.' },
  { icon: '📍', title: 'Polling Stations', description: 'Find your nearest polling station with Google Maps integration and get real-time directions.' },
  { icon: '📅', title: 'Smart Reminders', description: 'Set Google Calendar reminders for registration deadlines, early voting, and Election Day.' },
  { icon: '📊', title: 'Progress Tracking', description: 'Track your voting journey progress with persistence across sessions.' },
  { icon: '♿', title: 'Accessible Design', description: 'WCAG-compliant interface with keyboard navigation, screen reader support, and reduced motion options.' },
  { icon: '🔒', title: 'Privacy First', description: 'Your personal data is handled securely. Local storage keeps your progress safe and private.' },
];

export default function FeaturesGrid() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('#features .animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="section">
      <div className="section-header animate-on-scroll">
        <span className="section-badge">Capabilities</span>
        <h2>Smart <span className="gradient-text">Features</span></h2>
        <p className="section-subtitle">Everything you need for a smooth election experience, powered by AI.</p>
      </div>
      <div className="features-grid animate-on-scroll">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}
