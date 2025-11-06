package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"sync" // Para lidar com concorrência de forma segura

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// storage é nosso "banco de dados" em memória.
// Usamos um sync.RWMutex para evitar problemas de concorrência
// (quando duas requisições tentam ler/escrever ao mesmo tempo).
var (
	tasks      = make(map[string]Task)
	tasksMutex = &sync.RWMutex{}
	jsonFilePath = "tasks.json" // Arquivo para persistência 
)

// loadTasksFromFile carrega as tarefas do arquivo JSON para a memória.
func loadTasksFromFile() {
	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	file, err := ioutil.ReadFile(jsonFilePath)
	if err != nil {
		log.Printf("Nenhum arquivo 'tasks.json' encontrado, começando com lista vazia. %v", err)
		tasks = make(map[string]Task) // Garante que 'tasks' não seja nil
		return
	}

	// Se o arquivo estiver vazio, inicializa o mapa
	if len(file) == 0 {
		tasks = make(map[string]Task)
		return
	}

	err = json.Unmarshal(file, &tasks)
	if err != nil {
		log.Printf("Erro ao ler JSON, começando com lista vazia: %v", err)
		tasks = make(map[string]Task)
	}
}

// saveTasksToFile salva o mapa de tarefas (memória) no arquivo JSON.
func saveTasksToFile() {
	tasksMutex.RLock() // Apenas leitura do mapa
	defer tasksMutex.RUnlock()

	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		log.Printf("Erro ao serializar tarefas para JSON: %v", err)
		return
	}

	err = ioutil.WriteFile(jsonFilePath, data, 0644)
	if err != nil {
		log.Printf("Erro ao salvar tarefas no arquivo JSON: %v", err)
	}
}

// GetTasksHandler (GET /tasks)
// Retorna a lista de todas as tarefas.
func GetTasksHandler(w http.ResponseWriter, r *http.Request) {
	tasksMutex.RLock()
	defer tasksMutex.RUnlock()

	// Converte o mapa de tarefas em uma lista (slice) para o JSON
	taskList := make([]Task, 0, len(tasks))
	for _, task := range tasks {
		taskList = append(taskList, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskList)
}

// CreateTaskHandler (POST /tasks)
// Cria uma nova tarefa.
func CreateTaskHandler(w http.ResponseWriter, r *http.Request) {
	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validação básica (título obrigatório) 
	if task.Title == "" {
		http.Error(w, "O título é obrigatório", http.StatusBadRequest)
		return
	}
	
	// Validação básica (status) 
	if task.Status == "" {
		task.Status = StatusToDo // Define "A Fazer" como padrão
	}

	// Gera um ID único
	task.ID = uuid.New().String()

	// Salva na memória
	tasksMutex.Lock()
	tasks[task.ID] = task
	tasksMutex.Unlock()

	// Salva no arquivo
	saveTasksToFile()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// UpdateTaskHandler (PUT /tasks/{id})
// Atualiza uma tarefa existente (para editar ou mover).
func UpdateTaskHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var updatedTask Task
	if err := json.NewDecoder(r.Body).Decode(&updatedTask); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validação (título obrigatório) 
	if updatedTask.Title == "" {
		http.Error(w, "O título é obrigatório", http.StatusBadRequest)
		return
	}

	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	// Verifica se a tarefa existe
	_, ok := tasks[id]
	if !ok {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
		return
	}

	// Atualiza a tarefa (mantendo o ID original)
	updatedTask.ID = id 
	tasks[id] = updatedTask

	// Salva no arquivo
	go saveTasksToFile() // Salva em background para responder mais rápido

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

// DeleteTaskHandler (DELETE /tasks/{id})
// Exclui uma tarefa.
func DeleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	// Verifica se a tarefa existe
	if _, ok := tasks[id]; !ok {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
		return
	}

	// Remove do mapa
	delete(tasks, id)

	// Salva no arquivo
	go saveTasksToFile()

	w.WriteHeader(http.StatusNoContent) // Resposta 204 (Sucesso, sem conteúdo)
}