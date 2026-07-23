import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/invite/'],
    },
    sitemap: 'https://flowdesk.app/sitemap.xml',
  };
}
