package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing" // Pacote de testes nativo do Go
)

// setup é uma função auxiliar para limpar o mapa de tarefas
// e garantir que cada teste comece com um estado limpo.
func setup() {
	tasksMutex.Lock()
	tasks = make(map[string]Task)
	tasksMutex.Unlock()

	// Como estamos persistindo em JSON, o ideal seria limpar
	// o arquivo também, mas para "testes simples" focados
	// nos handlers, limpar o mapa em memória é o principal.
}

// --- Teste 1: Criar Tarefa (POST /tasks) ---
func TestCreateTaskHandler(t *testing.T) {
	// 1. Prepara o teste (limpa o mapa)
	setup()

	// 2. Cria o 'corpo' (payload) da nossa requisição JSON
	payload := []byte(`{"title":"Tarefa Teste","description":"Desc Teste"}`)

	// 3. Cria uma requisição HTTP de teste (simulada)
	// Usamos bytes.NewBuffer para simular o envio do payload
	req, err := http.NewRequest("POST", "/tasks", bytes.NewBuffer(payload))
	if err != nil {
		t.Fatalf("Erro ao criar requisição de teste: %v", err)
	}

	// 4. Cria um 'ResponseRecorder'
	// Isso age como um "gravador" da resposta do nosso handler
	rr := httptest.NewRecorder()

	// 5. Chama o handler que queremos testar
	// http.HandlerFunc converte nossa função para o tipo http.Handler
	handler := http.HandlerFunc(CreateTaskHandler)
	handler.ServeHTTP(rr, req)

	// 6. Verifica o resultado (Assertivas)

	// 6a. O status code HTTP deve ser 201 (StatusCreated)
	if status := rr.Code; status != http.StatusCreated {
		t.Errorf("Handler retornou status code errado: esperado %v, recebido %v",
			http.StatusCreated, status)
	}

	// 6b. O mapa 'tasks' em memória deve agora conter 1 tarefa
	tasksMutex.RLock()
	if len(tasks) != 1 {
		t.Errorf("Nenhuma tarefa foi adicionada ao mapa. Esperado: 1, Recebido: %v", len(tasks))
	}
	tasksMutex.RUnlock()
}

// --- Teste 2: Obter Tarefas (GET /tasks) ---
func TestGetTasksHandler(t *testing.T) {
	// 1. Prepara o teste (limpa o mapa)
	setup()

	// 2. Adiciona uma tarefa "mock" diretamente ao mapa para o teste
	testTask := Task{
		ID:     "test-id-123",
		Title:  "Tarefa de Teste GET",
		Status: StatusToDo,
	}
	tasksMutex.Lock()
	tasks[testTask.ID] = testTask
	tasksMutex.Unlock()

	// 3. Cria a requisição GET (sem corpo, 'nil')
	req, err := http.NewRequest("GET", "/tasks", nil)
	if err != nil {
		t.Fatalf("Erro ao criar requisição de teste: %v", err)
	}

	// 4. Cria o ResponseRecorder
	rr := httptest.NewRecorder()

	// 5. Chama o handler
	handler := http.HandlerFunc(GetTasksHandler)
	handler.ServeHTTP(rr, req)

	// 6. Verifica o resultado (Assertivas)

	// 6a. O status code HTTP deve ser 200 (StatusOK)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler retornou status code errado: esperado %v, recebido %v",
			http.StatusOK, status)
	}

	// 6b. O corpo da resposta deve conter nossa tarefa
	var returnedTasks []Task
	// Decodifica o JSON que o handler escreveu no ResponseRecorder
	if err := json.Unmarshal(rr.Body.Bytes(), &returnedTasks); err != nil {
		t.Fatalf("Erro ao decodificar JSON da resposta: %v", err)
	}

	if len(returnedTasks) != 1 {
		t.Fatalf("Número incorreto de tarefas retornado. Esperado: 1, Recebido: %v", len(returnedTasks))
	}

	if returnedTasks[0].Title != "Tarefa de Teste GET" {
		t.Errorf("Título da tarefa incorreto na resposta. Esperado: 'Tarefa de Teste GET', Recebido: '%v'", returnedTasks[0].Title)
	}
}
