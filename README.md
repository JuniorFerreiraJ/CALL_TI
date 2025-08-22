# 🚀 Call_TI - Sistema de Gestão de Chamados

## 📋 **Descrição do Sistema**

O **Call_TI** é uma aplicação web completa e moderna para gestão de chamados técnicos e atendimento ao cliente. Desenvolvido com foco em usabilidade, segurança e performance, o sistema permite que equipes de TI gerenciem tickets, clientes e agendamentos de forma eficiente e organizada.

### 🎯 **Principais Funcionalidades**
- **Gestão de Chamados**: Criação, edição, visualização e exclusão de tickets
- **Cadastro de Clientes**: Sistema completo de gestão de clientes
- **Agendamento**: Agendamento de atendimentos com data e hora
- **Sistema de Prioridades**: Controle de urgência dos chamados
- **Autenticação Segura**: Login/logout com controle de sessão
- **Perfis de Usuário**: Sistema de administradores e usuários comuns
- **Interface Responsiva**: Design moderno e adaptável a todos os dispositivos

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **React 18+** - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** - Roteamento e navegação entre páginas
- **React Icons** - Biblioteca de ícones (Feather Icons)
- **CSS3** - Estilização moderna com variáveis CSS e animações
- **Responsive Design** - Layout adaptável para mobile, tablet e desktop

### **Backend & Banco de Dados**
- **Supabase** - Plataforma backend-as-a-service
  - **PostgreSQL** - Banco de dados relacional robusto
  - **Row Level Security (RLS)** - Segurança em nível de linha
  - **Storage** - Sistema de arquivos para avatares
  - **Authentication** - Sistema de autenticação integrado

### **Ferramentas de Desenvolvimento**
- **Node.js** - Runtime JavaScript
- **npm** - Gerenciador de pacotes
- **Git** - Controle de versão
- **ES6+** - JavaScript moderno com async/await

### **Bibliotecas e Dependências**
- **date-fns** - Manipulação e formatação de datas
- **react-toastify** - Notificações toast elegantes
- **@supabase/supabase-js** - Cliente oficial do Supabase

---

## 🚀 **Como Executar o Projeto**

### **Pré-requisitos**
- Node.js 18+ instalado
- Conta no Supabase
- Git instalado

### **1. Clone o Repositório**
```bash
git clone https://github.com/JuniorFerreiraJ/CALL_TI.git
cd CALL_TI/call
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure o Supabase**
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Execute o script SQL em `supabase_setup.sql`
- Configure as variáveis de ambiente

### **4. Configure as Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **5. Execute o Projeto**
```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais**
- **`users`** - Usuários do sistema com perfis
- **`customers`** - Cadastro de clientes
- **`tickets`** - Chamados e tickets do sistema
- **`storage.objects`** - Arquivos de avatar (Supabase Storage)

### **Relacionamentos**
- Usuários podem criar múltiplos tickets
- Tickets são vinculados a clientes específicos
- Sistema de RLS garante isolamento de dados por usuário

---

## 🔐 **Sistema de Segurança**

### **Row Level Security (RLS)**
- **Usuários comuns**: Veem apenas seus próprios dados
- **Administradores**: Acesso completo ao sistema
- **Políticas de Storage**: Controle de acesso a arquivos

### **Autenticação**
- Sistema de login/logout seguro
- Sessões persistentes
- Redirecionamento automático baseado em autenticação

---

## 📱 **Funcionalidades por Página**

### **Dashboard** (`/dashboard`)
- Listagem de chamados ativos
- Botão para criar novo chamado
- Ações rápidas (visualizar, editar, excluir)
- Paginação e carregamento infinito

### **Novo Chamado** (`/new`)
- Formulário de criação de tickets
- Seleção de cliente e assunto
- Agendamento de data/hora
- Validações em tempo real

### **Clientes** (`/customers`)
- Cadastro de novos clientes
- Listagem com filtros
- Edição e exclusão
- Status ativo/inativo

### **Perfil** (`/profile`)
- Visualização de dados pessoais
- Edição de informações
- Sistema de logout

---

## 🎨 **Design System**

### **Paleta de Cores**
- **Primária**: Azul (#667eea) e Roxo (#764ba2)
- **Sucesso**: Verde (#28a745) e Verde-água (#20c997)
- **Aviso**: Amarelo (#ffc107) e Laranja (#fd7e14)
- **Perigo**: Vermelho (#e74c3c)

### **Componentes**
- Botões com gradientes e animações
- Cards com sombras e bordas arredondadas
- Formulários com validação visual
- Tabelas responsivas e interativas

---

## 📊 **Performance e Otimizações**

### **Índices de Banco**
```sql
-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_customers_active_fantasy ON customers(active, fantasy_name);
CREATE INDEX IF NOT EXISTS idx_tickets_user_created ON tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_scheduled ON tickets(user_id, scheduled_at);
```

### **Lazy Loading**
- Carregamento sob demanda de chamados
- Paginação inteligente
- Otimização de imagens

---

## 🚀 **Deploy e Produção**

### **Netlify (Recomendado)**
1. Conecte seu repositório GitHub
2. Configure o build command: `npm run build`
3. Configure o publish directory: `build`
4. Configure as variáveis de ambiente

### **Vercel**
1. Importe o projeto do GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### **GitHub Pages**
1. Ative o GitHub Pages no repositório
2. Configure o branch `gh-pages`
3. Configure as variáveis de ambiente

---

## 🔧 **Scripts Disponíveis**

```bash
# Desenvolvimento
npm start          # Inicia o servidor de desenvolvimento
npm run build      # Cria build de produção
npm run eject      # Eject do Create React App (irreversível)

# Qualidade de Código
npm run lint       # Executa o ESLint
npm test           # Executa os testes
```

---

## 📁 **Estrutura do Projeto**

```
call/
├── public/                 # Arquivos públicos
│   ├── index.html         # HTML principal
│   ├── favicon.svg        # Favicon personalizado
│   └── manifest.json      # Manifesto PWA
├── src/                   # Código fonte
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Header/        # Cabeçalho da aplicação
│   │   ├── Modal/         # Modal de detalhes
│   │   └── Title/         # Componente de título
│   ├── contexts/          # Contextos React
│   │   └── auth.js        # Contexto de autenticação
│   ├── pages/             # Páginas da aplicação
│   │   ├── Dashboard/     # Página principal
│   │   ├── New/           # Criação de chamados
│   │   ├── Customers/     # Gestão de clientes
│   │   ├── Profile/       # Perfil do usuário
│   │   ├── SignIn/        # Login
│   │   └── SignUp/        # Cadastro
│   ├── routes/            # Configuração de rotas
│   ├── services/          # Serviços externos
│   │   └── supabaseConnection.js  # Conexão com Supabase
│   └── index.js           # Ponto de entrada
├── package.json           # Dependências e scripts
└── README.md              # Este arquivo
```

---

## 🤝 **Contribuição**

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 **Suporte**

- **Issues**: [GitHub Issues](https://github.com/JuniorFerreiraJ/CALL_TI/issues)
- **Documentação**: Este README
- **Contato**: Através do GitHub

---

## 🎉 **Agradecimentos**

- **Supabase** pela plataforma backend robusta
- **React** pela biblioteca de interface
- **Comunidade open source** pelos recursos utilizados

---

**Desenvolvido com ❤️ para facilitar a gestão de chamados técnicos**
