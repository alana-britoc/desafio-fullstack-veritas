package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	if err := loadTasksFromFile(); err != nil {
		log.Fatalf("Falha ao carregar tarefas do arquivo: %v", err)
	}

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

	log.Println("Servidor Go rodando na porta :8080 (com CORS habilitado para localhost:3000/5173)")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
