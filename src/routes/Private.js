import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/auth'

export default function Private({ children }) {
  const { signed, loading } = useContext(AuthContext);

  console.log('Private Route - signed:', signed, 'loading:', loading);

  if (loading) {
    console.log('Private Route - Carregando...');
    return (
      <div></div>
    )
  }

  if (!signed) {
    console.log('Private Route - Não autenticado, redirecionando para login');
    return <Navigate to="/" />
  }

  console.log('Private Route - Autenticado, renderizando conteúdo');
  return children;

}