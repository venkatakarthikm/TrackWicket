import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for Track Wicket
 * Provides comprehensive meta tags, structured data, and SEO optimization
 * 
 * @param {string} title - Page title (50-60 chars recommended)
 * @param {string} description - Meta description (150-160 chars recommended)
 * @param {string} keywords - Comma-separated keywords
 * @param {string} canonical - Canonical URL
 * @param {string} ogImage - Open Graph image URL
 * @param {object} structuredData - JSON-LD structured data
 * @param {array} breadcrumbs - Breadcrumb navigation array
 * @param {string} type - Page type (website, article, etc.)
 */

const SEO = ({ 
  title = "Track Wicket - Live Cricket Scores & Rankings",
  description = "Get live cricket scores, ICC rankings, player stats, and match schedules for IPL, World Cup, Test, ODI & T20 matches. Created by Muchu Venkata Karthik.",
  keywords = "Track Wicket, TrackWicket, Muchu Venkata Karthik, live cricket score, cricket rankings, ICC rankings, IPL scores",
  canonical = "https://trackwicket.tech",
  ogImage = "https://trackwicket.tech/twmini.png",
  structuredData = null,
  breadcrumbs = [],
  type = "website"
}) => {
  // Ensure title is within optimal length
  const formattedTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const fullTitle = `${formattedTitle} | Track Wicket`;

  // Base breadcrumbs
  const baseBreadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://trackwicket.tech/"
    },
    ...breadcrumbs
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": baseBreadcrumbs
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Track Wicket" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data - Breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      
      {/* Additional Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Author Attribution */}
      <meta name="author" content="Muchu Venkata Karthik" />
      <meta name="creator" content="Muchu Venkata Karthik" />
    </Helmet>
  );
};

export default SEO;