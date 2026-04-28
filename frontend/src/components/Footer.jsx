export default function Footer() {
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🗳️</span>
          <span className="logo-text">Vote<span className="gradient-text">Guide</span></span>
          <p className="footer-tagline">Empowering every voter with AI-guided assistance.</p>
        </div>
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Navigate</h4>
            <a href="#journey">Journey</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="https://www.nvsp.in/" target="_blank" rel="noopener noreferrer">NVSP Portal</a>
            <a href="https://eci.gov.in/" target="_blank" rel="noopener noreferrer">Election Commission of India</a>
            <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer">Voters Portal</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 VoteGuide AI. For informational purposes only.</p>
          <div className="footer-a11y">
            <button className="btn-text">Toggle Animations</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
