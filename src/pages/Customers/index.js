import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'

import { FiUser } from 'react-icons/fi'

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
          toast.success('Empresa atualizada!');
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
          toast.success('Empresa registrada!');
        }

        setNome('');
        setCnpj('');
        setEndereco('');
        setEditingId(null);
        await carregarClientes();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        toast.error(error?.message || "Erro ao salvar.");
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  }

  async function apagarCliente(id) {
    const ok = window.confirm('Apagar este cliente e todos os chamados relacionados? Esta ação é irreversível.');
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Cliente apagado.');
      setLista(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao apagar cliente:', error);
      toast.error('Não foi possível apagar.');
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
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Nome fantasia</label>
            <input
              type="text"
              placeholder="Nome da empresa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label>CNPJ</label>
            <input
              type="text"
              placeholder="Digite o CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />

            <label>Endereço</label>
            <input
              type="text"
              placeholder="Endereço da empresa"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit">
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
              {editingId && (
                <button type="button" className="action" style={{ backgroundColor: '#6c757d', color: '#fff' }} onClick={cancelarEdicao}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="container customers-list">
          <h2>Clientes ativos</h2>
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : lista.length === 0 ? (
            <div className="empty">Nenhum cliente ativo.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Endereço</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Nome">{item.fantasy_name}</td>
                    <td data-label="CNPJ">{item.cnpj}</td>
                    <td data-label="Endereço">{item.address}</td>
                    <td data-label="#">
                      <button className="action" style={{ backgroundColor: '#f6a935' }} onClick={() => editarCliente(item)}>Editar</button>
                      <button className="action danger" onClick={() => apagarCliente(item.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  )
}