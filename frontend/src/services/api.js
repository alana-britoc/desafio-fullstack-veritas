import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
});


export const getTasks = () => api.get('/tasks');

export const createTask = (taskData) => api.post('/tasks', taskData);

export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);