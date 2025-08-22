import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiSettings } from 'react-icons/fi'
import { AuthContext } from '../../contexts/auth'

import { toast } from 'react-toastify'

import './profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, signOut } = useContext(AuthContext);

  const [nome, setNome] = useState(user && user.name)
  const [email] = useState(user && user.email)

  async function handleSubmit(e) {
    e.preventDefault();

    if (nome !== '') {
      // Atualizar apenas o nome do user
      const result = await updateProfile({
        name: nome
      });

      if (result.success) {
        toast.success("Atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar perfil!");
      }
    }
  }

  // Função para lidar com logout
  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name="Minha conta">
          <FiSettings size={25} />
        </Title>

        <div className="profile-container">

          <form className="form-profile" onSubmit={handleSubmit}>

            <div className="form-header">
              <h2>Meu Perfil</h2>
              <p>Gerencie suas informações pessoais</p>
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="text" value={email} disabled={true} />
            </div>

            <button type="submit">Salvar</button>
          </form>

        </div>

        <div className="profile-container">
          <button className="logout-btn" onClick={handleLogout}>Sair</button>
        </div>

      </div>

    </div>
  )
}