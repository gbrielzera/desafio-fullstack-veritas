import React from 'react';

// task: (objeto) A tarefa a ser exibida
// onEdit: (função) Chamada ao clicar em "Editar"
// onDelete: (função) Chamada ao clicar em "Excluir"
function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      
      <div className="task-actions">
        {/* Não é mais necessário botões de mudar de lugar. */}
        
        {/* Botões de Editar e Excluir */}
        <button className="btn btn-secondary" onClick={() => onEdit(task)}>
          Editar
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}

export default TaskCard;