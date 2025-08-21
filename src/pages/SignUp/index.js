import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth'

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const navigate = useNavigate();
  const { signUp, loadingAuth, signed, loading } = useContext(AuthContext);

  useEffect(() => {
    if (signed && !loading) {
      navigate('/dashboard');
    }
  }, [signed, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (name !== '' && email !== '' && password !== '') {
      const result = await signUp(email, password, name, 'Empresa Padrão');

      if (result.success) {
        setMessage(result.message || 'Conta criada com sucesso!');
        setMessageType('success');

        // Limpa os campos
        setName('');
        setEmail('');
        setPassword('');

        // Se não precisar confirmar email, redireciona
        if (result.message && result.message.includes('Verifique seu email')) {
          // Aguarda um pouco e mostra instruções
          setTimeout(() => {
            setMessage('Verifique seu email para confirmar a conta antes de fazer login.');
          }, 2000);
        } else {
          // Redireciona para dashboard se não precisar confirmação
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        setMessage('Erro no cadastro: ' + result.error);
        setMessageType('error');
      }
    } else {
      setMessage('Preencha todos os campos!');
      setMessageType('error');
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema de chamados" />
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          <h1>Criar uma conta</h1>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            autoComplete="new-password"
            name="new-password"
          />

          <button type="submit" disabled={loadingAuth}>
            {loadingAuth ? "Carregando..." : "Cadastrar"}
          </button>
        </form>

        <Link to="/">Já tenho uma conta</Link>
      </div>
    </div>
  )
}