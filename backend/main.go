package main

import (
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Carrega as tarefas salvas do arquivo JSON ao iniciar
	log.Println("Carregando tarefas do arquivo...")
	loadTasksFromFile()

	// Inicializa o roteador
	r := mux.NewRouter()

	// Define os endpoints da API RESTful
	// Usamos /tasks/{id} para PUT e DELETE, que é o padrão RESTful
	// para operar em um recurso específico.
	r.HandleFunc("/tasks", GetTasksHandler).Methods("GET")
	r.HandleFunc("/tasks", CreateTaskHandler).Methods("POST")
	r.HandleFunc("/tasks/{id}", UpdateTaskHandler).Methods("PUT")
	r.HandleFunc("/tasks/{id}", DeleteTaskHandler).Methods("DELETE")

	// Configuração do CORS
	// Permite que o frontend em localhost:3000 acesse esta API rodando em localhost:8080
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}), // URL do frontend React
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With", "Authorization"}),
	)

	// Inicia o servidor
	port := ":8080"
	log.Printf("Servidor backend rodando na porta %s", port)

	// Aplica o middleware CORS ao roteador
	if err := http.ListenAndServe(port, corsHandler(r)); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
