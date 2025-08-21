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

          <div className="container dashboard">
            <span>Buscando chamados...</span>
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

        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado encontrado...</span>
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

              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cadastrando em</th>
                    <th scope="col">#</th>
                    <th scope="col">Agendado</th>
                    <th scope="col">#</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td data-label="Cliente">{item.cliente}</td>
                        <td data-label="Assunto">{item.assunto}</td>
                        <td data-label="Status">
                          <span className="badge" style={{ backgroundColor: item.status === 'Aberto' ? '#5cb85c' : '#999' }}>
                            {item.status}
                          </span>
                        </td>
                        <td data-label="Cadastrado">{item.createdFormat}</td>
                        <td data-label="Agendado">{item.scheduledFormat || '-'}</td>
                        <td data-label="#">
                          <button className="action" style={{ backgroundColor: '#3583f6' }} onClick={() => toggleModal(item)}>
                            <FiSearch color='#FFF' size={17} />
                          </button>
                          <Link to={`/new/${item.id}`} className="action" style={{ backgroundColor: '#f6a935' }}>
                            <FiEdit2 color='#FFF' size={17} />
                          </Link>
                          <button className="action" style={{ backgroundColor: '#e83f5b' }} onClick={() => handleDelete(item.id)}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>


              {loadingMore && <h3>Buscando mais chamados...</h3>}
              {!loadingMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Buscar mais</button>}
            </>
          )}
        </>

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