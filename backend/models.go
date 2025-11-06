package main

// Task é a estrutura que representa uma tarefa no Kanban
type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"` // Descrição é opcional [cite: 8]
	Status      string `json:"status"`               // Ex: "A Fazer", "Em Progresso", "Concluídas"
}

// Constantes para os status das colunas
const (
	StatusToDo       = "A Fazer"
	StatusInProgress = "Em Progresso"
	StatusDone       = "Concluídas"
)