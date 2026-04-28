// ====================================================
// VOTEGUIDE AI — Response Card Component
// ====================================================

export default function ResponseCard({ children, className = '' }) {
  return (
    <div className={`message-bubble ${className}`}>
      {children}
    </div>
  );
}
