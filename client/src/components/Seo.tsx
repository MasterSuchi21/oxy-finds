import { useEffect } from 'react';

const SITE_URL = 'https://www.kakobuy-oxy.com';

type SeoProps = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string | null;
  structuredData?: unknown;
};

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function Seo({
  title,
  description,
  path,
  noindex = false,
  image,
  structuredData,
}: SeoProps) {
  const canonicalUrl = new URL(path, SITE_URL).toString();
  const structuredDataJson = structuredData
    ? JSON.stringify(structuredData).replace(/</g, '\\u003c')
    : '';

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Oxy Finds');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    } else {
      document.head
        .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
        .forEach((element) => element.remove());
    }

    const oldStructuredData = document.getElementById('page-structured-data');
    oldStructuredData?.remove();
    if (structuredDataJson) {
      const script = document.createElement('script');
      script.id = 'page-structured-data';
      script.type = 'application/ld+json';
      script.textContent = structuredDataJson;
      document.head.appendChild(script);
    }
  }, [canonicalUrl, description, image, noindex, structuredDataJson, title]);

  return null;
}
