export default function GoogleMap({ query }) {
  if (!query) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className="google-map-embed">
      <iframe
        title="Google Maps"
        src={src}
        width="100%"
        height="200"
        style={{ border: 0, borderRadius: '12px', marginTop: '8px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
