export interface Project {
    id: string;
    slug: string;
    title: string;
    tagline: string;
    description: string;
    problemStatement: string;
    techStack: { name: string; justification: string }[];
    systemDesignText: string;
    systemDesignImageUrl: string;
    codeWalkthroughs: {
        title: string;
        language: string;
        explanation: string;
        code: string;
    }[];
    tradeOffs: string;
    futureScope: string;
    createdAt: string;
    publishedAt: string;
}

export const projects: Project[] = [
    {
        id: "1",
        slug: "the-boring-project",
        title: "The Boring Project",
        tagline: "An AI-powered project showcase platform built with Next.js, Supabase, and Gemini AI.",
        description: "A full-stack web application that enables developers to create and share visually appealing project cards with AI-powered features. The platform combines modern web technologies with AI capabilities to automate content generation, code explanation, and image creation, making it easier for developers to showcase their work professionally.",
        problemStatement: "Developers struggle to create compelling project showcases that effectively communicate both the visual appeal and technical depth of their work. Traditional portfolio sites require manual content creation, lack AI assistance for generating descriptions or explaining code, and don't provide real-time collaboration features. Additionally, managing project data, user authentication, and file storage across multiple services adds complexity. I needed a unified platform that handles authentication, database operations, file storage, and AI integration seamlessly while maintaining a clean, modular architecture.",

        techStack: [
            { 
                name: "Next.js 14.2.5 (App Router)", 
                justification: "App Router provides server-side rendering, API routes, and dynamic metadata generation for SEO-optimized project pages. Server components enable efficient data fetching from Supabase without exposing credentials to the client." 
            },
            { 
                name: "TypeScript 5", 
                justification: "Strict typing ensures type safety across the entire application, especially critical for database schemas, API responses, and AI service integrations. Prevents runtime errors in complex data transformations." 
            },
            { 
                name: "Supabase (Postgres + Auth + Storage)", 
                justification: "Unified backend solution providing PostgreSQL database with Row Level Security (RLS) for multi-tenant data isolation, built-in authentication with JWT tokens, and object storage for project images. Eliminates need for separate auth and storage services." 
            },
            { 
                name: "Google Gemini AI API", 
                justification: "Multi-modal AI integration for generating project summaries, explaining code snippets, auto-detecting programming languages, and generating background images using Imagen 4.0. Provides both text (Gemini 2.5 Flash/Pro) and image generation capabilities." 
            },
            { 
                name: "Tailwind CSS 3.4.6", 
                justification: "Utility-first CSS framework enables rapid UI development with consistent design system. Dark theme optimized with custom color palette and animations for modern, responsive interface." 
            },
            { 
                name: "Framer Motion 12.23.24", 
                justification: "Production-ready animation library for smooth page transitions, hover effects, and loading states. Used extensively in landing page, modals, and interactive components." 
            },
            { 
                name: "Prism.js", 
                justification: "Syntax highlighting for code snippets in project cards. Supports multiple languages (JavaScript, Python, TypeScript, JSX, HTML, CSS) with theme customization." 
            },
            { 
                name: "React Context API", 
                justification: "Global state management for authentication state, user profile, and theme preferences. Eliminates prop drilling and provides reactive updates across components." 
            },
        ],

        systemDesignText: `The application follows a three-tier architecture with clear separation of concerns:

**Frontend Layer (Next.js App Router)**
- Client Components: Interactive UI elements (modals, forms, voice companion)
- Server Components: SEO-optimized pages with server-side data fetching
- API Routes: Serverless functions for project data retrieval (/api/projects/[id])
- Layout System: Nested layouts with dynamic metadata generation

**Service Layer (Abstraction)**
- supabaseService.ts: Centralized database operations, authentication, and file uploads
- geminiService.ts: AI service integration with error handling and fallbacks
- Type-safe interfaces ensure consistency between frontend and database schemas

**Backend Layer (Supabase)**
- PostgreSQL Database: Three main tables (projects, notes, profiles) with RLS policies
- Authentication: JWT-based auth with email/password, automatic profile creation via triggers
- Storage: Public bucket for project background images with access policies
- Real-time: Subscriptions for auth state changes and live data updates

**Data Flow Architecture:**
1. User authentication flows through Supabase Auth → Context API → Protected Routes
2. Project CRUD operations: Client → supabaseService → Supabase Postgres (with RLS validation)
3. AI features: Client → geminiService → Gemini API → Response processing → UI update
4. Image uploads: Client → react-easy-crop → Canvas API → Supabase Storage → Public URL

**Security Model:**
- Row Level Security (RLS) ensures users can only access their own projects/notes
- Public project sharing uses separate read-only policy for /projects/[id] routes
- API keys stored in environment variables, never exposed to client
- Image uploads validated for file type and size before processing`,

        systemDesignImageUrl: "",

        codeWalkthroughs: [
            {
                title: "Service Layer Pattern with Type Safety",
                language: "typescript",
                explanation: "The supabaseService abstracts all database operations behind a clean interface. Type mapping between database snake_case columns and TypeScript camelCase properties ensures type safety while maintaining database conventions. RLS policies are enforced at the database level, not application level.",
                code: `// services/supabaseService.ts
export const supabaseService = {
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)  // RLS automatically filters
      .order('created_at', { ascending: false });
    
    // Map database columns to TypeScript interface
    return (data || []).map((row: any) => ({
      id: row.id,
      projectName: row.project_name,  // snake_case → camelCase
      description: row.description,
      // ... type-safe mapping
    }));
  }
}`
            },
            {
                title: "AI Integration with Model Selection",
                language: "typescript",
                explanation: "Different Gemini models are used based on task complexity. Flash (fast, cheap) for simple tasks like language detection, Pro (slower, smarter) for code explanation requiring deeper understanding. Error handling ensures graceful degradation if AI service fails.",
                code: `// services/geminiService.ts
export const explainCode = async (code: string, language: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',  // Pro model for complex reasoning
    contents: \`Explain the following \${language} code...\`
  });
  return response.text;
};

export const detectLanguage = async (code: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',  // Flash for speed
    contents: \`Detect the programming language...\`
  });
  return response.text.trim().toLowerCase();
};`
            },
            {
                title: "Dynamic Metadata Generation for SEO",
                language: "typescript",
                explanation: "Next.js 14's generateMetadata function runs on the server, allowing us to fetch project data and generate SEO-optimized metadata dynamically. This includes Open Graph tags, Twitter Cards, and structured data (JSON-LD) for each project page.",
                code: `// app/projects/[id]/layout.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await supabaseService.getProjectById(params.id);
  
  return {
    title: \`\${project.projectName} | The Boring Project\`,
    description: project.description,
    openGraph: {
      images: [project.backgroundImage],
      // ... dynamic OG tags
    },
  };
}`
            },
            {
                title: "Row Level Security (RLS) Policies",
                language: "sql",
                explanation: "Database-level security ensures users can only access their own data. Public read access is granted for shared project pages, but write operations are restricted to the project owner. This security model is enforced at the database level, not application level.",
                code: `-- supabase_schema.sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only view their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for sharing (separate policy)
CREATE POLICY "Public read access for sharing" ON projects
  FOR SELECT USING (true);  -- Allows public viewing`
            },
            {
                title: "Context-Based Authentication State",
                language: "typescript",
                explanation: "AuthProvider wraps the application and manages authentication state globally. It listens to Supabase auth state changes and automatically syncs user profile data. This pattern eliminates prop drilling and provides reactive updates across all components.",
                code: `// components/AuthProvider.tsx
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut, ... }}>
      {children}
    </AuthContext.Provider>
  );
};`
            },
            {
                title: "Image Processing Pipeline",
                language: "typescript",
                explanation: "Client-side image cropping using react-easy-crop and Canvas API before upload reduces server processing and ensures consistent aspect ratios. Images are cropped to 16:9, compressed to JPEG, and uploaded to Supabase Storage with public URLs for immediate use.",
                code: `// components/CreateCardModal.tsx
const handleConfirmCrop = async () => {
  const blob = await getCroppedImageBlob(localImageSrc, croppedAreaPixels);
  const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
  const uploadedUrl = await uploadImage(croppedFile);
  // Uploads to Supabase Storage bucket 'project-backgrounds'
  // Returns public URL for immediate use in project card`
            }
        ],

        tradeOffs: `**Supabase vs. Custom Backend:**
- ✅ Trade-off: Using Supabase provides rapid development and eliminates backend infrastructure management, but limits customization compared to a custom Node.js/Python backend. RLS policies are powerful but less flexible than application-level authorization.
- ✅ Decision: Chose Supabase for speed of development and built-in features (auth, storage, real-time). The RLS model is sufficient for multi-tenant isolation.

**Client-Side vs. Server-Side Image Processing:**
- ✅ Trade-off: Processing images client-side (cropping, compression) reduces server load but increases bundle size and requires modern browser APIs. Server-side processing would be more reliable but slower and more expensive.
- ✅ Decision: Client-side processing chosen for better UX (instant preview) and cost savings. Fallback to server processing could be added if needed.

**AI Model Selection (Flash vs. Pro):**
- ✅ Trade-off: Using Gemini Flash for simple tasks (language detection) is fast and cheap but less accurate. Pro model for code explanation is slower and more expensive but provides better quality.
- ✅ Decision: Hybrid approach balances cost and quality. Flash for high-frequency operations, Pro for quality-critical features.

**Public Project Sharing:**
- ✅ Trade-off: Public read access to projects enables sharing without authentication but requires careful RLS policy design. Could have used signed URLs or tokens for more security.
- ✅ Decision: Public sharing prioritized for better UX. RLS ensures write operations remain protected.`,

        futureScope: `**Short-term Enhancements:**
1. **Real-time Collaboration**: Add Supabase Realtime subscriptions for collaborative project editing
2. **Advanced Search**: Implement full-text search with PostgreSQL's tsvector for better project discovery
3. **Analytics Dashboard**: Track project views, shares, and engagement metrics
4. **Export Features**: Generate PDF/PNG exports of project cards for offline portfolios
5. **Template System**: Pre-built project card templates for common project types

**Medium-term Improvements:**
1. **Team/Organization Support**: Multi-user projects with role-based permissions
2. **Version History**: Track changes to projects with ability to revert
3. **Comments System**: Allow visitors to comment on shared projects
4. **Project Collections**: Group related projects into collections or portfolios
5. **API Access**: RESTful API for programmatic project management

**Long-term Vision:**
1. **AI Project Suggestions**: Analyze user's projects and suggest improvements or missing information
2. **Integration Marketplace**: Connect with GitHub, GitLab, Figma for automatic project data import
3. **Community Features**: Public project gallery, trending projects, developer profiles
4. **Mobile App**: React Native app for project management on-the-go
5. **Enterprise Features**: White-label solutions for companies to showcase internal projects`,

        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
    }
];
