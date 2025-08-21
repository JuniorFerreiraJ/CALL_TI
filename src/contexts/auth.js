import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseConnection';

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há usuário logado
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Busca dados adicionais do usuário
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUser({
            uid: user.id,
            email: user.email,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            company: profile.company
          });
        }
      }
      setLoading(false);
    };

    getUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            uid: session.user.id,
            email: session.user.email,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            company: profile.company
          });
        }
      } else {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Tratamento específico para email não confirmado
        if (error.message.includes('Email not confirmed')) {
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

      // Busca dados do usuário
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

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
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