import React, { useState } from 'react';

function CreateCardForm({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="new-task-form">
      <input
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da Tarefa"
        className="task-title-input"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)..."
        className="task-desc-input"
      />
      <div className="new-task-buttons">
        <button type="submit" className="add">
          Adicionar
        </button>
        <button type="button" onClick={onCancel} className="cancel">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default CreateCardForm;
