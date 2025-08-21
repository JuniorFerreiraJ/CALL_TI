import { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiUser, FiLogOut, FiUsers, FiPlusCircle } from 'react-icons/fi'
import { AuthContext } from '../../contexts/auth'
import './header.css'

export default function Header() {
  const { user, signOut } = useContext(AuthContext)
  const [avatarError, setAvatarError] = useState(false)

  function getInitials(fullName) {
    if (!fullName || typeof fullName !== 'string') return '?'
    const parts = fullName.trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return `${first}${last}`.toUpperCase()
  }

  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {user.avatarUrl && !avatarError ? (
          <img src={user.avatarUrl} alt="Foto do usuário" onError={() => setAvatarError(true)} />
        ) : (
          <div className="avatar-fallback" aria-label={`Avatar de ${user.name}`}>
            {getInitials(user.name)}
          </div>
        )}
        <span className="user-name">Bem-vindo(a), {user.name}
          {user.isAdmin && <em className="admin-badge">Admin</em>}
        </span>
      </div>

      <nav className="menu">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiHome color="#FFF" size={24} />
          Chamados
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiUsers color="#FFF" size={24} />
          Clientes
        </NavLink>
        <NavLink to="/new" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiPlusCircle color="#FFF" size={24} />
          Novo chamado
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <FiUser color="#FFF" size={24} />
          Perfil
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={signOut}>
        <FiLogOut color="#FFF" size={24} />
        Sair
      </button>
    </div>
  )
}