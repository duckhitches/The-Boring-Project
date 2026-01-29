import type { Metadata } from 'next';
import './globals.css';
import 'prismjs/themes/prism-tomorrow.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-boring-project.vercel.app';
const siteName = 'The Boring Project';
const siteDescription = "A creative web app for developers to create and share visually appealing 'project cards' that showcase their coding projects, with AI-powered features for summarization, code explanation, and design.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'developer portfolio',
    'project showcase',
    'coding projects',
    'developer tools',
    'AI code explanation',
    'project cards',
    'developer community',
    'code snippets',
    'tech portfolio',
    'programming projects',
    'Next.js',
    'React',
    'TypeScript',
    'Supabase',
    'Gemini AI',
  ],
  authors: [{ name: 'Eshan Shettennavar' }],
  creator: 'Eshan Shettennavar',
  publisher: 'Eshan Shettennavar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/images/brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'The Boring Project Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/images/brand-logo.png'],
    creator: '@eshan_shettennavar', // Update with actual Twitter handle if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/brand-logo.png',
    apple: '/images/brand-logo.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="canonical" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'The Boring Project',
              url: siteUrl,
              description: siteDescription,
              publisher: {
                '@type': 'Organization',
                name: 'The Boring Project',
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/images/brand-logo.png`,
                },
              },
            }),
          }}
        />
      </head>
      <body className="bg-slate-900 text-slate-100 font-zalando">{children}</body>
    </html>
  )
}
