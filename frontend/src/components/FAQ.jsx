import { useEffect } from 'react';

const FAQ_DATA = [
  { id: 'faq-1', q: 'How do I register to vote?', a: "You can register to vote online through the National Voter's Service Portal (NVSP) by filling out Form 6, or offline at your local Electoral Registration Office. You need to be an Indian citizen and 18 years old by the qualifying date. Our AI assistant can guide you through the process." },
  { id: 'faq-2', q: 'What documents do I need to vote?', a: "To vote, you must carry your original Voter ID (EPIC). Alternatively, you can use other approved photo IDs such as your Aadhaar Card, PAN Card, Driving License, Passport, or Bank Passbook with photograph. Check the Election Commission's guidelines for the full list." },
  { id: 'faq-3', q: 'Can I vote if I recently moved?', a: "Yes! If you've shifted residence, you need to update your address in the electoral roll by filling out Form 8 on the NVSP portal. It's important to update this before the election to vote at the booth near your new home." },
  { id: 'faq-4', q: 'What is early voting and absentee voting?', a: "In India, the general public votes on the designated polling day via EVMs. However, postal ballots are available for certain categories like service voters, election duty staff, senior citizens above 85 years, and persons with disabilities. Check your eligibility on the ECI website." },
  { id: 'faq-5', q: 'Is my information safe with VoteGuide?', a: "Absolutely. VoteGuide stores your journey progress locally on your device using your browser's localStorage. We never collect, store, or transmit your personal information to any server. Your privacy is our priority." },
];

export default function FAQ() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('#faq .animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" className="section">
      <div className="section-header animate-on-scroll">
        <span className="section-badge">Common Questions</span>
        <h2>Frequently <span className="gradient-text">Asked</span></h2>
        <p className="section-subtitle">Quick answers to common election questions.</p>
      </div>
      <div className="faq-list animate-on-scroll">
        {FAQ_DATA.map((item) => (
          <details key={item.id} className="faq-item" id={item.id}>
            <summary>
              <span>{item.q}</span>
              <svg className="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </summary>
            <div className="faq-answer"><p>{item.a}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}
