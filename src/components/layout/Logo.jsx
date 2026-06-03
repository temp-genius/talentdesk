export default function Logo({ dark = false }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 700,
        fontSize: 20,
        color: dark ? '#ffffff' : '#1a2b6d',
        letterSpacing: '-0.2px',
      }}>Vetted TA</span>
      <span style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 7,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.4)' : '#6b7280',
        marginTop: 2,
      }}>Recruitment Marketplace</span>
    </span>
  )
}
