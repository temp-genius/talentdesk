const SITE_NAME    = 'Vetted TA'
const SITE_ORIGIN  = 'https://www.vettedta.com'
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/og-default.png`

export default function Seo({ title, description, image, path, type = 'website' }) {
  const fullTitle = title || SITE_NAME
  const ogImage   = image || DEFAULT_IMAGE
  const ogUrl     = path  ? `${SITE_ORIGIN}${path}` : SITE_ORIGIN

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description"         content={description} />}
      <meta property="og:site_name"  content={SITE_NAME} />
      <meta property="og:type"       content={type} />
      <meta property="og:title"      content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image"      content={ogImage} />
      <meta property="og:url"        content={ogUrl} />
      <meta name="twitter:card"      content="summary_large_image" />
      <meta name="twitter:title"     content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image"     content={ogImage} />
    </>
  )
}
