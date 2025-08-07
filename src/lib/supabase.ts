import { createClient } from '@supabase/supabase-js'
import { WorkoutPreset, PresetStore } from '@/types/presets'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Debug: Check if environment variables are loaded
console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Loaded' : '❌ Missing')

// Create a mock client if environment variables are missing
const createMockClient = () => {
  console.warn('⚠️ Creating mock Supabase client - no environment variables found')
  return {
    from: () => ({
      select: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      upsert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      eq: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      single: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      order: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      limit: () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Supabase not configured' } 
      }),
      signUp: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Supabase not configured' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
    }
  }
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient()

// Database types
export interface DatabasePreset {
  id: string
  name: string
  work_seconds: number
  rest_seconds: number
  total_minutes: number
  exercises: Array<{
    name: string
    duration?: number
  }>
  warm_up_duration?: number
  warm_up_exercises?: Array<{
    name: string
    duration?: number
  }>
  created_at?: string
  updated_at?: string
  user_id?: string
}

export interface DatabasePresetStore {
  id: string
  selected_preset_id: string | null
  created_at?: string
  updated_at?: string
  user_id?: string
}

// Conversion functions
export const convertToDatabase = (preset: WorkoutPreset): Omit<DatabasePreset, 'created_at' | 'updated_at' | 'user_id'> => ({
  id: preset.id,
  name: preset.name,
  work_seconds: preset.workSeconds,
  rest_seconds: preset.restSeconds,
  total_minutes: preset.totalMinutes,
  exercises: preset.exercises,
  warm_up_duration: preset.warmUpDuration,
  warm_up_exercises: preset.warmUpExercises
})

export const convertFromDatabase = (dbPreset: DatabasePreset): WorkoutPreset => ({
  id: dbPreset.id,
  name: dbPreset.name,
  workSeconds: dbPreset.work_seconds,
  restSeconds: dbPreset.rest_seconds,
  totalMinutes: dbPreset.total_minutes,
  exercises: dbPreset.exercises,
  warmUpDuration: dbPreset.warm_up_duration,
  warmUpExercises: dbPreset.warm_up_exercises
})

// Supabase operations
export class SupabasePresetService {
  static async getPresets(): Promise<WorkoutPreset[]> {
    try {
      console.log('🔄 SupabasePresetService.getPresets starting...')
      const { data, error } = await supabase
        .from('workout_presets')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🔄 Supabase select response - data:', data, 'error:', error)

      if (error) {
        console.error('❌ Error fetching presets from Supabase:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return []
      }

      const presets = data?.map(convertFromDatabase) || []
      console.log('✅ Successfully fetched presets:', presets)
      return presets
    } catch (error) {
      console.error('❌ Exception while fetching presets:', error)
      return []
    }
  }

  static async savePreset(preset: WorkoutPreset): Promise<boolean> {
    try {
      console.log('🔄 SupabasePresetService.savePreset starting with preset:', preset)
      const dbPreset = convertToDatabase(preset)
      console.log('🔄 Converted to database format:', dbPreset)
      
      const { data, error } = await supabase
        .from('workout_presets')
        .upsert(dbPreset)
        .select()

      console.log('🔄 Supabase upsert response - data:', data, 'error:', error)

      if (error) {
        console.error('❌ Error saving preset to Supabase:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      console.log('✅ Successfully saved preset to Supabase!')
      return true
    } catch (error) {
      console.error('❌ Exception while saving preset:', error)
      return false
    }
  }

  static async deletePreset(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_presets')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting preset from Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting preset:', error)
      return false
    }
  }

  static async getSelectedPresetId(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('preset_store')
        .select('selected_preset_id')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching selected preset from Supabase:', error)
        return null
      }

      return data?.selected_preset_id || null
    } catch (error) {
      console.error('Error fetching selected preset:', error)
      return null
    }
  }

  static async saveSelectedPresetId(presetId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('preset_store')
        .upsert({ 
          id: 'default', // Single row for the user
          selected_preset_id: presetId 
        })

      if (error) {
        console.error('Error saving selected preset to Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error saving selected preset:', error)
      return false
    }
  }

  static async isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false
    
    try {
      // Simple ping to check if Supabase is reachable
      const { error } = await supabase.from('workout_presets').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }
}
