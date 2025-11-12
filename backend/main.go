package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	taskMutex.Lock()
	if err := loadTasksFromFile(); err != nil {
		log.Printf("Aviso: Falha ao carregar tarefas, mas o servidor vai iniciar: %v", err)
	}
	taskMutex.Unlock()

	mux := http.NewServeMux()
	mux.HandleFunc("/tasks", taskRoutes)
	mux.HandleFunc("/tasks/", taskByIDHandler)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.NotFound(w, r)
	})

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"},
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowedHeaders: []string{"Content-Type"},
	})

	handler := c.Handler(mux)

	log.Println("Servidor Go rodando na porta :8080 (com CORS e lock corrigido)")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
