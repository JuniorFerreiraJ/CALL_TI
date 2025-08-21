import { createContext, useState, useEffect } from 'react';
import { supabase, testConnection } from '../services/supabaseConnection';

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Testa conexão com Supabase primeiro
    const initAuth = async () => {
      try {
        console.log('🚀 Iniciando sistema de autenticação...')

        // Testa conectividade
        const isConnected = await testConnection()
        if (!isConnected) {
          console.error('❌ Não foi possível conectar ao Supabase')
          setLoading(false)
          return
        }

        // Verifica se há usuário logado
        await getUser()
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error)
        setLoading(false)
      }
    }

    // Executa a inicialização
    initAuth()

    // Verifica se há usuário logado
    const getUser = async () => {
      try {
        console.log('🔍 Verificando usuário atual...');
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('❌ Erro ao verificar usuário:', error);
          return;
        }

        if (user) {
          console.log('✅ Usuário encontrado:', user.id);
          // Busca dados adicionais do usuário
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('❌ Erro ao buscar perfil:', profileError);
            return;
          }

          if (profile) {
            console.log('✅ Perfil carregado:', profile.name);
            setUser({
              uid: user.id,
              email: user.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              company: profile.company,
              isAdmin: profile.is_admin
            });
          }
        } else {
          console.log('ℹ️ Nenhum usuário logado');
        }
      } catch (error) {
        console.error('❌ Erro geral ao verificar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Evento de autenticação:', event, session?.user?.id);

      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('❌ Erro ao buscar perfil na mudança de estado:', profileError);
            return;
          }

          if (profile) {
            console.log('✅ Perfil atualizado na mudança de estado:', profile.name);
            setUser({
              uid: session.user.id,
              email: session.user.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              company: profile.company,
              isAdmin: profile.is_admin
            });
          }
        } catch (error) {
          console.error('❌ Erro ao processar mudança de estado:', error);
        }
      } else {
        console.log('ℹ️ Usuário deslogado');
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login
  async function signIn(email, password) {
    setLoadingAuth(true);
    try {
      console.log('🔐 Tentando login para:', email);
      console.log('🌐 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login Supabase:', error);

        // Tratamento específico para email não confirmado
        if (error.message.includes('Email not confirmed')) {
          console.log('📧 Email não confirmado, tentando reenviar...');
          // Tenta reenviar o email de confirmação
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email
          });

          if (resendError) {
            throw new Error(`Email não confirmado. Erro ao reenviar: ${resendError.message}`);
          } else {
            throw new Error('Email não confirmado. Email de confirmação reenviado. Verifique sua caixa de entrada.');
          }
        }
        throw error;
      }

      console.log('✅ Login bem-sucedido:', data.user.id);

      // Busca dados do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil após login:', profileError);
        throw profileError;
      }

      if (profile) {
        console.log('✅ Perfil carregado após login:', profile.name);
        setUser({
          uid: data.user.id,
          email: data.user.email,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          company: profile.company,
          isAdmin: profile.is_admin
        });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro geral no login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoadingAuth(false);
    }
  }

  // Cadastro
  async function signUp(email, password, name, company) {
    setLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            company: company
          }
        }
      });

      if (error) throw error;

      // Se confirmação por e-mail estiver habilitada, não haverá sessão aqui.
      // Nesses casos, o perfil será criado pelo trigger no banco (handle_new_user).
      if (data.session) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              company,
              email
            }
          ]);

        if (profileError) throw profileError;
      }

      // Busca dados criados
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setUser({
          uid: data.user.id,
          email: data.user.email,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          company: profile.company
        });
      }

      return { success: true, message: 'Conta criada com sucesso! Verifique seu email para confirmar.' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: error.message };
    } finally {
      setLoadingAuth(false);
    }
  }

  // Logout
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar perfil
  async function updateProfile(data) {
    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.uid);

      if (error) throw error;

      // Atualiza estado local
      setUser(prev => ({
        ...prev,
        ...data
      }));

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload de avatar
  async function uploadAvatar(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtém URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualiza perfil com nova URL
      await updateProfile({ avatar_url: publicUrl });

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        loadingAuth,
        updateProfile,
        uploadAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;