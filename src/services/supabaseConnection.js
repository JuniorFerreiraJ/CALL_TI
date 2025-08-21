import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug das variáveis de ambiente
console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Teste de conectividade básica
export const testConnection = async () => {
    try {
        console.log('🧪 Testando conexão com Supabase...')
        const { error } = await supabase.from('users').select('count').limit(1)

        if (error) {
            console.error('❌ Erro na conexão:', error)
            return false
        }

        console.log('✅ Conexão com Supabase funcionando!')
        return true
    } catch (error) {
        console.error('❌ Falha na conexão:', error)
        return false
    }
}

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
