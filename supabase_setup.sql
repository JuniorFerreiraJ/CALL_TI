-- =====================================================
-- CONFIGURAÇÃO SIMPLIFICADA DO SUPABASE PARA SISTEMA DE CHAMADOS
-- (SEM SEGURANÇA RLS PARA TESTES INICIAIS)
-- =====================================================

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT DEFAULT 'Empresa Padrão',
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CRIAR TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fantasy_name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CRIAR TABELA DE TICKETS/CHAMADOS
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Progresso', 'Atendido', 'Fechado')),
  priority TEXT DEFAULT 'Baixa' CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRIAR TRIGGERS PARA ATUALIZAR TIMESTAMP
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_cnpj ON customers(cnpj);

-- 6.1. ADICIONAR COLUNA DE AGENDAMENTO (CASO AINDA NAO EXISTA)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_scheduled_at ON tickets(scheduled_at);

-- 6.2. ADICIONAR COLUNA DE ATIVO PARA CLIENTES
ALTER TABLE customers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);
-- Backfill clientes existentes
UPDATE customers SET active = TRUE WHERE active IS NULL;

-- 7. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- Cliente de exemplo para testes
INSERT INTO customers (name, fantasy_name, cnpj, address) VALUES
('Empresa Exemplo LTDA', 'Empresa Exemplo', '12.345.678/0001-90', 'Rua Exemplo, 123 - São Paulo/SP')
ON CONFLICT (cnpj) DO NOTHING;

-- 8. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- Listar todas as tabelas
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Listar todas as funções
SELECT 'Funções criadas:' as info;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Listar todos os triggers
SELECT 'Triggers criados:' as info;
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Listar todos os índices
SELECT 'Índices criados:' as info;
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public';

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute este script no Editor SQL do Supabase
-- 2. Vá para Storage e crie o bucket 'avatars' (privado)
-- 3. Teste o sistema criando usuários pelo frontend
-- 4. Não há restrições de segurança - todos podem acessar tudo
-- =====================================================
