import React from 'react';

// Esta versão é mais simples.
// Ela não precisa mais saber quais são as colunas ou como se mover.
// O 'App.js' (com Draggable) cuida de "como" ela é arrastada.

// task: (objeto) A tarefa a ser exibida
// onEdit: (função) Chamada ao clicar em "Editar"
// onDelete: (função) Chamada ao clicar em "Excluir"
function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      
      <div className="task-actions">
        {/* Os botões de mover foram removidos! */}
        
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