import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-url-polyfill/auto';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Secure storage for sensitive data
class ExpoSecureStoreAdapter {
  async getItem(key: string) {
    return SecureStore.getItemAsync(key);
  }
  async removeItem(key: string) {
    return SecureStore.deleteItemAsync(key);
  }
  async setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new ExpoSecureStoreAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  business_name?: string;
  website_url?: string;
  industry?: string;
  created_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  type: 'sales' | 'support' | 'appointment' | 'content' | 'workflow' | 'voice';
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowInstance {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'paused';
  execution_count: number;
  created_at: string;
}