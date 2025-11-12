import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { IoMdClose } from 'react-icons/io';

Modal.setAppElement('#root');

function TaskModal({ task, isOpen, onRequestClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const originalTitle = task.title;
  const originalDescription = task.description || '';
  const isDirty = (title !== originalTitle) || (description !== originalDescription);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
    setIsEditing(false);
    setIsConfirmingClose(false);
  }, [task, isOpen]);

  const handleCloseRequest = () => {
    if (isEditing && isDirty) {
      setIsConfirmingClose(true);
    } else {
      onRequestClose();
    }
  };

  const handleConfirmDiscard = () => {
    setIsConfirmingClose(false);
    onRequestClose();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(task.id, { ...task, title, description });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseRequest}
      contentLabel="Detalhes da Tarefa"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <button type="button" className="modal-close-btn" onClick={handleCloseRequest}>
        <IoMdClose size={24} />
      </button>
      
      {isEditing ? (
        <form onSubmit={handleSave} className="task-form">
          <div className="form-group">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input-title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-textarea-description"
              placeholder="Adicione uma descrição mais detalhada..."
            />
          </div>
          <div className="form-actions">
            <div style={{ flexGrow: 1 }} />
            <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      ) : (
        <div className="task-view">
          <h2 className="modal-title-ro">{title}</h2>
          <div className="form-group">
            <label>Descrição</label>
            <p className="modal-description-ro">
              {description || <i>Sem descrição.</i>}
            </p>
          </div>
          <div className="form-actions">
            <div style={{ flexGrow: 1 }} />
            <button type="button" onClick={() => setIsEditing(true)} className="btn btn-primary">
              Editar
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isConfirmingClose}
        onRequestClose={() => setIsConfirmingClose(false)}
        contentLabel="Confirmar Descarte"
        className="confirm-modal-content"
        overlayClassName="confirm-modal-overlay"
      >
        <div className="modal-confirm-view">
          <h3>Descartar alterações?</h3>
          <p>Você tem alterações não salvas. Se sair, elas serão perdidas.</p>
          <div className="form-actions">
            <div style={{ flexGrow: 1 }} />
            <button type="button" onClick={() => setIsConfirmingClose(false)} className="btn btn-secondary">
              Continuar editando
            </button>
            <button type="button" onClick={handleConfirmDiscard} className="btn btn-danger-confirm">
              Descartar
            </button>
          </div>
        </div>
      </Modal>

    </Modal>
  );
}

export default TaskModal;