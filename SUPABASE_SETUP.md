# Workout Timer - Hybrid Storage Setup

This app uses a hybrid storage approach that works offline with localStorage and syncs with Supabase when online.

## 🚀 Quick Setup

### 1. Supabase Project Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL schema**:
   - Go to your Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the script to create tables and security policies

### 2. Environment Configuration

1. **Create `.env.local`** file in project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials** to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Get credentials from Supabase**:
   - Go to Settings → API
   - Copy Project URL and anon/public key

### 3. Switch to Hybrid Storage

Replace the import in components using presets:

```typescript
// Change this:
import { usePresets } from '@/hooks/usePresets'

// To this:
import { usePresets } from '@/hooks/usePresetsHybrid'
```

## 📱 How It Works

### **Offline-First Design**
- ✅ **Works without internet** - All data stored in localStorage
- ✅ **Instant responses** - No waiting for network requests
- ✅ **Automatic fallback** - If Supabase is down, localStorage continues working

### **Smart Syncing**
- 🔄 **Auto-sync when online** - Changes sync automatically when connection is restored
- 🎯 **Conflict resolution** - Local changes take priority over remote changes
- 📊 **Pending changes tracking** - Keeps track of what needs to be synced
- ⚡ **Background sync** - Syncs without blocking the UI

### **Cross-Device Sync**
- 🌐 **Multi-device support** - Presets sync across all your devices
- 👤 **User-specific data** - Each user sees only their own presets (with authentication)
- 🔒 **Secure** - Row-level security ensures data privacy

## 🔧 API Reference

The hybrid hook provides the same interface as the original, plus sync status:

```typescript
const {
  // Original functionality
  presets,
  selectedPreset,
  addPreset,
  updatePreset,
  deletePreset,
  selectPreset,
  
  // Sync status
  isOnline,          // Is device online?
  isSyncing,         // Is sync in progress?
  hasPendingChanges, // Are there unsynced changes?
  lastSyncTime,      // When was last successful sync?
  forcSync          // Manually trigger sync
} = usePresets()
```

## 🛠️ Optional: Authentication

To enable user accounts (optional but recommended):

1. **Enable authentication** in Supabase Dashboard
2. **Add auth to your app**:
   ```typescript
   import { supabase } from '@/lib/supabase'
   
   // Sign up
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password'
   })
   
   // Sign in
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com', 
     password: 'password'
   })
   ```

## 🧪 Testing

### Test Offline Functionality
1. Create/edit presets while online
2. Disconnect internet
3. Create more presets (should work fine)
4. Reconnect internet
5. Changes should sync automatically

### Test Sync Status
```typescript
// Show sync indicator in UI
{isSyncing && <div>Syncing...</div>}
{hasPendingChanges && <div>Changes pending sync</div>}
{!isOnline && <div>Offline mode</div>}
```

## 📋 Migration from localStorage

The hybrid system automatically:
- ✅ Loads existing localStorage data on first run
- ✅ Migrates data to Supabase when online
- ✅ Maintains backward compatibility

No data loss during migration! 🎉
