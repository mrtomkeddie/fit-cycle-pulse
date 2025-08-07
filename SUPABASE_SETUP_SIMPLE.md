# Simple Supabase Setup for WorkoutTimer

## Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### 2. Set Up Database Tables
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the script to create the required tables

### 3. Get Your Credentials
1. Go to Settings → API
2. Copy the **Project URL** and **anon/public key**

### 4. Create Environment File
1. Create a `.env.local` file in your project root
2. Add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 5. Test the App
1. Restart your development server
2. The app should now save presets to Supabase

## How It Works

- ✅ **Direct Supabase Integration** - No local storage fallback
- ✅ **Real-time Updates** - Changes sync immediately
- ✅ **User-specific Data** - Each user sees only their presets
- ✅ **Error Handling** - Clear error messages if something goes wrong

## Troubleshooting

If you see "Failed to load presets" errors:
1. Check your environment variables are correct
2. Make sure the database tables were created
3. Check the browser console for detailed error messages

## Next Steps

Once Supabase is working, you can:
- Add real user authentication
- Enable real-time subscriptions
- Add user profiles and settings
