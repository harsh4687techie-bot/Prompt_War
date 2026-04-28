// ====================================================
// VOTEGUIDE AI — Calendar Button Component
// ====================================================

export default function CalendarButton({ title, details, startDate, endDate, label }) {
  const createCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: details,
      dates: `${startDate}/${endDate}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <a
      href={createCalendarUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="message-link"
    >
      📅 {label} ↗
    </a>
  );
}
