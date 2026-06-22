import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://regmqdqagrblzeltzefp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZ21xZHFhZ3JibHplbHR6ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjIzOTAsImV4cCI6MjA5NjIzODM5MH0.7v7jkQpJ6GkATxh-mhURkj4rzjSpkjND__d6CH3mLn4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});