import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';

const statusMap = {
  'A Fazer': 'todo',
  'Em Progresso': 'progress',
  'Concluídas': 'done',
};

function TaskCard({ task, onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const clickStart = useRef({ x: 0, y: 0, time: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task.id);
    setIsMenuOpen(false);
  };

  const handlePointerDown = (e) => {
    clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    listeners.onPointerDown?.(e);
  };

  const handlePointerUp = (e) => {
    const { x, y, time } = clickStart.current;
    const dx = Math.abs(e.clientX - x);
    const dy = Math.abs(e.clientY - y);
    const dt = Date.now() - time;

    if (dx < 5 && dy < 5 && dt < 300) {
      onEdit(task);
    }
  };

  const statusClassName = `status-${statusMap[task.status] || 'default'}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`task-card ${isMenuOpen ? 'is-menu-active' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      data-status={statusClassName}
    >
      <div className="task-card-status-wrapper">
        <span className={`task-card-status-tag ${statusClassName}`}>
          {task.status}
        </span>
      </div>

      <div className="task-card-header">
        <h4>{task.title}</h4>
        
        <button 
          onPointerDown={handleMenuToggle} 
          className="task-card-menu-btn"
        >
          <HiOutlineDotsHorizontal size={18} />
        </button>

        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="task-card-menu" 
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button onClick={handleDelete} className="delete">Excluir</button>
          </div>
        )}
      </div>
      {task.description && <p>{task.description}</p>}
    </div>
  );
}

export default TaskCard;