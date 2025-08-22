import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://zglwokmmhhrmukhdhqlt.supabase.co"
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbHdva21taGhybXVraGRocWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjA4ODIsImV4cCI6MjA3MTI5Njg4Mn0.Pl6g465ZIZuWAuTtGiZcxPe3JXdSaoTv-bNFmzHJr3E"

// Debug das variáveis de ambiente
console.log('🔧 Configuração Supabase:')
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')
console.log('🔗 URL completa:', supabaseUrl)
console.log('🔑 Anon Key (primeiros 20 chars):', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'N/A')

// Criação de uma única instância do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

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
