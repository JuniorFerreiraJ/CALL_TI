
import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { supabase } from '../../services/supabaseConnection'
import { toast } from 'react-toastify'
import './modal.css';

export default function Modal({ conteudo, close, onUpdated }) {
  const [status, setStatus] = useState(conteudo.status)
  const [priority, setPriority] = useState(conteudo.priority || 'Baixa')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('tickets')
        .update({ status, priority })
        .eq('id', conteudo.id)

      if (error) throw error
      toast.success('Chamado atualizado')
      onUpdated && onUpdated({ ...conteudo, status, priority })
      close()
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível salvar')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="modal">
      <div className="container">
        <button className="close" onClick={close}>
          <FiX size={25} color="#FFF" />
          Voltar
        </button>

        <main>
          <h2>Detalhes do chamado</h2>

          <div className="row">
            <span>
              Cliente: <i>{conteudo.cliente}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Assunto: <i>{conteudo.assunto}</i>
            </span>
            <span>
              Cadastrado em: <i>{conteudo.createdFormat}</i>
            </span>
          </div>

          <div className="row">
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Aberto">Aberto</option>
                <option value="Progresso">Progresso</option>
                <option value="Atendido">Atendido</option>
              </select>
            </div>
            <div className="field">
              <label>Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="save" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
          {conteudo.scheduledFormat && (
            <div className="row">
              <span>
                Agendado: <i>{conteudo.scheduledFormat}</i>
              </span>
            </div>
          )}

          {conteudo.complemento !== '' && (
            <>
              <h3>Complemento</h3>
              <p>
                {conteudo.complemento}
              </p>
            </>
          )}

        </main>
      </div>
    </div>
  )
}