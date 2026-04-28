// ====================================================
// VOTEGUIDE AI — Feature Card Component
// ====================================================

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card" tabIndex={0}>
      <div className="feature-icon-wrap">
        <div className="feature-icon">{icon}</div>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
