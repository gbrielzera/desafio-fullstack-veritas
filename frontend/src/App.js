import React, { useState, useEffect, useCallback } from 'react';
// Importações do react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as api from './services/api'; 
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import './App.css';

// Nossas 3 colunas fixas
const COLUMNS = ['A Fazer', 'Em Progresso', 'Concluídas'];

function App() {
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); 

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTasks();
      setTasks(response.data || []); 
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setError('Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); 

  // ----- Funções de Manipulação de Tarefas (CRUD) -----

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // ATUALIZAR (Editar)
        const updatedTask = await api.updateTask(taskData.id, taskData);
        setTasks(tasks.map(t => (t.id === taskData.id ? updatedTask.data : t)));
      } else {
        // CRIAR (Nova Tarefa)
        const newTaskData = { ...taskData, status: COLUMNS[0] }; 
        const newTask = await api.createTask(newTaskData);
        setTasks([...tasks, newTask.data]);
      }
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      setError("Falha ao salvar a tarefa. Verifique o console.");
    } finally {
      setIsFormOpen(false);
      setTaskToEdit(null);
    }
  };

  // Esta função agora será chamada pelo 'onDragEnd'
  const handleMoveTask = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    
    // Atualização Otimista (Muda na UI primeiro)
    setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));

    try {
      // Atualiza na API em background
      await api.updateTask(task.id, updatedTask);
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      setError("Falha ao mover a tarefa. Revertendo...");
      // Reverte a mudança se a API falhar
      setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await api.deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (err) {
        console.error("Erro ao excluir tarefa:", err);
        setError("Falha ao excluir a tarefa.");
      }
    }
  };

  // ----- Funções de UI (Formulário) -----
  // (Estas funções permanecem iguais)
  const handleOpenCreateForm = () => {
    setTaskToEdit(null); 
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task) => {
    setTaskToEdit(task); 
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  // ----- Renderização -----

  // Filtra as tarefas para cada coluna
  const getTasksByColumn = (columnName) => {
    return tasks.filter(task => task.status === columnName);
  };

  // ----- LÓGICA DO DRAG AND DROP -----

  /**
   * Chamada quando o usuário solta um card.
   * @param {object} result - Contém 'source' (de onde veio) e 'destination' (para onde foi)
   */
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // 1. Soltou fora de uma coluna válida
    if (!destination) {
      return;
    }

    // 2. Soltou na mesma coluna e mesma posição
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 3. Encontra a tarefa que foi movida
    const task = tasks.find(t => t.id === draggableId);

    // 4. Pega o novo status (o ID da coluna de destino)
    const newStatus = destination.droppableId;

    // 5. Chama a função de mover
    if (task && task.status !== newStatus) {
      handleMoveTask(task, newStatus);
    }
  };

  return (
    <div className="App">
      <div className="kanban-header">
        <h1>Mini Kanban (React + Go)</h1>
        <button className="btn btn-primary" onClick={handleOpenCreateForm}>
          + Nova Tarefa
        </button>
      </div>

      {loading && <div className="loading">Carregando tarefas...</div>}
      {error && <div className="error">{error}</div>}

      {/* DragDropContext envolve todo o quadro.
        Ele gerencia o estado do drag-and-drop.
      */}
      <DragDropContext onDragEnd={onDragEnd}>
        {!loading && !error && (
          <div className="kanban-board">
            {COLUMNS.map(columnName => (
              /*
                Droppable é a área onde um card pode ser solto (a coluna).
                'droppableId' deve ser único (usamos o nome da coluna).
              */
              <Droppable key={columnName} droppableId={columnName}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    // Adiciona um estilo visual quando estamos arrastando sobre esta coluna
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? '#e0f7fa' : '#e9ecef',
                    }}
                  >
                    <h2>{columnName}</h2>
                    <div className="tasks-container">
                      {getTasksByColumn(columnName).map((task, index) => (
                        /*
                          Draggable é o item que pode ser arrastado (o card).
                          'draggableId' e 'key' devem ser o ID único da tarefa.
                          'index' é a posição dele na lista.
                        */
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              // Adiciona um estilo visual quando este card está sendo arrastado
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                              }}
                            >
                              <TaskCard
                                task={task}
                                onEdit={handleOpenEditForm}
                                onDelete={handleDeleteTask}
                                // onMove não é mais necessário aqui
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {/* Espaço reservado para o item que está sendo arrastado */}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        )}
      </DragDropContext>

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