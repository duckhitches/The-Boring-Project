
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../types';
import { generateSummary, explainCode, generateImage, detectLanguage } from '../services/geminiService';
import { uploadImage } from '../services/supabaseService';
import { CloseIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, UploadCloudIcon, ExclamationTriangleIcon, TagIcon, FriendsIcon } from './IconComponents';
import { LoadingSpinner } from './LoadingSpinner';
import { LoaderOne } from './ui/loader';
import { Button } from './ui/stateful-button';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
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
            className="fixed inset-0 bg-green-500/20 backdrop-blur-md flex items-center justify-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
              <span className="font-semibold">Please wait...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Cropper Modal */}
        {isCropping && localImageSrc && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden border border-slate-700">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-white font-semibold">Crop Image</h3>
                <button onClick={handleCancelCrop} className="text-slate-300 hover:text-white px-3 py-1 rounded-md hover:bg-slate-700">Cancel</button>
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
              <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="text-sm">Zoom</span>
                  <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCancelCrop} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
                  <button onClick={handleConfirmCrop} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Apply</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Update Project Card' : 'Create New Project Card'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
            <CloseIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            animate={isSubmitting ? {
              filter: "blur(20px)",
              opacity: 0.3,
              scale: 0.95,
              y: -20
            } : {
              filter: "blur(0px)",
              opacity: 1,
              scale: 1,
              y: 0
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
              <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
              <input type="date" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {(startDate && endDate) && (
                 <div className="md:col-span-2 -mt-4">
                    <p className={`text-xs mt-1 ${isDateInvalid ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                        {isDateInvalid 
                            ? 'End date cannot be before start date.' 
                            : `Calculated Duration: `
                        }
                        {!isDateInvalid && formData.timeline && <span className="font-semibold text-indigo-400">{formData.timeline}</span>}
                    </p>
                </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Tags</label>
                <div className="relative">
                    <div className="relative flex items-center bg-slate-700 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500">
                        <TagIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagKeyDown}
                            onFocus={() => { if (tagInput) setIsSuggestionsVisible(true); }}
                            onBlur={handleTagInputBlur}
                            placeholder="React, Next.js, UI/UX..."
                            className="w-full bg-transparent pl-10 pr-3 py-2 focus:outline-none"
                            autoComplete="off"
                        />
                    </div>
                    {isSuggestionsVisible && suggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-slate-600 border border-slate-500 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {suggestions.map(tag => (
                                <li 
                                key={tag} 
                                onMouseDown={() => addTag(tag)}
                                className="px-4 py-2 text-sm text-slate-200 cursor-pointer hover:bg-indigo-600 hover:text-white"
                                >
                                {tag}
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
                 {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <div key={tag} className="flex items-center bg-indigo-500/20 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 -mr-1 text-indigo-200 hover:text-white">
                                    <CloseIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                 )}
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>

            <div className="md:col-span-2 relative">
                <div className="flex justify-end mb-2">
                    <Button type="button" onClick={handleGenerateSummary} className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700">
                       <FriendsIcon className="w-4 h-4 mr-1.5" />
                       Summarize with AI
                    </Button>
                </div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="A brief summary of your project..."></textarea>
            </div>
            <div className="md:col-span-2 code-editor-wrapper">
                 <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-300">Code Snippet</label>
                    <Button type="button" onClick={handleExplainCode} className="flex items-center px-3 py-1 bg-sky-600 text-white rounded-md text-xs hover:bg-sky-700">
                        <FriendsIcon className="w-4 h-4 mr-1.5" />
                        Explain Code with AI
                    </Button>
                 </div>
                <div className="flex items-center bg-slate-900 border border-slate-600 rounded-t-lg focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <select name="codeLanguage" value={formData.codeLanguage} onChange={handleChange} className="flex-grow bg-transparent pl-3 py-2 text-sm appearance-none focus:outline-none">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="jsx">JSX</option>
                        <option value="typescript">TypeScript</option>
                    </select>
                    {/* Auto-detection indicator */}
                    {formData.codeSnippet && formData.codeSnippet.length >= 10 && (
                      <div className="flex items-center px-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-detecting language..."></div>
                      </div>
                    )}
                     <div className="h-5 w-px bg-slate-700 mx-2"></div>
                     <button 
                        type="button" 
                        onClick={handleDetectLanguage} 
                        disabled={loadingStates.languageDetection || !formData.codeSnippet} 
                        className="flex-shrink-0 flex items-center pr-3 py-1 text-slate-300 rounded-md text-xs hover:text-white disabled:text-slate-500 disabled:cursor-not-allowed"
                     >
                        {loadingStates.languageDetection 
                            ? <LoaderOne /> 
                            : <SparklesIcon className="w-4 h-4 text-purple-400 mr-1" />
                        }
                        Auto-detect
                    </button>
                </div>
                <div className="relative bg-slate-900 font-mono text-sm border-x border-b border-slate-600 rounded-b-lg focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <Editor
                        value={formData.codeSnippet || ''}
                        onValueChange={code => setFormData(prev => ({ ...prev, codeSnippet: code }))}
                        // FIX: Corrected the logic to be type-safe.
                        // The previous cast `as keyof typeof Prism.languages` resulted in a `string | number` type,
                        // causing a mismatch with Prism.highlight's `language` parameter.
                        // This new implementation safely checks for the language and grammar's existence
                        // and ensures a `string` is passed to `highlight`.
                        highlight={code => {
                            const lang = formData.codeLanguage;
                            if (lang && Prism.languages[lang]) {
                                return Prism.highlight(code, Prism.languages[lang], lang);
                            }
                            return code; // return original code if language not found
                        }}
                        padding={12}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            minHeight: '150px',
                        }}
                        placeholder="<Showcase a cool piece of code />"
                    />
                </div>
                 {(loadingStates.codeExplanation || codeExplanation) && (
                    <div className="mt-2 bg-slate-900/70 rounded-lg border border-slate-700 overflow-hidden">
                        {loadingStates.codeExplanation && !codeExplanation && (
                            <div className="p-4 flex items-center justify-center">
                                <LoaderOne /> 
                                <span className="ml-3 text-slate-400">Analyzing code...</span>
                            </div>
                        )}
                        {codeExplanation && (
                            <>
                                <button type="button" onClick={() => setIsExplanationVisible(!isExplanationVisible)} className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-800/50">
                                    <span className="font-semibold text-slate-200">AI Code Explanation</span>
                                    {isExplanationVisible ? <ChevronUpIcon className="w-5 h-5 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                                </button>
                                {isExplanationVisible && (
                                    <div className="p-4 border-t border-slate-700 text-slate-300 text-sm whitespace-pre-wrap">
                                        {codeExplanation}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">GitHub Link</label>
              <input type="url" name="githubLink" value={formData.githubLink} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Live/CodePen Link</label>
              <input type="url" name="liveLink" value={formData.liveLink} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Card Background</label>
                 {uploadError && (
                    <div className="flex items-center p-3 mb-2 text-sm text-red-400 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        {uploadError}
                    </div>
                  )}
                <div className="flex items-start gap-4">
                    <div className="flex-grow">
                        {formData.backgroundImage ? (
                            <div className="relative group w-full h-32">
                                <Image src={formData.backgroundImage} alt="Background Preview" className="object-cover rounded-lg" fill sizes="400px"/>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <button type="button" onClick={() => setFormData(p => ({...p, backgroundImage: ''}))} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Remove</button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onDrop={handleDrop} 
                                onDragOver={handleDragOver} 
                                onDragLeave={handleDragLeave}
                                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors ${isDragging ? 'bg-slate-700/50 border-indigo-500' : ''}`}
                            >
                                {loadingStates.imageUpload ? (
                                    <>
                                        <LoaderOne />
                                        <p className="mt-2 text-sm text-slate-400">Uploading...</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloudIcon className="w-8 h-8 text-slate-500 mb-2"/>
                                        <p className="text-sm text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500">PNG, JPG, GIF (Max 10MB)</p>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    onChange={e => handleFileSelected(e.target.files ? e.target.files[0] : null)}
                                    accept="image/*"
                                    disabled={loadingStates.imageUpload}
                                />
                            </div>
                        )}
                    </div>
                    <div className="relative group flex-shrink-0 self-center flex flex-col items-center gap-2 w-32 text-center">
                        <span className="text-sm text-slate-500">OR</span>
                        <Button type="button" onClick={handleGenerateBgImage} className="w-full flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                            <FriendsIcon className="w-4 h-4 mr-1.5" />
                            AI Generate
                        </Button>
                        { !formData.projectName && !formData.backgroundImage && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap">
                                Enter a project name first
                            </div>
                        )}
                    </div>
                </div>
            </div>

          </motion.div>
        </form>
        <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-white bg-slate-700 rounded-lg mr-4 hover:bg-slate-600">Cancel</button>
            <Button type="submit" onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
              {isEditMode ? "Update Card" : "Create Card"}
            </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateCardModal;