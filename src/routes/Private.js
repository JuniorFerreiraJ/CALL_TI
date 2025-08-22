import { useContext, useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/auth'

export default function Private({ children }) {
  const { signed, loading } = useContext(AuthContext);
  const [showRetry, setShowRetry] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Mostra botão de retry após 10 segundos
    const retryTimer = setTimeout(() => {
      setShowRetry(true);
    }, 10000);

    return () => clearTimeout(retryTimer);
  }, []);

  console.log('🔒 Private Route - signed:', signed, 'loading:', loading, 'path:', location.pathname);

  if (loading) {
    console.log('⏳ Private Route - Carregando...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Carregando...</p>
        <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>Verificando autenticação...</p>

        {showRetry && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#e74c3c', fontSize: '14px', margin: '0 0 15px 0' }}>
              ⚠️ Demorando mais que o esperado
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Tentar Novamente
            </button>
            <p style={{ color: '#999', fontSize: '12px', margin: '10px 0 0 0' }}>
              Problema temporário do Supabase
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!signed) {
    console.log('❌ Private Route - Não autenticado, redirecionando para login');
    // Redireciona para login com o path atual para voltar após login
    return <Navigate to="/" state={{ from: location }} replace />
  }

  console.log('✅ Private Route - Autenticado, renderizando conteúdo');
  return children;
}