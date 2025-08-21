# Sistema de Chamados (React + Supabase)

Aplicação completa de chamados com autenticação, clientes, tickets, agendamento, prioridade, avatar e RLS segura.

## Requisitos
- Node 18+
- Conta no Supabase

## Setup rápido
1) Copie `.env.example` para `.env` e preencha:
```bash
REACT_APP_SUPABASE_URL=... 
REACT_APP_SUPABASE_ANON_KEY=...
```

2) No Supabase, rode o script completo do schema em `supabase_setup.sql` (inclui tabelas, índices, triggers e colunas extras como `scheduled_at`, `active` e `is_admin`).

3) Storage (avatars)
- Crie o bucket `avatars`. Se público, não precisa de policy de SELECT.
- Policies (criar pelo UI ou como owner):
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avatars_insert_auth" ON storage.objects;
CREATE POLICY "avatars_insert_auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND position(auth.uid()::text in name) > 0) WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND position(auth.uid()::text in name) > 0);
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND position(auth.uid()::text in name) > 0);
```

4) Rodar o app
```bash
npm install
npm start
```

## RLS e Perfis
- Tickets restritos por usuário (`user_id = auth.uid()`), e admin vê tudo via `public.is_admin()`.
- Para promover admin:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'email@exemplo.com';
```

## Otimização de desempenho
Crie índices úteis:
```sql
CREATE INDEX IF NOT EXISTS idx_customers_active_fantasy ON customers(active, fantasy_name);
CREATE INDEX IF NOT EXISTS idx_tickets_user_created ON tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_scheduled ON tickets(user_id, scheduled_at);
```

## Scripts úteis
```bash
# Lint e build
npm run build

# Testes (se configurados)
npm test
```

## Estrutura
- `src/pages/Dashboard`: listagem de tickets, modal com edição rápida.
- `src/pages/New`: criação/edição com agendamento, prioridade e validações.
- `src/pages/Customers`: cadastro, edição, exclusão e listagem de clientes ativos.
- `src/pages/Profile`: avatar e dados de perfil.
- `src/contexts/auth.js`: contexto de autenticação e perfil.

## Deploy no GitHub
1) Inicialize o repositório e conecte ao remoto:
```bash
git init
git add .
git commit -m "feat: primeira versão funcional"
git branch -M main
git remote add origin git@github.com:JuniorFerreiraJ/CALL_TI.git
git push -u origin main
```
2) Ative o GitHub Pages (se desejar) ou use um host (Vercel/Netlify) apontando para `npm run build`.
