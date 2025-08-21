
import { useState, useEffect, useContext, useCallback } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlusCircle } from 'react-icons/fi'

import { AuthContext } from '../../contexts/auth'
import { supabase } from '../../services/supabaseConnection'

import { useParams, useNavigate } from 'react-router-dom'

import { toast } from 'react-toastify'

import './new.css';



export default function New() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([])
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0)

  const [complemento, setComplemento] = useState('')
  const [assunto, setAssunto] = useState('Suporte')
  const [status, setStatus] = useState('Aberto')
  const [idCustomer, setIdCustomer] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [priority, setPriority] = useState('Baixa')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Define loadId ANTES do useEffect para evitar no-use-before-define
  const loadId = useCallback(async (lista) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setAssunto(data.subject);
        setStatus(data.status);
        setComplemento(data.description);
        if (data.priority) setPriority(data.priority);

        // Converte ISO -> valor para input datetime-local (YYYY-MM-DDTHH:mm)
        if (data.scheduled_at) {
          const dt = new Date(data.scheduled_at);
          const offsetMinutes = dt.getTimezoneOffset();
          const local = new Date(dt.getTime() - offsetMinutes * 60000);
          setScheduledAt(local.toISOString().slice(0, 16));
        }

        let index = lista.findIndex(item => item.id === data.customer_id);
        setCustomerSelected(index);
        setIdCustomer(true);
      }
    } catch (error) {
      console.log(error);
      setIdCustomer(false);
    }
  }, [id]);


  useEffect(() => {
    async function loadCustomers() {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, fantasy_name, active')
          .eq('active', true)
          .order('fantasy_name');

        if (error) throw error;

        if (data && data.length > 0) {
          const lista = data.map(item => ({
            id: item.id,
            nomeFantasia: item.fantasy_name
          }));

          setCustomers(lista);
          setLoadCustomer(false);

          if (id) {
            loadId(lista);
          }
        } else {
          console.log("NENHUMA EMPRESA ENCONTRADA");
          setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
          setLoadCustomer(false);
        }
      } catch (error) {
        console.log("ERRO AO BUSCAR OS CLIENTES", error);
        setLoadCustomer(false);
        setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
      }
    }

    loadCustomers();
  }, [id, loadId])





  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value)
  }

  function hnadleChangeCustomer(e) {
    setCustomerSelected(e.target.value)
    console.log(customers[e.target.value].nomeFantasia);
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Validações leves
    if (!customers || customers.length === 0) {
      toast.error('Cadastre um cliente primeiro.');
      return;
    }
    if (scheduledAt) {
      const now = new Date();
      const selected = new Date(scheduledAt);
      if (selected.getTime() < now.getTime()) {
        toast.error('A data de agendamento não pode ser no passado.');
        return;
      }
    }

    setIsSubmitting(true);

    if (idCustomer) {
      //Atualizando chamado
      try {
        const scheduled_at = scheduledAt ? new Date(scheduledAt).toISOString() : null;
        const { error } = await supabase
          .from('tickets')
          .update({
            customer_name: customers[customerSelected].nomeFantasia,
            customer_id: customers[customerSelected].id,
            subject: assunto,
            description: complemento,
            status: status,
            user_id: user.uid,
            scheduled_at,
            priority: priority,
          })
          .eq('id', id);

        if (error) throw error;

        toast.info("Chamado atualizado com sucesso!");
        setCustomerSelected(0);
        setComplemento('');
        setScheduledAt('');
        setIsSubmitting(false);
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        toast.error("Ops erro ao atualizar esse chamado!");
        setIsSubmitting(false);
      }
      return;
    }

    //Registrar um chamado
    try {
      const scheduled_at = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      const { error } = await supabase
        .from('tickets')
        .insert([{
          customer_name: customers[customerSelected].nomeFantasia,
          customer_id: customers[customerSelected].id,
          subject: assunto,
          description: complemento,
          status: status,
          user_id: user.uid,
          scheduled_at,
          priority: priority,
        }]);

      if (error) throw error;

      toast.success("Chamado registrado!");
      setComplemento('');
      setCustomerSelected(0);
      setScheduledAt('');
      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast.error("Ops erro ao registrar, tente mais tarde!");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name={id ? "Editando Chamado" : "Novo Chamado"}>
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>

            <div className="grid two">
              <div>
                <label>Clientes</label>
                {
                  loadCustomer ? (
                    <input type="text" disabled={true} value="Carregando..." />
                  ) : (
                    <select value={customerSelected} onChange={hnadleChangeCustomer}>
                      {customers.map((item, index) => {
                        return (
                          <option key={index} value={index}>
                            {item.nomeFantasia}
                          </option>
                        )
                      })}
                    </select>
                  )
                }
              </div>

              <div>
                <label>Assunto</label>
                <select value={assunto} onChange={handleChangeSelect}>
                  <option value="Suporte">Suporte</option>
                  <option value="Visita Tecnica">Visita Tecnica</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
            </div>

            <div className="grid two">
              <div>
                <label>Status</label>
                <div className="status">
                  <input
                    type="radio"
                    name="radio"
                    value="Aberto"
                    onChange={handleOptionChange}
                    checked={status === 'Aberto'}
                  />
                  <span>Em aberto</span>

                  <input
                    type="radio"
                    name="radio"
                    value="Progresso"
                    onChange={handleOptionChange}
                    checked={status === 'Progresso'}
                  />
                  <span>Progresso</span>

                  <input
                    type="radio"
                    name="radio"
                    value="Atendido"
                    onChange={handleOptionChange}
                    checked={status === 'Atendido'}
                  />
                  <span>Atendido</span>
                </div>
              </div>

              <div>
                <label>Prioridade</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>

            <label>Agendar para</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
              onChange={(e) => setScheduledAt(e.target.value)}
            />


            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema (opcional)."
              value={complemento}
              maxLength={500}
              onChange={(e) => setComplemento(e.target.value)}
            />
            <small>{complemento.length}/500</small>

            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : (id ? 'Atualizar' : 'Registrar')}</button>

          </form>
        </div>
      </div>
    </div>
  )
}