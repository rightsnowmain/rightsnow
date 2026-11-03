import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    authorName?: string;
    section?: string;
    tags?: string[];
  };
  jsonLd?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'සමබිම සහ Rights Now ඓතිහාසික ඩිජිටල් පුවත්පත් ලේඛනාගාරය සහ ප්‍රකාශන වේදිකාව.',
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
  ogType = 'website',
  articleMeta,
  jsonLd,
}) => {
  const siteName = 'සමබිම | Samabima Digital Archive';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(tag);
      }
      tag.content = value;
    };

    // Standard Meta
    setMeta('description', description);

    // Open Graph
    setMeta('og:site_name', siteName, true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', currentUrl, true);
    setMeta('og:image', ogImage, true);

    // Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Article Specific Meta
    if (ogType === 'article' && articleMeta) {
      if (articleMeta.publishedTime) {
        setMeta('article:published_time', articleMeta.publishedTime, true);
      }
      if (articleMeta.modifiedTime) {
        setMeta('article:modified_time', articleMeta.modifiedTime, true);
      }
      if (articleMeta.authorName) {
        setMeta('article:author', articleMeta.authorName, true);
      }
      if (articleMeta.section) {
        setMeta('article:section', articleMeta.section, true);
      }
    }

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // JSON-LD Structured Data
    const scriptId = 'json-ld-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, currentUrl, ogImage, ogType, articleMeta, jsonLd]);

  return null;
};

export default SEO;

