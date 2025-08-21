import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './signin.css'
import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth'

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { signIn, loadingAuth, signed, loading } = useContext(AuthContext)

  // Debug do estado
  console.log('🔍 SignIn - Estado atual:', { signed, loading, loadingAuth });

  useEffect(() => {
    console.log('🔄 SignIn useEffect - signed:', signed, 'loading:', loading);
    if (signed && !loading) {
      console.log('✅ Usuário autenticado, redirecionando para dashboard');
      navigate('/dashboard');
    }
  }, [signed, loading, navigate]);

  async function handleSignIn(e) {
    e.preventDefault();
    if (email !== '' && password !== '') {
      console.log('🔐 Tentando fazer login...');
      const result = await signIn(email, password);

      if (result.success) {
        console.log('✅ Login bem-sucedido');
        navigate('/dashboard');
      } else {
        console.error('❌ Erro no login:', result.error);
        alert('Erro no login: ' + result.error);
      }
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Sistema Logo" />
        </div>

        <form onSubmit={handleSignIn} autoComplete="on">
          <h1>Entrar</h1>
          <input
            type="email"
            placeholder="email@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            name="email"
            inputMode="email"
          />
          <input
            type="password"
            placeholder="*******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            name="password"
          />
          <button type="submit" disabled={loadingAuth}>
            {loadingAuth ? 'Carregando...' : 'Acessar'}
          </button>
        </form>

        <Link to="/register">Criar uma conta</Link>
      </div>
    </div>
  )
}