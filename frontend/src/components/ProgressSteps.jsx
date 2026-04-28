// ====================================================
// VOTEGUIDE AI — Progress Steps Component
// ====================================================

export default function ProgressSteps({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="message-steps">
      {steps.map((step, i) => (
        <div key={i} className="message-step">
          <span className="message-step-num">{i + 1}</span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}
