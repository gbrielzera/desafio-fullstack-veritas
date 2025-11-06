import React, { useState, useEffect } from 'react';

// taskToEdit: (tarefa) se estiver editando, ou (null) se estiver criando
// onSubmit: (função) para salvar (criar ou atualizar)
// onCancel: (função) para fechar o modal
function TaskForm({ taskToEdit, onSubmit, onCancel }) {
  // Estado inicial do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Se 'taskToEdit' mudar (usuário clicou em editar),
  // preenchemos o formulário com os dados da tarefa.
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
    } else {
      // Limpa o formulário se for para criar uma nova
      setTitle('');
      setDescription('');
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação simples (igual ao backend) 
    if (!title) {
      alert('O título é obrigatório.');
      return;
    }

    // Chama a função 'onSubmit' (que veio do App.js)
    // Se estiver editando, passa a tarefa atualizada.
    // Se for nova, passa os novos dados.
    onSubmit({
      ...taskToEdit, // Mantém o ID e Status se estiver editando
      title,
      description,
      // Se for uma tarefa nova, o App.js definirá o status padrão
    });
  };

  return (
    <div className="task-form-modal">
      <div className="task-form-content">
        <h2>{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
            />
          </div>
          <div className="form-group">
            <label>Descrição (Opcional) [cite: 8]</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição..."
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;