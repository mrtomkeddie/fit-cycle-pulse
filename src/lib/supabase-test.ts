import { supabase } from '@/lib/supabase';

// Simple connection test function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if client is initialized
    console.log('Supabase client:', supabase);
    
    // Test 2: Simple query to test connection
    const { data, error } = await supabase
      .from('workout_presets')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, data };
    
  } catch (err) {
    console.error('Supabase connection error:', err);
    return { success: false, error: err.message };
  }
};

// Test environment variables
export const testEnvironmentVariables = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:');
  console.log('VITE_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
  
  return { url: !!url, key: !!key };
};
