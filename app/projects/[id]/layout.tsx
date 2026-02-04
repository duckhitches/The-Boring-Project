/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

import { Metadata } from 'next';
import { supabaseService } from '../../../services/supabaseService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-boring-project.vercel.app';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const project = await supabaseService.getProjectById(params.id);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The project you are looking for does not exist.',
    };
  }

  const projectUrl = `${siteUrl}/projects/${params.id}`;
  const projectTitle = `${project.projectName} | The Boring Project`;
  const projectDescription = project.description || `Check out ${project.projectName} - ${project.timeline}`;
  const projectImage = project.backgroundImage || `${siteUrl}/images/brand-logo.png`;
  
  const authorName = project.userInfo?.firstName && project.userInfo?.lastName
    ? `${project.userInfo.firstName} ${project.userInfo.lastName}`
    : project.userInfo?.email?.split('@')[0] || 'Anonymous Developer';

  return {
    title: projectTitle,
    description: projectDescription,
    keywords: [
      ...(project.tags || []),
      'developer project',
      'coding showcase',
      'programming',
      'tech project',
    ],
    openGraph: {
      title: projectTitle,
      description: projectDescription,
      url: projectUrl,
      siteName: 'The Boring Project',
      images: [
        {
          url: projectImage,
          width: 1200,
          height: 630,
          alt: `${project.projectName} - Project Card`,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: projectTitle,
      description: projectDescription,
      images: [projectImage],
    },
    alternates: {
      canonical: projectUrl,
    },
    other: {
      'article:author': authorName,
      'article:published_time': project.startDate || new Date().toISOString(),
    },
  };
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
