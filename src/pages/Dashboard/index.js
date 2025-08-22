import { useEffect, useState } from 'react'

import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi'

import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Modal from '../../components/Modal'
import { supabase } from '../../services/supabaseConnection'
import { toast } from 'react-toastify'

import './dashboard.css'

export default function Dashboard() {

  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true);

  const [isEmpty, setIsEmpty] = useState(false)
  const [lastDocs, setLastDocs] = useState()
  const [loadingMore, setLoadingMore] = useState(false);

  const [showPostModal, setShowPostModal] = useState(false);
  const [detail, setDetail] = useState()


  useEffect(() => {
    async function loadChamados() {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          const lista = data.map(item => ({
            id: item.id,
            assunto: item.subject,
            cliente: item.customer_name,
            clienteId: item.customer_id,
            created: item.created_at,
            createdFormat: format(new Date(item.created_at), 'dd/MM/yyyy'),
            scheduled: item.scheduled_at,
            scheduledFormat: item.scheduled_at ? format(new Date(item.scheduled_at), 'dd/MM/yyyy HH:mm') : null,
            status: item.status,
            complemento: item.description,
          }));

          setChamados(lista);
          setLastDocs(data[data.length - 1]);
        } else {
          setIsEmpty(true);
        }
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChamados();
  }, [])


  async function updateState(data) {
    if (data && data.length > 0) {
      const lista = data.map(item => ({
        id: item.id,
        assunto: item.subject,
        cliente: item.customer_name,
        clienteId: item.customer_id,
        created: item.created_at,
        createdFormat: format(new Date(item.created_at), 'dd/MM/yyyy'),
        scheduled: item.scheduled_at,
        scheduledFormat: item.scheduled_at ? format(new Date(item.scheduled_at), 'dd/MM/yyyy HH:mm') : null,
        status: item.status,
        complemento: item.description,
      }));

      setChamados(chamados => [...chamados, ...lista]);
      setLastDocs(data[data.length - 1]);
    } else {
      setIsEmpty(true);
    }

    setLoadingMore(false);
  }


  async function handleMore() {
    setLoadingMore(true);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .lt('created_at', lastDocs.created_at)
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        await updateState(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mais chamados:', error);
    }
  }


  function toggleModal(item) {
    setShowPostModal(!showPostModal)
    setDetail(item)
  }

  function handleUpdated(updated) {
    setChamados(prev => prev.map(c => c.id === updated.id ? { ...c, status: updated.status, priority: updated.priority } : c))
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este chamado?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChamados(prev => prev.filter(item => item.id !== id));
      toast.success('Chamado excluído.');
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
      toast.error('Não foi possível excluir o chamado.');
    }
  }


  if (loading) {
    return (
      <div>
        <Header />

        <div className="content">
          <Title name="Tickets">
            <FiMessageSquare size={25} />
          </Title>

          <div className="dashboard">
            <div className="calls-list">
              <h2>
                <FiMessageSquare size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Carregando Chamados
              </h2>
              <div className="loading">
                <div className="spinner"></div>
                <p>Buscando chamados...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name="Tickets">
          <FiMessageSquare size={25} />
        </Title>

        <div className="dashboard">
          <>
            {chamados.length === 0 ? (
              <div className="calls-list">
                <h2>
                  <FiMessageSquare size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Nenhum Chamado Encontrado
                </h2>
                <div className="empty">
                  <FiMessageSquare size={48} />
                  <p>Nenhum chamado encontrado ainda.</p>
                  <p>Comece criando seu primeiro chamado.</p>
                </div>
                <Link to="/new" className="new">
                  <FiPlus color="#FFF" size={25} />
                  Novo chamado
                </Link>
              </div>
            ) : (
              <>
                <Link to="/new" className="new">
                  <FiPlus color="#FFF" size={25} />
                  Novo chamado
                </Link>

                <div className="calls-list">
                  <h2>

                    Chamados Ativos ({chamados.length})
                  </h2>

                  <table className="calls-table">
                    <thead>
                      <tr>
                        <th scope="col">Cliente</th>
                        <th scope="col">Assunto</th>
                        <th scope="col">Status</th>
                        <th scope="col">Data de Criação</th>
                        <th scope="col">Data Agendada</th>
                        <th scope="col">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chamados.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td data-label="Cliente">
                              <div className="call-customer">{item.cliente}</div>
                            </td>
                            <td data-label="Assunto">
                              <div className="call-title">{item.assunto}</div>
                            </td>
                            <td data-label="Status">
                              <span className={`badge badge-${item.status === 'Aberto' ? 'success' : 'warning'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td data-label="Data de Criação">
                              <div className="call-date">{item.createdFormat}</div>
                            </td>
                            <td data-label="Data Agendada">
                              <div className="call-date">{item.scheduledFormat || '-'}</div>
                            </td>
                            <td data-label="Ações">
                              <div className="action-buttons">
                                <button
                                  className="action-btn view"
                                  onClick={() => toggleModal(item)}
                                  title="Visualizar detalhes"
                                >
                                  <FiSearch size={14} />
                                  Ver
                                </button>
                                <Link
                                  to={`/new/${item.id}`}
                                  className="action-btn edit"
                                  title="Editar chamado"
                                >
                                  <FiEdit2 size={14} />
                                  Editar
                                </Link>
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDelete(item.id)}
                                  title="Excluir chamado"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {loadingMore && (
                    <div className="loading">
                      <div className="spinner"></div>
                      <p>Buscando mais chamados...</p>
                    </div>
                  )}

                  {!loadingMore && !isEmpty && (
                    <button className="btn-more" onClick={handleMore}>
                      <FiSearch size={18} />
                      Carregar Mais Chamados
                    </button>
                  )}
                </div>
              </>
            )}
          </>

        </div>
      </div>

      {showPostModal && (
        <Modal
          conteudo={detail}
          close={() => setShowPostModal(!showPostModal)}
          onUpdated={handleUpdated}
        />
      )}

    </div>
  )
}