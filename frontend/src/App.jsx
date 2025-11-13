import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getTasks, updateTask, createTask, deleteTask } from './services/api';
import KanbanColumn from './components/KanbanColumn';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import { HiOutlineSearch } from 'react-icons/hi';
import './App.css';

const columns = ['A Fazer', 'Em Progresso', 'Concluídas'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColumn, setActiveColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Busca tarefas do backend
  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Falha ao buscar tarefas:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      const response = await createTask({
        ...taskData,
        status: activeColumn || 'A Fazer',
      });
      setTasks((prev) => [...prev, response.data]);
      setActiveColumn(null); // fecha o formulário
    } catch (error) {
      console.error('Falha ao criar tarefa:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await updateTask(taskId, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? response.data : task
        )
      );
      setModalTask(null);
    } catch (error) {
      console.error('Falha ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Falha ao deletar tarefa:', error);
    }
  };

  const handleStartEdit = (task) => {
    setModalTask(task);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const oldStatus = task.status;
    let newStatus = null;

    if (columns.includes(over.id)) {
      newStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (!newStatus || newStatus === oldStatus) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTask(task.id, { ...task, status: newStatus });
    } catch (error) {
      console.error('Falha ao atualizar tarefa:', error);
      // rollback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: oldStatus } : t
        )
      );
    }
  };

  return (
    <div className="app-backdrop">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="app-window">
          <header className="app-header">
            <span className="header-title">Mini Kanban de Tarefas</span>
            <div className="header-controls">
              <div className="search-bar">
                <HiOutlineSearch size={18} />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </header>

          <main className="app-container">
            <div className="kanban-board">
              {columns.map((status) => (
                <KanbanColumn
                  key={status}
                  title={status}
                  tasks={getTasksByStatus(status)}
                  onSaveTask={handleAddTask}
                  onEditTask={handleStartEdit}
                  onDeleteTask={handleDeleteTask}
                  activeColumn={activeColumn}
                  setActiveColumn={setActiveColumn}
                />
              ))}
            </div>
          </main>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>

        {modalTask && (
          <TaskModal
            task={modalTask}
            isOpen={!!modalTask}
            onRequestClose={() => setModalTask(null)}
            onSave={handleUpdateTask}
          />
        )}
      </DndContext>
    </div>
  );
}

export default App;
