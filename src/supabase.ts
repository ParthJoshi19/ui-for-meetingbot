import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type for the API keys table
export interface ApiKeyRecord {
  id?: number
  user_address: string
  collection_id: string
  nft_id: string
  api_key: string
  created_at?: string
}

// Function to store API key data
export async function storeApiKey(data: Omit<ApiKeyRecord, 'id' | 'created_at'>) {
  try {
    const { data: result, error } = await supabase
      .from('api_keys')
      .insert([data])
      .select()

    if (error) {
      throw error
    }

    return result
  } catch (error) {
    console.error('Error storing API key:', error)
    throw error
  }
} 