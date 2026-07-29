export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
        <rect width="32" height="32" rx="7" fill="#1F3864" />
        <path
          d="M8 10l8 13 8-13"
          stroke="#2F6FED"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-navy-900">
          VettedTA <span className="text-accent-600">Leads</span>
        </span>
      )}
    </div>
  )
}
