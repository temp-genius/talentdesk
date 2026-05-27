export const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.ie',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'zoho.com',
  'ymail.com',
  'rocketmail.com',
]

export function validateHiringManagerEmail(email) {
  const parts = (email ?? '').toLowerCase().trim().split('@')
  if (parts.length !== 2 || !parts[1]) return false
  return !BLOCKED_EMAIL_DOMAINS.includes(parts[1])
}
