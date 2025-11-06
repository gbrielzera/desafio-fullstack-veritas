import React, { useState, useEffect, useCallback } from 'react';
import * as api from './services/api'; // Importa nossas funções da API
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import './App.css';

// Nossas 3 colunas fixas [cite: 7]
const COLUMNS = ['A Fazer', 'Em Progresso', 'Concluídas'];

function App() {
  // Estados da aplicação
  const [tasks, setTasks] = useState([]); // A lista de todas as tarefas
  const [loading, setLoading] = useState(true); // Feedback de loading 
  const [error, setError] = useState(null); // Feedback de erro 
  
  // Estados para o formulário (modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); // (null) se for criar, (task) se for editar

  // Função para buscar os dados da API Go
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTasks();
      setTasks(response.data || []); // Garante que tasks seja sempre um array
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setError('Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect: Roda quando o componente é montado
  // O array vazio [] significa "rode apenas uma vez"
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // fetchTasks está listado como dependência

  // ----- Funções de Manipulação de Tarefas -----

  // Salvar (Criar ou Atualizar) 
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // 1. ATUALIZAR (Editar)
        const updatedTask = await api.updateTask(taskData.id, taskData);
        // Atualiza o estado local do React
        setTasks(tasks.map(t => (t.id === taskData.id ? updatedTask.data : t)));
      } else {
        // 2. CRIAR (Nova Tarefa)
        // Define o status padrão se for uma tarefa nova
        const newTaskData = { ...taskData, status: COLUMNS[0] }; // COLUMNS[0] = "A Fazer"
        const newTask = await api.createTask(newTaskData);
        // Adiciona a nova tarefa ao estado local
        setTasks([...tasks, newTask.data]);
      }
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      setError("Falha ao salvar a tarefa. Verifique o console.");
    } finally {
      // Fecha o formulário
      setIsFormOpen(false);
      setTaskToEdit(null);
    }
  };

  // Mover tarefa entre colunas 
  const handleMoveTask = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    
    try {
      // Atualiza primeiro na API
      await api.updateTask(task.id, updatedTask);
      // Atualiza o estado local do React se a API responder com sucesso
      setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      setError("Falha ao mover a tarefa.");
    }
  };

  // Excluir tarefa 
  const handleDeleteTask = async (id) => {
    // Confirmação (boa prática)
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await api.deleteTask(id);
        // Remove do estado local
        setTasks(tasks.filter(t => t.id !== id));
      } catch (err) {
        console.error("Erro ao excluir tarefa:", err);
        setError("Falha ao excluir a tarefa.");
      }
    }
  };

  // ----- Funções de UI (Formulário) -----

  // Abre o formulário para criar
  const handleOpenCreateForm = () => {
    setTaskToEdit(null); // Garante que não está em modo de edição
    setIsFormOpen(true);
  };

  // Abre o formulário para editar
  const handleOpenEditForm = (task) => {
    setTaskToEdit(task); // Define a tarefa que queremos editar
    setIsFormOpen(true);
  };

  // Fecha o formulário
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  // ----- Renderização -----

  // Filtra as tarefas para cada coluna
  const getTasksByColumn = (columnName) => {
    return tasks.filter(task => task.status === columnName);
  };

  return (
    <div className="App">
      <div className="kanban-header">
        <h1>Mini Kanban (React + Go)</h1>
        <button className="btn btn-primary" onClick={handleOpenCreateForm}>
          + Nova Tarefa
        </button>
      </div>

      {/* Exibe feedbacks visuais  */}
      {loading && <div className="loading">Carregando tarefas...</div>}
      {error && <div className="error">{error}</div>}

      {/* O quadro Kanban */}
      {!loading && !error && (
        <div className="kanban-board">
          {COLUMNS.map(columnName => (
            <div className="kanban-column" key={columnName}>
              <h2>{columnName}</h2>
              <div className="tasks-container">
                {getTasksByColumn(columnName).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeleteTask}
                    onMove={handleMoveTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* O modal do formulário (só aparece se isFormOpen for true) */}
      {isFormOpen && (
        <TaskForm
          taskToEdit={taskToEdit}
          onSubmit={handleSaveTask}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;