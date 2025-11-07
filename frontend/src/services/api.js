import axios from 'axios';

// Configura a URL base da API Go
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTasks = () => apiClient.get('/tasks');
export const createTask = (task) => apiClient.post('/tasks', task);
// Passando o ID na URL, como definido no backend
export const updateTask = (id, task) => apiClient.put(`/tasks/${id}`, task);
export const deleteTask = (id) => apiClient.delete(`/tasks/${id}`);