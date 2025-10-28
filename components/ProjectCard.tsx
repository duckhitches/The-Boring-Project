"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '../types';
import { GithubIcon, ExternalLinkIcon, MailIcon, TrashIcon, PencilIcon } from './IconComponents';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onEdit, onDelete }) => {
  const [shareText, setShareText] = useState('Share');

  const handleShareClick = useCallback(async () => {
    const shareUrl = `${window.location.origin}/projects/${project.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000); // Revert after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setShareText('Failed!');
       setTimeout(() => setShareText('Share'), 2000);
    }
  }, [project.id]);

  const codeElement = useMemo(() => {
    if (!project.codeSnippet || !project.codeLanguage) {
      return null;
    }
    // FIX: Removed `as keyof typeof Prism.languages` cast.
    // `keyof { [key: string]: any }` resolves to `string | number` in TypeScript,
    // which caused a type mismatch with Prism.highlight's `language` parameter (which expects `string`).
    // `project.codeLanguage` is guaranteed to be a string here, so the cast was incorrect.
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
    // Fallback for unsupported language: just render the text
    return <code className={className}>{project.codeSnippet}</code>;
  }, [project.codeSnippet, project.codeLanguage]);


  return (
    <div className="bg-black/40 rounded-2xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group">
      <div className="relative h-48 w-full">
        {project.backgroundImage ? (
           <Image src={project.backgroundImage} alt={`${project.projectName} background`} className="object-cover" fill sizes="400px"/>
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
        )}
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-bold text-white">{project.projectName}</h2>
          {project.userInfo && (
            <p className="text-xs text-slate-300 mt-1">
              by {project.userInfo.firstName && project.userInfo.lastName 
                ? `${project.userInfo.firstName} ${project.userInfo.lastName}`
                : project.userInfo.email?.split('@')[0] || 'Anonymous User'
              }
            </p>
          )}
          <p className="text-sm text-slate-300">{project.timeline}</p>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
         {project.tags && project.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className="bg-slate-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-slate-300 text-sm mb-4 flex-grow">
          {project.description}
        </p>
        
        {project.codeSnippet && (
           <div className="mb-4">
            <div className="bg-slate-900/70 rounded-lg max-h-28 overflow-auto border border-slate-700/50 font-mono text-xs text-slate-300">
                <pre className={`!m-0 !p-3 !bg-transparent`}>
                    {codeElement}
                </pre>
            </div>
          </div>
        )}

      </div>
       <div className="px-5 pb-5 mt-auto flex justify-between items-center border-t border-slate-700/50 pt-4">
          <div className="flex items-center space-x-3">
             {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors">
                <GithubIcon className="w-6 h-6" />
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-400 transition-colors">
                <ExternalLinkIcon className="w-6 h-6" />
              </a>
            )}
            <a href={`mailto:${project.contactEmail}`} className="text-slate-400 hover:text-blue-400 transition-colors">
              <MailIcon className="w-6 h-6" />
            </a>
            {onEdit && (
                <button onClick={() => onEdit(project.id)} className="text-slate-400 hover:text-yellow-400 transition-colors flex items-center justify-center">
                    <PencilIcon className="w-6 h-6"/>
                </button>
            )}
            {onDelete && (
                <button onClick={() => onDelete(project.id)} className="text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center">
                    <TrashIcon className="w-6 h-6"/>
                </button>
            )}
          </div>
          <button 
            onClick={handleShareClick}
            disabled={shareText === 'Copied!'}
            className="px-4 py-2 w-20 text-center text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors font-semibold disabled:bg-green-500 disabled:cursor-not-allowed"
          >
            {shareText}
          </button>
        </div>
    </div>
  );
});