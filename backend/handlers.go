package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/google/uuid"
)

var (
	taskStore     = make(map[string]Task)
	taskMutex     = &sync.Mutex{} // A ÚNICA TRANCA
	tasksJSONFile = "tasks.json"
)

func loadTasksFromFile() error {
	// A tranca é gerenciada por quem chama essa função (o main)
	file, err := os.Open(tasksJSONFile)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("Arquivo tasks.json não encontrado. Iniciando com store vazio.")
			taskStore = make(map[string]Task)
			return nil
		}
		return err
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	if len(bytes) == 0 {
		log.Println("Arquivo tasks.json está vazio. Iniciando com store vazio.")
		taskStore = make(map[string]Task)
		return nil
	}

	err = json.Unmarshal(bytes, &taskStore)
	if err != nil {
		log.Println("ERRO: Falha ao decodificar tasks.json. Arquivo pode estar corrompido.", err)
		log.Println("Iniciando com store vazio para evitar crash.")
		taskStore = make(map[string]Task)
		return nil // Retorna nil para não travar o servidor
	}

	log.Printf("Carregadas %d tarefas do arquivo tasks.json", len(taskStore))
	return nil
}

func saveTasksToFile() error {
	bytes, err := json.MarshalIndent(taskStore, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(tasksJSONFile, bytes, 0644)
	if err != nil {
		return err
	}
	return nil
}

func taskRoutes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getTasksHandler(w, r)
	case http.MethodPost:
		createTaskHandler(w, r)
	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

func taskByIDHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/tasks/")
	if id == "" {
		http.Error(w, "ID da tarefa não pode ser vazio", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		getTaskByIDHandler(w, r, id)
	case http.MethodPut:
		updateTaskHandler(w, r, id)
	case http.MethodDelete:
		deleteTaskHandler(w, r, id)
	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

func getTasksHandler(w http.ResponseWriter, _ *http.Request) {
	taskMutex.Lock()
	defer taskMutex.Unlock()

	tasks := make([]Task, 0, len(taskStore))
	for _, task := range taskStore {
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func getTaskByIDHandler(w http.ResponseWriter, _ *http.Request, id string) {
	taskMutex.Lock()
	defer taskMutex.Unlock()

	task, ok := taskStore[id]
	if !ok {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func createTaskHandler(w http.ResponseWriter, r *http.Request) {
	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := task.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	task.ID = uuid.NewString()

	taskMutex.Lock()
	defer taskMutex.Unlock()

	taskStore[task.ID] = task

	if err := saveTasksToFile(); err != nil {
		http.Error(w, "Falha ao salvar a tarefa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

func updateTaskHandler(w http.ResponseWriter, r *http.Request, id string) {
	var updatedTask Task
	err := json.NewDecoder(r.Body).Decode(&updatedTask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := updatedTask.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	taskMutex.Lock()
	defer taskMutex.Unlock()

	_, ok := taskStore[id]
	if !ok {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
		return
	}

	updatedTask.ID = id
	taskStore[id] = updatedTask

	if err := saveTasksToFile(); err != nil {
		http.Error(w, "Falha ao salvar a tarefa", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

func deleteTaskHandler(w http.ResponseWriter, _ *http.Request, id string) {
	taskMutex.Lock()
	defer taskMutex.Unlock()

	_, ok := taskStore[id]
	if !ok {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
		return
	}

	delete(taskStore, id)

	if err := saveTasksToFile(); err != nil {
		http.Error(w, "Falha ao salvar a tarefa", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
