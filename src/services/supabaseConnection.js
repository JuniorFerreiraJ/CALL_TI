import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares para o banco
export const db = {
    // Coleções
    users: () => supabase.from('users'),
    customers: () => supabase.from('customers'),
    tickets: () => supabase.from('tickets'),

    // Storage
    storage: supabase.storage
}

export default supabase
