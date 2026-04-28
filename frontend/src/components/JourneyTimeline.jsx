// ====================================================
// VOTEGUIDE AI — Journey Timeline Component
// ====================================================

import { useEffect } from 'react';

const STEPS = [
  { num: 1, icon: '📋', title: 'Voter Registration (India)', desc: "Register to vote via Form 6 on NVSP. We'll guide you through the requirements." },
  { num: 2, icon: '✅', title: 'Check Voter ID (EPIC)', desc: 'Verify your name in the electoral roll and confirm your EPIC status.' },
  { num: 3, icon: '🗳️', title: 'Find Polling Booth', desc: 'Locate your polling booth and download your Voter Information Slip.' },
  { num: 4, icon: '📊', title: 'Election Process in India', desc: 'Understand EVM voting and track election results as they are announced.' },
];

const STATE_MAP = {
  1: 'not_registered',
  2: 'verification',
  3: 'voting_prep',
  4: 'results_info',
};

export default function JourneyTimeline({ currentStep = 1, onStepClick }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const el = document.querySelector('#journey .animate-on-scroll');
    if (el) observer.observe(el);
    const el2 = document.querySelector('#journey .journey-timeline');
    if (el2) observer.observe(el2);
    return () => observer.disconnect();
  }, []);

  function getStatus(stepNum) {
    if (stepNum < currentStep) return 'Completed';
    if (stepNum === currentStep) return 'Current';
    return 'Upcoming';
  }

  function getClassName(stepNum) {
    let cls = 'step-card';
    if (stepNum < currentStep) cls += ' completed';
    else if (stepNum === currentStep) cls += ' active';
    return cls;
  }

  const progressPercent = ((currentStep - 1) / 3) * 100;

  return (
    <section id="journey" className="section">
      <div className="section-header animate-on-scroll">
        <span className="section-badge">Your Path</span>
        <h2>The Voting <span className="gradient-text">Journey</span></h2>
        <p className="section-subtitle">Four simple steps from registration to results. We guide you through each one.</p>
      </div>
      <div className="journey-timeline animate-on-scroll">
        <div className="timeline-track">
          <div className="timeline-progress" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="timeline-steps" id="timeline-steps">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={getClassName(step.num)}
              data-step={step.num}
              tabIndex={0}
              role="button"
              aria-label={`Step ${step.num}: ${step.title}`}
              onClick={() => onStepClick && onStepClick(STATE_MAP[step.num])}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStepClick && onStepClick(STATE_MAP[step.num]);
                }
              }}
            >
              <div className="step-connector" />
              <div className="step-badge">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <div className="step-status">
                <span className="status-dot" />
                <span>{getStatus(step.num)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
