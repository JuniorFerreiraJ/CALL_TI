import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiSettings, FiUpload } from 'react-icons/fi'
import avatar from '../../assets/avatar.png'
import { AuthContext } from '../../contexts/auth'



import { toast } from 'react-toastify'

import './profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar, signOut } = useContext(AuthContext);

  const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
  const [imageAvatar, setImageAvatar] = useState(null);

  const [nome, setNome] = useState(user && user.name)
  const [email] = useState(user && user.email)

  function handleFile(e) {
    if (e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        setImageAvatar(image)
        setAvatarUrl(URL.createObjectURL(image))
      } else {
        alert("Envie uma imagem do tipo PNG ou JPEG")
        setImageAvatar(null);
        return;
      }


    }
  }


  async function handleUpload() {
    try {
      const result = await uploadAvatar(imageAvatar);

      if (result.success) {
        const updateResult = await updateProfile({
          name: nome,
          avatar_url: result.url
        });

        if (updateResult.success) {
          toast.success("Atualizado com sucesso!");
        } else {
          toast.error("Erro ao atualizar perfil!");
        }
      } else {
        toast.error("Erro ao fazer upload da imagem!");
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error("Erro ao fazer upload da imagem!");
    }
  }



  async function handleSubmit(e) {
    e.preventDefault();

    if (imageAvatar === null && nome !== '') {
      // Atualizar apenas o nome do user
      const result = await updateProfile({
        name: nome
      });

      if (result.success) {
        toast.success("Atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar perfil!");
      }
    } else if (nome !== '' && imageAvatar !== null) {
      // Atualizar tanto nome quanto a foto
      handleUpload();
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
            <label className="label-avatar">
              <span>
                <FiUpload color="#FFF" size={25} />
              </span>

              <input type="file" accept="image/*" onChange={handleFile} /> <br />
              {avatarUrl === null ? (
                <img src={avatar} alt="Foto de perfil" width={250} height={250} />
              ) : (
                <img src={avatarUrl} alt="Foto de perfil" width={250} height={250} />
              )}

            </label>

            <label>Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

            <label>Email</label>
            <input type="text" value={email} disabled={true} />

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