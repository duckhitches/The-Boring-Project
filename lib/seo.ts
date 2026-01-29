import type { Project } from '../types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-boring-project.vercel.app';

export function generateProjectStructuredData(project: Project, projectId: string) {
  const projectUrl = `${siteUrl}/projects/${projectId}`;
  const authorName = project.userInfo?.firstName && project.userInfo?.lastName
    ? `${project.userInfo.firstName} ${project.userInfo.lastName}`
    : project.userInfo?.email?.split('@')[0] || 'Anonymous Developer';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.projectName,
    description: project.description,
    url: project.liveLink || project.githubLink || projectUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: authorName,
      email: project.contactEmail,
    },
    datePublished: project.startDate || new Date().toISOString(),
    dateModified: project.endDate || new Date().toISOString(),
    keywords: project.tags?.join(', ') || '',
    codeRepository: project.githubLink,
    screenshot: project.backgroundImage || `${siteUrl}/images/brand-logo.png`,
    ...(project.codeSnippet && {
      codeSampleType: project.codeLanguage,
      programmingLanguage: project.codeLanguage,
    }),
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Boring Project',
    url: siteUrl,
    logo: `${siteUrl}/images/brand-logo.png`,
    description: 'A creative web app for developers to create and share visually appealing project cards with AI-powered features.',
    sameAs: [
      'https://github.com/duckhitches',
      'https://www.linkedin.com/in/eshan-shettennavar/',
    ],
    founder: {
      '@type': 'Person',
      name: 'Eshan Shettennavar',
      url: 'https://portfolio-eshan-2z6t.vercel.app/',
    },
  };
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Boring Project',
    url: siteUrl,
    description: 'A creative web app for developers to create and share visually appealing project cards.',
    publisher: {
      '@type': 'Organization',
      name: 'The Boring Project',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
