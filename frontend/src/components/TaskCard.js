import React from 'react';

// Mapeamento dos status (Colunas fixas do Kanban) [cite: 7]
const COLUMNS = ['A Fazer', 'Em Progresso', 'Concluídas'];

// task: (objeto) A tarefa a ser exibida
// onEdit: (função) Chamada ao clicar em "Editar"
// onDelete: (função) Chamada ao clicar em "Excluir"
// onMove: (função) Chamada ao mover para outra coluna
function TaskCard({ task, onEdit, onDelete, onMove }) {

  // Função para mover a tarefa para a próxima coluna
  const handleMove = (direction) => {
    const currentStatusIndex = COLUMNS.indexOf(task.status);
    let nextStatusIndex = currentStatusIndex + direction; // direction pode ser +1 ou -1

    // Garante que o índice não saia dos limites (0, 1, 2)
    if (nextStatusIndex >= 0 && nextStatusIndex < COLUMNS.length) {
      onMove(task, COLUMNS[nextStatusIndex]);
    }
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      
      <div className="task-actions">
        {/* Botão de mover para trás (se não estiver na primeira coluna) */}
        {task.status !== COLUMNS[0] && (
          <button className="btn btn-move" onClick={() => handleMove(-1)}>
            &larr; Mover
          </button>
        )}
        
        {/* Botão de mover para frente (se não estiver na última coluna) */}
        {task.status !== COLUMNS[COLUMNS.length - 1] && (
          <button className="btn btn-move" onClick={() => handleMove(1)}>
            Mover &rarr;
          </button>
        )}
        
        {/* Botões de Editar e Excluir  */}
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