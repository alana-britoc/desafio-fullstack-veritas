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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error("Falha ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      setTasks([...tasks, response.data]);
      setActiveColumn(null);
    } catch (error) {
      console.error("Falha ao criar tarefa:", error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await updateTask(taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? response.data : task
        )
      );
      setModalTask(null);
    } catch (error) {
      console.error("Falha ao atualizar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Falha ao deletar tarefa:", error);
    }
  };
  
  const handleStartEdit = (task) => {
    setModalTask(task);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;
    const oldStatus = activeTask.status;
    let newStatus = null;
    if (columns.includes(over.id)) {
      newStatus = over.id;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }
    if (!newStatus || newStatus === oldStatus) return;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === activeTask.id ? { ...task, status: newStatus } : task
      )
    );
    const taskToUpdate = { ...activeTask, status: newStatus };
    try {
      await updateTask(activeTask.id, taskToUpdate);
    } catch (error) {
      console.error("Falha ao atualizar tarefa:", error);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === activeTask.id ? { ...task, status: oldStatus } : task
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
              {columns.map(status => (
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

        <DragOverlay className="drag-overlay">
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