"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import type { ProjectWithUserInfo } from "../../../types";
import {
  GithubIcon,
  ExternalLinkIcon,
  MailIcon,
} from "../../../components/IconComponents";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import Loading from "../../../components/ui/loader";
import { CardContainer, CardBody } from "../../../components/ui/3d-card";

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectWithUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);

        // Add cache-busting parameter to ensure fresh data
        const response = await fetch(
          `/api/projects/${projectId}?t=${Date.now()}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            setError("Failed to load project");
          }
          return;
        }

        const projectData = await response.json();
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const codeElement = React.useMemo(() => {
    if (!project?.codeSnippet || !project?.codeLanguage) {
      return null;
    }

    const lang = project.codeLanguage;
    const grammar = Prism.languages[lang];
    const className = `language-${project.codeLanguage}`;

    if (grammar) {
      const html = Prism.highlight(project.codeSnippet, grammar, lang);
      return (
        <code
          className={className}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return <code className={className}>{project.codeSnippet}</code>;
  }, [project?.codeSnippet, project?.codeLanguage]);

  if (loading) {
    return (
      <div
        className="min-h-screen py-8 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="text-center">
          <Loading />
          <p className="text-slate-300 text-lg mt-4">Loading Card...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            {error || "The project you are looking for does not exist."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {project.projectName}
          </h1>
          <p className="text-slate-300 text-lg">{project.timeline}</p>
        </div>

        {/* Project Card with 3D tilt */}
        <CardContainer containerClassName="py-0">
          <CardBody className="h-auto w-full">
            <div className="bg-black/80 rounded-2xl overflow-hidden shadow-lg max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
              <div className="relative h-36 sm:h-40 md:h-48 w-full">
                {project.backgroundImage ? (
                  <Image
                    src={project.backgroundImage}
                    alt={`${project.projectName} background`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 320px, 400px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                )}
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {project.projectName}
                  </h2>
                  {project.userInfo && (
                    <p className="text-xs text-slate-300 mt-1">
                      by{" "}
                      {project.userInfo.firstName && project.userInfo.lastName
                        ? `${project.userInfo.firstName} ${project.userInfo.lastName}`
                        : project.userInfo.email?.split("@")[0] ||
                          "Anonymous User"}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-300">
                    {project.timeline}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-5">
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mb-3 sm:mb-4 md:mb-6 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-700 text-indigo-300 text-[10px] sm:text-xs md:text-sm font-medium px-2 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Code Snippet */}
                {project.codeSnippet && (
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-semibold mb-3">
                      Code Snippet
                    </h3>
                    <div className="bg-slate-900/70 rounded-lg max-h-24 sm:max-h-28 overflow-auto border border-slate-700/50 font-mono text-[10px] sm:text-xs text-slate-300">
                      <pre className="!m-0 !p-2 sm:!p-3 !bg-transparent">
                        {codeElement}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400 " />
                      View on GitHub
                    </a>
                  )}
                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400 " />
                      Live Demo
                    </a>
                  )}
                  <a
                    href={`mailto:${project.contactEmail}`}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <MailIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 " />
                    Contact The Dev
                  </a>
                </div>
              </div>
            </div>
          </CardBody>
        </CardContainer>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8">
          <a
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to The Boring Project
          </a>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-700">
            <Image
              src="/images/brand-logo.png"
              alt="User Avatar"
              className="w-full h-full object-cover"
              width={48}
              height={48}
              quality={100}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
