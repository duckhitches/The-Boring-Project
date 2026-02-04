/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../types';
import { generateSummary, explainCode, generateImage, detectLanguage } from '../services/geminiService';
import { uploadImage } from '../services/supabaseService';
import { CloseIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, UploadCloudIcon, ExclamationTriangleIcon, TagIcon, FriendsIcon } from './IconComponents';
import { LoaderOne } from './ui/loader';
import { Button } from './ui/stateful-button';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';

const TECH_TAGS = [
  // Frontend Frameworks/Libraries
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit', 'Gatsby', 'SolidJS', 'jQuery',
  // CSS & UI
  'Tailwind CSS', 'Bootstrap', 'Sass', 'Less', 'CSS Modules', 'Styled Components', 'Emotion', 'Material UI', 'Chakra UI', 'shadcn/ui', 'Ant Design',
  // State Management
  'Redux', 'MobX', 'Zustand', 'Jotai', 'Recoil', 'VueX', 'Pinia',
  // Build Tools & Bundlers
  'Vite', 'Webpack', 'Rollup', 'Parcel', 'esbuild', 'Babel',
  // JavaScript & TypeScript
  'JavaScript', 'TypeScript', 'ES6+',
  // Backend Frameworks
  'Node.js', 'Express.js', 'Koa', 'NestJS', 'Fastify', 'Deno',
  // Backend Languages
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'Go', 'Gin', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Firebase', 'PlanetScale',
  // ORMs
  'Prisma', 'Drizzle', 'TypeORM', 'Sequelize', 'Mongoose',
  // APIs & Data
  'REST API', 'GraphQL', 'Apollo', 'tRPC', 'WebSockets', 'JSON',
  // Authentication
  'OAuth', 'JWT', 'Auth.js', 'Clerk', 'Supabase Auth',
  // Testing
  'Jest', 'Vitest', 'Cypress', 'Playwright', 'React Testing Library', 'Storybook',
  // Deployment & DevOps
  'Docker', 'Vercel', 'Netlify', 'AWS', 'Google Cloud', 'Azure', 'Heroku', 'CI/CD', 'GitHub Actions',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo',
  // Other
  'UI/UX', 'Figma', 'WebRTC', 'Three.js', 'D3.js', 'Framer Motion', 'GSAP', 'AI', 'Gemini API', 'OpenAI'
];


interface CreateCardModalProps {
  projectToEdit?: Project | null;
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


const calculateTimeline = (start: string, end: string): string => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
      return '';
    }

    // Add 1 to make the duration inclusive of both start and end dates.
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 1) return '1 day';

    // For durations less than 45 days, show weeks and days for more precision.
    if (diffDays < 45) {
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;
        
        if (weeks === 0) {
            return `${diffDays} days`;
        }
        
        const weekStr = `${weeks} week${weeks > 1 ? 's' : ''}`;
        if (remainingDays === 0) {
            return weekStr;
        }
        const dayStr = `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        return `${weekStr} and ${dayStr}`;
    }

    // For longer durations, calculate approximate months and years.
    const AVG_DAYS_IN_MONTH = 365.25 / 12;
    const totalMonths = Math.round(diffDays / AVG_DAYS_IN_MONTH);

    if (totalMonths < 12) {
        return `About ${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    const yearStr = `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths === 0) {
        return `About ${yearStr}`;
    }

    const monthStr = `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    return `About ${yearStr} and ${monthStr}`;
};


export const CreateCardModal: React.FC<CreateCardModalProps> = ({ projectToEdit, onClose, onAddProject, onUpdateProject }) => {
  const [formData, setFormData] = useState<Partial<Omit<Project, 'id'>>>({
    projectName: '',
    timeline: '',
    description: '',
    codeSnippet: '',
    codeLanguage: 'javascript',
    screenshots: [],
    githubLink: '',
    liveLink: '',
    contactEmail: '',
    backgroundImage: '',
    tags: []
  });
  const [loadingStates, setLoadingStates] = useState({
    summary: false,
    codeExplanation: false,
    image: false,
    imageUpload: false,
    submit: false,
    languageDetection: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeExplanation, setCodeExplanation] = useState<string | null>(null);
  const [isExplanationVisible, setIsExplanationVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [localImageSrc, setLocalImageSrc] = useState<string | null>(null);
  
  // State for timeline calculation
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDateInvalid, setIsDateInvalid] = useState(false);

  // State for tags
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const isEditMode = !!projectToEdit;
  
  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        projectName: projectToEdit.projectName || '',
        timeline: projectToEdit.timeline || '',
        description: projectToEdit.description || '',
        codeSnippet: projectToEdit.codeSnippet || '',
        codeLanguage: projectToEdit.codeLanguage || 'javascript',
        screenshots: projectToEdit.screenshots || [],
        githubLink: projectToEdit.githubLink || '',
        liveLink: projectToEdit.liveLink || '',
        contactEmail: projectToEdit.contactEmail || '',
        backgroundImage: projectToEdit.backgroundImage || '',
        tags: projectToEdit.tags || []
      });
      setStartDate(projectToEdit.startDate || '');
      setEndDate(projectToEdit.endDate || '');
    }
  }, [projectToEdit]);

  useEffect(() => {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            setIsDateInvalid(true);
            setFormData(prev => ({ ...prev, timeline: ''}));
        } else {
            setIsDateInvalid(false);
            const duration = calculateTimeline(startDate, endDate);
            setFormData(prev => ({ ...prev, timeline: duration }));
        }
    } else {
        setIsDateInvalid(false);
    }
  }, [startDate, endDate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = useCallback((tagToAdd?: string) => {
    const newTag = (tagToAdd || tagInput).trim().replace(/,$/, '');
    if (newTag && !formData.tags?.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag]}));
    }
    setTagInput('');
    setIsSuggestionsVisible(false);
  }, [tagInput, formData.tags]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.trim() === '') {
      setIsSuggestionsVisible(false);
      return;
    }

    const filteredSuggestions = TECH_TAGS.filter(tag => 
        tag.toLowerCase().startsWith(value.toLowerCase()) &&
        !formData.tags?.includes(tag)
    );
    setSuggestions(filteredSuggestions.slice(0, 7)); // Show max 7 suggestions
    setIsSuggestionsVisible(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
          e.preventDefault();
          addTag();
      }
  };

  const handleTagInputBlur = () => {
    // This preserves the original behavior of adding the typed tag when the user clicks away.
    if (tagInput.trim()) {
        addTag();
    }
    // We delay hiding suggestions to allow a click on a suggestion to register first.
    setTimeout(() => {
        setIsSuggestionsVisible(false);
    }, 150);
  };

  const removeTag = (tagToRemove: string) => {
      setFormData(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) }));
  };

  const handleGenerateSummary = async () => {
    const { projectName, timeline, description, codeSnippet } = formData;
    if (!projectName && !description && !codeSnippet) {
      return;
    }
    setLoadingStates(prev => ({ ...prev, summary: true }));
    const prompt = `Project Name: ${projectName}. Timeline: ${timeline}. Current Description/Keywords from user: ${description}. Code Snippet: ${codeSnippet}`;
    const summary = await generateSummary(prompt);
    setFormData(prev => ({ ...prev, description: summary }));
    setLoadingStates(prev => ({ ...prev, summary: false }));
  };

  const handleExplainCode = async () => {
    if (!formData.codeSnippet) return;
    setLoadingStates(prev => ({ ...prev, codeExplanation: true }));
    setCodeExplanation(null); // Clear previous explanation
    const explanation = await explainCode(formData.codeSnippet, formData.codeLanguage || 'javascript');
    setCodeExplanation(explanation);
    setIsExplanationVisible(true); // Automatically show the new explanation
    setLoadingStates(prev => ({ ...prev, codeExplanation: false }));
  };
  
  const handleDetectLanguage = async () => {
    if (!formData.codeSnippet) return;
    setLoadingStates(prev => ({ ...prev, languageDetection: true }));
    const detectedLang = await detectLanguage(formData.codeSnippet);
    const validLanguages = ['javascript', 'python', 'html', 'css', 'jsx', 'typescript'];
    if (validLanguages.includes(detectedLang)) {
      setFormData(prev => ({ ...prev, codeLanguage: detectedLang }));
    }
    setLoadingStates(prev => ({ ...prev, languageDetection: false }));
  };

  // Immediate language detection with debouncing
  useEffect(() => {
    if (!formData.codeSnippet || formData.codeSnippet.length < 10) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const detectedLang = await detectLanguage(formData.codeSnippet);
        const validLanguages = ['javascript', 'python', 'html', 'css', 'jsx', 'typescript'];
        
        if (validLanguages.includes(detectedLang)) {
          setFormData(prev => ({ 
            ...prev, 
            codeLanguage: detectedLang 
          }));
        }
      } catch (error) {
        console.error('Auto language detection failed:', error);
      }
    }, 1500); // 1.5 second delay

    return () => clearTimeout(timeoutId);
  }, [formData.codeSnippet]);

  const handleGenerateBgImage = async () => {
    if (!formData.projectName) return;
    setLoadingStates(prev => ({ ...prev, image: true }));
    
    const baseInfo = formData.description 
        ? `${formData.projectName}: ${formData.description}`
        : formData.projectName;

    const fullPrompt = `A visually stunning, abstract, developer-themed background image for a project card about: "${baseInfo}". Digital art, tech-inspired patterns, cinematic lighting.`;
    
    const imageUrl = await generateImage(fullPrompt);
    if (imageUrl) {
        setFormData(prev => ({ ...prev, backgroundImage: imageUrl }));
    } else {
        setUploadError("AI image generation failed. Please try again.");
    }
    setLoadingStates(prev => ({ ...prev, image: false }));
  };

  const handleFileSelected = useCallback(async (file: File | null) => {
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }
    // Open cropper with a local preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLocalImageSrc(result);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((_: any, areaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function getCroppedImageBlob(imageSrc: string, cropPixels: { x: number; y: number; width: number; height: number }): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.92);
    });
  }

  const handleConfirmCrop = useCallback(async () => {
    if (!localImageSrc || !croppedAreaPixels) return;
    try {
      setLoadingStates(prev => ({ ...prev, imageUpload: true }));
      const blob = await getCroppedImageBlob(localImageSrc, croppedAreaPixels);
      const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      const uploadedUrl = await uploadImage(croppedFile);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, backgroundImage: uploadedUrl }));
        setIsCropping(false);
        setLocalImageSrc(null);
      } else {
        setUploadError('Image upload failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setUploadError('Cropping failed. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, imageUpload: false }));
    }
  }, [localImageSrc, croppedAreaPixels, uploadImage]);

  const handleCancelCrop = useCallback(() => {
    setIsCropping(false);
    setLocalImageSrc(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }, [handleFileSelected]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.contactEmail) {
      alert('Project Name and Contact Email are required.');
      return;
    }
    if (isDateInvalid) {
        alert('Please fix the project dates before submitting.');
        return;
    }
    setLoadingStates(prev => ({...prev, submit: true}));
    setIsSubmitting(true);
    
    const projectData = {
      ...formData,
      startDate,
      endDate,
    };

    // Add delay for the blur disperse effect
    setTimeout(async () => {
        if (isEditMode) {
          await onUpdateProject({ ...projectData, id: projectToEdit.id } as Project);
        } else {
          onAddProject(projectData as Omit<Project, 'id'>);
        }
        onClose();
    }, 800); // Increased delay for better effect
  };

  return (
    <>
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 text-white"
            >
              <LoaderOne />
              <span className="font-mono text-lg tracking-widest uppercase">Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#050505] border border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        >
        {/* Cropper Modal */}
        {isCropping && localImageSrc && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/90" />
            <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-boldonse tracking-wide">Crop Image</h3>
                <button onClick={handleCancelCrop} className="text-white/60 hover:text-white font-mono text-xs uppercase cursor-pointer">Cancel</button>
              </div>
              <div className="relative flex-1 bg-black">
                <Cropper
                  image={localImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16/9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0d0d0d]">
                <div className="flex items-center gap-3 text-white/60 font-mono text-xs">
                  <span>ZOOM</span>
                  <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="accent-indigo-500" />
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleCancelCrop} className="text-white/60 hover:text-white font-mono text-xs uppercase transition-colors">Cancel</button>
                  <button onClick={handleConfirmCrop} className="px-6 py-2 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-white/90 transition-colors">Apply</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0d0d0d]">
          <h2 className="text-2xl font-bold font-boldonse text-white tracking-tight">{isEditMode ? 'UPDATE PROJ.' : 'NEW PROJECT'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors group">
            <CloseIcon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            animate={isSubmitting ? { filter: "blur(5px)", opacity: 0.5 } : { filter: "blur(0px)", opacity: 1 }}
          >
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Project Name</label>
              <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white font-boldonse text-xl focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-white/10" placeholder="ENTER PROJECT NAME" required />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
            </div>
             <div>
              <label htmlFor="endDate" className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">End Date</label>
              <input type="date" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
            </div>

            {(startDate && endDate) && (
                 <div className="md:col-span-2 -mt-4">
                    <p className={`text-[10px] font-mono uppercase tracking-wide mt-1 ${isDateInvalid ? 'text-red-400' : 'text-white/40'}`}>
                        {isDateInvalid ? 'End date cannot be before start date.' : `Duration: `}
                        {!isDateInvalid && formData.timeline && <span className="text-white">{formData.timeline}</span>}
                    </p>
                </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Tags</label>
                <div className="relative">
                    <div className="relative flex items-center bg-[#0d0d0d] border border-white/10 px-4 py-3 focus-within:border-indigo-500 transition-colors">
                        <TagIcon className="w-4 h-4 text-white/30 mr-3"/>
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagKeyDown}
                            onFocus={() => { if (tagInput) setIsSuggestionsVisible(true); }}
                            onBlur={handleTagInputBlur}
                            placeholder="REACT, NEXT.JS..."
                            className="w-full bg-transparent text-white font-mono text-sm placeholder:text-white/10 focus:outline-none uppercase"
                            autoComplete="off"
                        />
                    </div>
                    {isSuggestionsVisible && suggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-black border border-white/10 mt-1 max-h-48 overflow-y-auto shadow-2xl">
                            {suggestions.map(tag => (
                                <li 
                                key={tag} 
                                onMouseDown={() => addTag(tag)}
                                className="px-4 py-2 text-xs font-mono text-white/60 cursor-pointer hover:bg-white/5 hover:text-white uppercase"
                                >
                                {tag}
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
                 {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <div key={tag} className="flex items-center border border-white/10 bg-white/5 text-white/80 text-[10px] font-mono px-3 py-1 uppercase tracking-wider">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-white/30 hover:text-white transition-colors">
                                    <CloseIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                 )}
            </div>


            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors" required placeholder="DEV@EXAMPLE.COM" />
            </div>

            <div className="md:col-span-2 relative">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Description</label>
                    <button type="button" onClick={handleGenerateSummary} disabled={loadingStates.summary} className="flex items-center text-[10px] font-mono text-indigo-300 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-50">
                       {loadingStates.summary ? (
                         <span className="w-3 h-3 mr-1.5 border border-indigo-300 border-t-transparent rounded-full animate-spin" />
                       ) : (
                         <SparklesIcon className="w-3 h-3 mr-1.5" />
                       )}
                       {loadingStates.summary ? 'Generating...' : 'AI Summarize'}
                    </button>
                </div>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors leading-relaxed" placeholder="BRIEF PROJECT SUMMARY..."></textarea>
            </div>
            <div className="md:col-span-2">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Code Snippet</label>
                    <button type="button" onClick={handleExplainCode} disabled={loadingStates.codeExplanation} className="flex items-center text-[10px] font-mono text-indigo-300 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-50">
                        {loadingStates.codeExplanation ? (
                          <span className="w-3 h-3 mr-1.5 border border-indigo-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <SparklesIcon className="w-3 h-3 mr-1.5" />
                        )}
                        {loadingStates.codeExplanation ? 'Analyzing...' : 'AI Explain'}
                    </button>
                 </div>
                <div className="flex items-center bg-[#0d0d0d] border border-white/10 border-b-0 px-2 py-1">
                    <select name="codeLanguage" value={formData.codeLanguage} onChange={handleChange} className="bg-transparent text-white/60 font-mono text-xs uppercase focus:outline-none cursor-pointer">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="jsx">JSX</option>
                        <option value="typescript">TypeScript</option>
                    </select>
                    <div className="h-4 w-px bg-white/10 mx-3"></div>
                     <button 
                        type="button" 
                        onClick={handleDetectLanguage} 
                        disabled={loadingStates.languageDetection || !formData.codeSnippet} 
                        className="flex items-center text-[10px] font-mono text-white/40 hover:text-white uppercase disabled:opacity-50"
                     >
                        {loadingStates.languageDetection ? "DETECTING..." : "AUTO-DETECT"}
                    </button>
                </div>
                <div className="relative bg-[#050505] font-mono text-sm border border-white/10 focus-within:border-indigo-500 transition-colors">
                    <Editor
                        value={formData.codeSnippet || ''}
                        onValueChange={code => setFormData(prev => ({ ...prev, codeSnippet: code }))}
                        highlight={code => {
                            const lang = formData.codeLanguage;
                            if (lang && Prism.languages[lang]) {
                                return Prism.highlight(code, Prism.languages[lang], lang);
                            }
                            return code; 
                        }}
                        padding={16}
                        style={{
                            fontFamily: '"Geist Mono", monospace',
                            fontSize: 13,
                            minHeight: '200px',
                        }}
                        textareaClassName="focus:outline-none"
                    />
                </div>
                 {(loadingStates.codeExplanation || codeExplanation) && (
                    <div className="mt-4 bg-[#0d0d0d] border border-white/10 p-4">
                        {loadingStates.codeExplanation && !codeExplanation && (
                            <div className="flex items-center justify-center py-4">
                                <LoaderOne /> 
                                <span className="ml-3 font-mono text-xs text-white/50 uppercase">ANALYZING...</span>
                            </div>
                        )}
                        {codeExplanation && (
                            <div className="font-mono text-xs text-white/70 leading-relaxed">
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{codeExplanation}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div>
              <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">GitHub Link</label>
              <input type="url" name="githubLink" value={formData.githubLink} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Live/Demo Link</label>
              <input type="url" name="liveLink" value={formData.liveLink} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
            </div>

            <div className="md:col-span-2">
                <label className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">Card Background</label>
                 {uploadError && (
                    <div className="flex items-center p-3 mb-4 text-xs font-mono text-red-400 bg-red-900/10 border border-red-900/30">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        {uploadError}
                    </div>
                  )}
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-grow w-full md:w-auto">
                        {formData.backgroundImage ? (
                            <div className="relative group w-full h-32 md:h-48 border border-white/10 bg-[#0d0d0d]">
                                <Image src={formData.backgroundImage} alt="Background Preview" className="object-cover opacity-80" fill sizes="(max-width: 768px) 100vw, 50vw"/>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => setFormData(p => ({...p, backgroundImage: ''}))} className="px-4 py-2 text-xs font-mono uppercase bg-red-500 text-white tracking-widest hover:bg-red-600">Remove</button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onDrop={handleDrop} 
                                onDragOver={handleDragOver} 
                                onDragLeave={handleDragLeave}
                                className={`relative flex flex-col items-center justify-center w-full h-32 md:h-48 border border-dashed border-white/20 hover:bg-white/5 transition-colors cursor-pointer ${isDragging ? 'bg-white/5 border-indigo-500' : ''}`}
                            >
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileSelected(e.target.files?.[0] || null)} accept="image/*" />
                                {loadingStates.imageUpload ? (
                                    <>
                                        <LoaderOne />
                                        <p className="mt-2 text-xs font-mono text-white/50 uppercase">UPLOADING...</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloudIcon className="w-6 h-6 text-white/30 mb-3"/>
                                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest underline decoration-white/20 underline-offset-4">Upload Image</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                     <button type="button" onClick={handleGenerateBgImage} disabled={loadingStates.image || !formData.projectName} className="flex-shrink-0 flex items-center justify-center px-6 py-3 border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group h-full self-stretch">
                         {loadingStates.image ? <LoaderOne /> : <SparklesIcon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />}
                         <span className="ml-2 font-mono text-xs text-white/70 uppercase group-hover:text-white">AI Generate</span>
                     </button>
                </div>
            </div>

          </motion.div>
        
        </form>
         <div className="p-6 border-t border-white/10 bg-[#0d0d0d] flex justify-end gap-4">
             <button onClick={onClose} className="px-6 py-3 text-xs font-mono uppercase text-white/60 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50">
                 {isSubmitting ? 'SAVING...' : isEditMode ? 'UPDATE PROJECT' : 'CREATE PROJECT'}
             </button>
         </div>
         </motion.div>
      </div>
    </>
  );
};