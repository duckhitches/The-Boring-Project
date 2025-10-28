
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`



# The ImagenAI used in my Creat Card is for billed users only, and since I'm not billed used the image generation is not possible.

# for better supabase security I can add -- More secure: Only allow reading profiles of users with public projects
<!-- CREATE POLICY "Can view profiles of users with projects" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.user_id = profiles.id
  )
); -->

