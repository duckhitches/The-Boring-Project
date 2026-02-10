/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_VOICE_KEY;

import { Project } from '../types';

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_GEMINI_VOICE_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSummary = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a concise, engaging project summary based on the following details. The summary must be a single paragraph and be between 6 and 10 lines long. Highlight the key features and technologies used. Details: ${prompt}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary. Please try again.";
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the following ${language} code snippet in simple terms. What does it do and how does it work? \n\n\`\`\`${language}\n${code}\n\`\`\``,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining code:", error);
    return "Failed to explain code. Please try again.";
  }
};

export const detectLanguage = async (code: string): Promise<string> => {
  if (!code.trim()) {
    return 'unknown';
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Detect the programming language of the following code snippet. Respond with only the lowercase language name (e.g., 'javascript', 'python', 'jsx'). If you are unsure, respond with 'unknown'.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    });
    // Clean up the response to remove any extra text or markdown
    const detectedLang = response.text.trim().toLowerCase().replace(/`/g, '');
    return detectedLang;
  } catch (error) {
    console.error("Error detecting language:", error);
    return "unknown"; // Return 'unknown' on error
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateProjectBrief = async (notes: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert technical recruiter and portfolio consultant. 
  Your task is to take the following raw notes/bullet points about a software project and convert them into a polished, professional project brief suitable for a developer portfolio.
  
  The output MUST follow this exact structure:
  
  **Overview**
  [A compelling 2-3 sentence paragraph describing what the project is, its purpose, and the core problem it solves. Use professional, action-oriented language.]
  
  **Key Highlights**
  *   [Highlight 1: Focus on a specific technical challenge or architectural decision.]
  *   [Highlight 2: Focus on a key feature or user benefit.]
  *   [Highlight 3: Focus on performance, optimization, or a unique implementation detail.]
  
  Raw Notes:
  ${notes}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating project brief:", error);
    return "Failed to generate project brief. Please try again.";
  }
};

export const generateCareerRoadmap = async (projects: Project[]): Promise<string> => {
  try {
    const projectSummaries = projects.map(p =>
      `- ${p.projectName} (${p.tags?.join(', ') || 'No tags'}): ${p.description.substring(0, 100)}...`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Senior Engineering Manager and Career Coach. 
Analyze the following portfolio of projects and generate a structured career roadmap.

Portfolio:
${projectSummaries}

Your response MUST be a valid JSON object with the following structure (do NOT wrap in markdown code blocks):
{
  "currentLevel": "Junior" | "Mid-Level" | "Senior",
  "strengths": ["string", "string"],
  "gaps": ["string", "string"],
  "recommendedProjects": [
    {
      "title": "string",
      "description": "string",
      "techStack": ["string", "string"],
      "difficulty": "Easy" | "Medium" | "Hard",
      "reason": "Why this project helps fill a gap"
    }
  ],
  "achievementRoadmap": [
    {
      "milestone": "string (e.g., 'Backend Mastery')",
      "status": "Completed" | "In Progress" | "Next Up",
      "description": "string"
    }
  ]
}

Be encouraging but critical about gaps (e.g., if they only have frontend apps, suggest backend/infra).`,
    });

    let text = response.text;
    // Clean up if Gemini adds markdown code blocks despite instructions
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n|\n```/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n|\n```/g, '');
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating career roadmap:", error);
    throw error;
  }
};
