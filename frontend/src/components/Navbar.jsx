// ====================================================
// VOTEGUIDE AI — Navigation Bar Component
// ====================================================

import { useState, useEffect, useCallback } from 'react';

export default function Navbar({ onOpenChat }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }, []);

  return (
    <nav id="main-nav" className={scrolled ? 'scrolled' : ''} role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="#" className="nav-logo" aria-label="VoteGuide AI Home">
          <span className="logo-icon">🗳️</span>
          <span className="logo-text">Vote<span className="gradient-text">Guide</span></span>
        </a>

        <ul className={`nav-links${mobileOpen ? ' mobile-open' : ''}`} id="nav-links">
          <li><a href="#journey" onClick={(e) => handleNavClick(e, '#journey')}>Journey</a></li>
          <li><a href="#features" onClick={(e) => handleNavClick(e, '#features')}>Features</a></li>
          <li><a href="#faq" onClick={(e) => handleNavClick(e, '#faq')}>FAQ</a></li>
        </ul>

        <div className="nav-actions">
          <button id="nav-cta" className="btn-primary btn-sm" onClick={onOpenChat}>
            Get Started
          </button>
          <button
            id="mobile-menu-toggle"
            className="btn-icon mobile-only"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="hamburger" />
          </button>
        </div>
      </div>
    </nav>
  );
}
