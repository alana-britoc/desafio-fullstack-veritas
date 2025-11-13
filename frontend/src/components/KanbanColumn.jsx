import React, { useEffect, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard'; 
import CreateCardForm from './CreateCardForm'; 
import { IoMdAdd } from 'react-icons/io';

function KanbanColumn({
  title,
  tasks,
  onSaveTask,
  onEditTask,
  onDeleteTask,
  activeColumn,
  setActiveColumn,
}) {
  const { setNodeRef } = useDroppable({ id: title });
  const showForm = activeColumn === title;
  const columnRef = useRef(null);

  const handleSave = async (taskData) => {
    await onSaveTask({ ...taskData, status: title });
    setActiveColumn(null);
  };

  const handleOpenForm = (e) => {
    e.stopPropagation();
    setActiveColumn((prev) => (prev === title ? null : title));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnRef.current && !columnRef.current.contains(e.target)) {
        setActiveColumn(null);
      }
    };

    if (showForm) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showForm, setActiveColumn]);

  const combinedRef = (node) => {
    setNodeRef(node);
    columnRef.current = node;
  };

  return (
    <div
      ref={combinedRef} 
      className="kanban-column"
      data-status={title}
    >
      {/* O <h3> é estilizado automaticamente 
        pelo seletor .kanban-column h3 no seu CSS 
      */}
      <h3>
        {title}
      </h3>

      <SortableContext
        id={title}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {/* A classe .column-body do seu CSS já 
          cuida do scroll (overflow-y: auto) 
        */}
        <div className="column-body">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      {/* A classe .column-footer do seu CSS */}
      <div className="column-footer">
        {showForm ? (
          <CreateCardForm
            onSave={handleSave}
            onCancel={() => setActiveColumn(null)}
          />
        ) : (
          <button
            onClick={handleOpenForm}
            className="add-card-btn"
          >
            <IoMdAdd size={16} />
            Adicionar Tarefa
          </button>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;