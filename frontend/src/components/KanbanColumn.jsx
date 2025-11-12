import React, { useState, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import CreateCardForm from './CreateCardForm';
import { IoMdAdd } from 'react-icons/io';

function KanbanColumn({ title, tasks, onSaveTask, onEditTask, onDeleteTask, activeColumn, setActiveColumn }) {
  const { setNodeRef } = useDroppable({ id: title });
  const showForm = activeColumn === title;

  const handleSave = (taskData) => {
    onSaveTask({ ...taskData, status: title });
    setActiveColumn(null);
  };

  const handleOpenForm = () => {
    if (activeColumn === title) {
      setActiveColumn(null);
    } else {
      setActiveColumn(title);
    }
  };

  useEffect(() => {
    // Fecha o form se clicar fora
    const handleClickOutside = (e) => {
      if (!e.target.closest('.kanban-column')) {
        setActiveColumn(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [setActiveColumn]);

  return (
    <div ref={setNodeRef} className="kanban-column" data-status={title}>
      <h3>{title}</h3>

      <SortableContext id={title} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="column-body">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      <div className="column-footer">
        {showForm ? (
          <CreateCardForm
            onSave={handleSave}
            onCancel={() => setActiveColumn(null)}
          />
        ) : (
          <button onClick={handleOpenForm} className="add-card-btn">
            <IoMdAdd size={18} />
            Adicionar Tarefa
          </button>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
