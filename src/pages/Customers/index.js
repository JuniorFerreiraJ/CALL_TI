import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiUser, FiEdit2, FiTrash2, FiSave, FiX, FiUsers } from 'react-icons/fi'

import { supabase } from '../../services/supabaseConnection'

import { toast } from 'react-toastify'
import './customers.css'

export default function Customers() {
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [originalCnpj, setOriginalCnpj] = useState('')

  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, fantasy_name, cnpj, address')
        .eq('active', true)
        .order('fantasy_name');

      if (error) throw error;
      setLista(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, [])

  async function handleRegister(e) {
    e.preventDefault();

    if (nome !== '' && cnpj !== '' && endereco !== '') {
      try {
        if (editingId) {
          const updateData = {
            name: nome,
            fantasy_name: nome,
            address: endereco,
            updated_at: new Date().toISOString(),
          };
          if (cnpj !== originalCnpj) {
            updateData.cnpj = cnpj;
          }

          const { error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', editingId);

          if (error) throw error;
          toast.success('Empresa atualizada com sucesso!');
        } else {
          const { error } = await supabase
            .from('customers')
            .insert([
              {
                name: nome,
                fantasy_name: nome,
                cnpj: cnpj,
                address: endereco,
                created_at: new Date().toISOString(),
              }
            ]);

          if (error) throw error;
          toast.success('Empresa registrada com sucesso!');
        }

        setNome('');
        setCnpj('');
        setEndereco('');
        setEditingId(null);
        await carregarClientes();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        toast.error(error?.message || "Erro ao salvar empresa.");
      }
    } else {
      toast.error("Preencha todos os campos obrigatórios!");
    }
  }

  async function apagarCliente(id) {
    const ok = window.confirm('Tem certeza que deseja apagar este cliente e todos os chamados relacionados? Esta ação é irreversível.');
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cliente removido com sucesso.');
      setLista(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao apagar cliente:', error);
      toast.error('Não foi possível remover o cliente.');
    }
  }

  function editarCliente(item) {
    setEditingId(item.id)
    setNome(item.fantasy_name)
    setCnpj(item.cnpj)
    setOriginalCnpj(item.cnpj)
    setEndereco(item.address)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setEditingId(null)
    setNome('')
    setCnpj('')
    setOriginalCnpj('')
    setEndereco('')
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name="Gerenciar Clientes">
          <FiUsers size={25} />
        </Title>

        <div className="customers-container">
          {/* Cabeçalho da Página */}
          <div className="page-header">
            <h1>Gestão de Clientes</h1>
            <p>Cadastre e gerencie todas as empresas parceiras</p>
          </div>

          {/* Formulário */}
          <div className="form-container">
            <div className="form-header">
              <h2>
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p>
                {editingId
                  ? 'Atualize as informações do cliente selecionado'
                  : 'Preencha os dados para cadastrar um novo cliente no sistema'
                }
              </p>
            </div>

            <form className="form-profile" onSubmit={handleRegister}>
              <div className="form-group required">
                <label>Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: Empresa ABC Ltda"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  minLength="3"
                  maxLength="100"
                />
                <div className="error-message">Nome fantasia é obrigatório</div>
              </div>

              <div className="form-group required">
                <label>CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                  pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}"
                  title="Formato: XX.XXX.XXX/XXXX-XX"
                />
                <div className="error-message">CNPJ válido é obrigatório</div>
              </div>

              <div className="form-group full-width required">
                <label>Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                  minLength="10"
                  maxLength="200"
                />
                <div className="error-message">Endereço completo é obrigatório</div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FiSave size={18} />
                  {editingId ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </button>

                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelarEdicao}>
                    <FiX size={18} />
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Clientes */}
          <div className="customers-list">
            <h2>
              <FiUsers size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Clientes Ativos ({lista.length})
            </h2>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Carregando clientes...</p>
              </div>
            ) : lista.length === 0 ? (
              <div className="empty">
                <FiUser size={48} />
                <p>Nenhum cliente cadastrado ainda.</p>
                <p>Comece adicionando seu primeiro cliente acima.</p>
              </div>
            ) : (
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Nome Fantasia</th>
                    <th>CNPJ</th>
                    <th>Endereço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Nome Fantasia">
                        <div className="customer-name">{item.fantasy_name}</div>
                      </td>
                      <td data-label="CNPJ">
                        <div className="customer-cnpj">{item.cnpj}</div>
                      </td>
                      <td data-label="Endereço">
                        <div className="customer-address">{item.address}</div>
                      </td>
                      <td data-label="Ações">
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            onClick={() => editarCliente(item)}
                            title="Editar cliente"
                          >
                            <FiEdit2 size={14} />
                            Editar
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => apagarCliente(item.id)}
                            title="Excluir cliente"
                          >
                            <FiTrash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}