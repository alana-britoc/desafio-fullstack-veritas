package main

import (
	"errors"
)

const (
	StatusTodo       = "A Fazer"
	StatusInProgress = "Em Progresso"
	StatusDone       = "Concluídas"
)

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Status      string `json:"status"`
}

func (t *Task) Validate() error {
	if t.Title == "" {
		return errors.New("o título é obrigatório")
	}

	switch t.Status {
	case StatusTodo, StatusInProgress, StatusDone:
		return nil // Status é válido
	default:
		return errors.New("status inválido")
	}
}
