package main

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"` // Descrição é opcional
	Status      string `json:"status"`               // "A Fazer", "Em Progresso", "Concluídas"
}

// Constantes para os status das colunas
const (
	StatusToDo       = "A Fazer"
	StatusInProgress = "Em Progresso"
	StatusDone       = "Concluídas"
)