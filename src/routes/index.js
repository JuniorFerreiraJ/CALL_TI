import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/auth'

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Customers from '../pages/Customers'
import New from '../pages/New'

import Private from './Private'

// Componente para redirecionar usuários autenticados
function AuthenticatedRedirect({ children }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (signed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RoutesApp() {
  return (
    <Routes>
      {/* Rotas públicas - redirecionam para dashboard se já autenticado */}
      <Route path="/" element={
        <AuthenticatedRedirect>
          <SignIn />
        </AuthenticatedRedirect>
      } />
      <Route path="/register" element={
        <AuthenticatedRedirect>
          <SignUp />
        </AuthenticatedRedirect>
      } />

      {/* Rotas privadas */}
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />
      <Route path="/customers" element={<Private><Customers /></Private>} />
      <Route path="/new" element={<Private><New /></Private>} />
      <Route path="/new/:id" element={<Private><New /></Private>} />

      {/* Rota padrão - redireciona para dashboard se autenticado, senão para login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default RoutesApp;
