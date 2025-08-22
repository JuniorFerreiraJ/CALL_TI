import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './signin.css'
import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, loadingAuth } = useContext(AuthContext)

  async function handleSignIn(e) {
    e.preventDefault();
    if (email !== '' && password !== '') {
      console.log('🔐 Tentando fazer login...');
      const result = await signIn(email, password);

      if (result.success) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        // O redirecionamento será feito automaticamente pelas rotas
        // mas mantemos aqui para garantir
        navigate('/dashboard');
      } else {
        console.error('❌ Erro no login:', result.error);
        alert('Erro no login: ' + result.error);
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              name="password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loadingAuth}>
            {loadingAuth ? 'Carregando...' : 'Acessar'}
          </button>
        </form>

        <Link to="/register">Criar uma conta</Link>
      </div>
    </div>
  )
}