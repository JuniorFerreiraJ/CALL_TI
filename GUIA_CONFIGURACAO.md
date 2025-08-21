# 🚀 Guia de Configuração do Supabase

## 📋 Passo a Passo Completo

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project" ou "Sign In"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `sistema-chamados` (ou nome que preferir)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: São Paulo)
7. Clique em "Create new project"
8. Aguarde a configuração (pode demorar alguns minutos)

### 2. Obter Credenciais
1. No painel do projeto, vá para **Settings** (⚙️) no menu lateral
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Configurar Variáveis de Ambiente
1. No seu projeto, renomeie `env_file.txt` para `.env`
2. Edite o arquivo `.env` e substitua pelos valores reais:
```bash
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Executar Script SQL
1. No painel do Supabase, vá para **SQL Editor** no menu lateral
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase_setup.sql`
4. Cole no editor SQL
5. Clique em **Run** (▶️)
6. Aguarde a execução e verifique se não há erros

### 5. Configurar Storage
1. No menu lateral, vá para **Storage**
2. Clique em **Create bucket**
3. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ❌ **DESMARQUE** (deixe privado)
4. Clique em **Create bucket**

### 6. Testar o Sistema
1. No terminal, execute:
```bash
npm start
```
2. Acesse `http://localhost:3000`
3. Teste criar uma conta e fazer login

## 🔍 Verificações Importantes

### ✅ Verificar Tabelas Criadas
No SQL Editor, execute:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```
Deve mostrar: `users`, `customers`, `tickets`

### ✅ Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### ✅ Verificar Bucket Storage
- Vá para Storage no menu lateral
- Deve existir o bucket `avatars`

## 🚨 Solução de Problemas

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon public)
- Certifique-se de que o arquivo `.env` está na pasta `call/`

### Erro: "Table doesn't exist"
- Execute novamente o script SQL
- Verifique se não há erros na execução

### Erro: "Bucket not found"
- Crie o bucket `avatars` manualmente
- Verifique se o nome está exatamente igual

### Erro: "RLS policy violation"
- Verifique se as políticas foram criadas corretamente
- Execute novamente as políticas do script SQL

## 📱 Testando o Sistema

1. **Criar Conta**: Acesse `/register` e crie um usuário
2. **Fazer Login**: Use as credenciais criadas
3. **Dashboard**: Deve carregar sem erros
4. **Cadastrar Cliente**: Vá para `/customers` e teste
5. **Upload Avatar**: No perfil, teste fazer upload de imagem

## 🎯 Próximos Passos

Após a configuração:
1. ✅ Sistema funcionando com Supabase
2. 🔄 Dados persistentes no banco
3. 🔐 Autenticação real
4. 📁 Upload de arquivos funcionando
5. 🚀 Pronto para produção!

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs no painel do Supabase
3. Confirme se todas as etapas foram seguidas
4. Teste com um usuário novo

---

**🎉 Parabéns! Seu sistema está configurado com Supabase!**
