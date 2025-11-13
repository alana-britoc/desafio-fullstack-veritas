# DESAFIO TÉCNICO FULLSTACK - MINI KANBAN

**Veritas Consultoria Empresarial**

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

Sistema de gerenciamento de tarefas estilo Kanban com três colunas fixas, desenvolvido com React no Frontend e Go no Backend.

---

## 1. Visão Geral

Mini Kanban desenvolvido como parte do processo seletivo da Veritas Consultoria Empresarial. O projeto implementa um sistema completo de gerenciamento de tarefas com interface drag-and-drop, API RESTful e persistência em arquivo JSON.

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|---------|
| **Frontend** | React + Vite | 18.x |
| **Backend** | Go (Golang) | 1.21+ |
| **Biblioteca D&D** | @dnd-kit | 6.x |
| **Infraestrutura** | Docker Compose | 3.8 |

---

## 2. Instruções de Execução

### 2.1 Docker Compose (Recomendado)

**Pré-requisito:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

```bash
# Na raiz do projeto
docker-compose up --build
```

**Acesso:** http://localhost:5173

**Portas utilizadas:**
- Frontend: `5173`
- Backend API: `8080`

---

### 2.2 Execução Local (Desenvolvimento)

#### Backend (Go)
```bash
cd backend
go run main.go

# Servidor inicia em http://localhost:8080
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev

# Aplicação inicia em http://localhost:5173
```

---

## 3. Conformidade com o Escopo

O projeto atende 100% do escopo mínimo (MVP) e implementa todos os itens bônus sugeridos no documento de orientação.

### 3.1 Requisitos Obrigatórios

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| Três colunas fixas | Completo | A Fazer, Em Progresso, Concluídas |
| Adicionar tarefas | Completo | Formulário com título obrigatório e descrição opcional |
| Editar tarefas | Completo | Modal com modo leitura/edição |
| Mover entre colunas | Completo | Drag & Drop + menu dropdown |
| Excluir tarefas | Completo | Confirmação via menu do card |
| Feedbacks visuais | Completo | Loading states e mensagens de erro |
| Endpoints RESTful | Completo | GET, POST, PUT, DELETE em /tasks |
| Validações | Completo | Título obrigatório, status válido |
| Configuração CORS | Completo | Via github.com/rs/cors |
| Persistência de dados | Completo | Arquivo tasks.json |

### 3.2 Funcionalidades Bônus Implementadas

| Bônus | Status | Detalhes |
|-------|--------|----------|
| Drag and Drop | Implementado | Biblioteca @dnd-kit com feedback visual |
| Persistência JSON | Implementado | Sincronização automática em backend/tasks.json |
| Docker | Implementado | Multi-stage builds + Docker Compose |
| Controle de concorrência | Implementado | sync.Mutex para evitar race conditions |

---

## 4. Arquitetura e Decisões Técnicas

### 4.1 Frontend (React + Vite)

#### Modal de Edição com Dirty Check
O modal de edição abre em modo leitura por padrão. Ao clicar no botão "Editar", os campos tornam-se editáveis. Se o usuário modificar algum dado e tentar fechar o modal, um alerta de confirmação é exibido para prevenir perda de dados não salvos.

**Motivação:** Reduzir erros do usuário e melhorar a experiência geral de uso.

#### Resolução de Conflito: Drag & Drop vs. Menu
Foi implementada uma lógica de detecção para que o botão de menu (três pontos) tenha prioridade sobre o evento de arrastar:

```javascript
// Previne que o clique no menu inicie um drag
if (event.target.closest('.menu-button')) {
  return;
}
```

**Motivação:** O usuário não deve iniciar um arrasto involuntário ao tentar abrir o menu de ações.

#### Feedback Visual de Loading
Cada operação (criar, editar, mover, excluir) exibe um indicador de carregamento enquanto aguarda a resposta da API, garantindo que o usuário tenha consciência do estado da aplicação.

---

### 4.2 Backend (Go)

#### Sincronização com Mutex
Utilizamos `sync.Mutex` para proteger todas as operações de leitura e escrita no arquivo `tasks.json`:

```go
mu.Lock()
defer mu.Unlock()
// operações no arquivo
```

**Motivação:** Prevenir race conditions quando múltiplas requisições simultâneas tentam modificar o arquivo de persistência.

#### Validação em Struct
A validação de regras de negócio está encapsulada no método `Task.Validate()`:

```go
func (t *Task) Validate() error {
    if strings.TrimSpace(t.Title) == "" {
        return errors.New("título é obrigatório")
    }
    if t.Status != "todo" && t.Status != "in-progress" && t.Status != "done" {
        return errors.New("status inválido")
    }
    return nil
}
```

**Motivação:** Centralizar a lógica de validação e facilitar a manutenção do código.

#### Arquitetura RESTful Minimalista
A estrutura do backend foi mantida simples e direta, com apenas três arquivos principais:
- `main.go`: Inicialização do servidor e configuração de rotas
- `handlers.go`: Implementação dos handlers HTTP
- `models.go`: Definição de structs e métodos de validação

**Motivação:** Facilitar a leitura e avaliação do código pelos recrutadores.

---

### 4.3 Infraestrutura (Docker)

#### Multi-stage Builds
Os Dockerfiles utilizam builds em múltiplos estágios para otimizar o tamanho final das imagens:

- **Stage 1 (builder):** Compila o código-fonte
- **Stage 2 (runner):** Contém apenas o binário executável

**Resultado:** Imagem do backend com aproximadamente 20MB (baseada em Alpine Linux).

```dockerfile
# Stage 1: Build
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

# Stage 2: Runtime
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY tasks.json .
CMD ["./main"]
```

---

## 5. Documentação Visual

O projeto inclui dois diagramas técnicos na pasta `/docs`:

### 5.1 User Flow (Obrigatório)
Ilustra a jornada completa do usuário através das quatro operações principais:
- Adicionar nova tarefa
- Mover tarefa entre colunas
- Editar tarefa existente
- Excluir tarefa

### 5.2 Data Flow (Opcional)
Demonstra a arquitetura técnica de comunicação entre as camadas:
- Frontend (React + Vite)
- Middlewares (CORS, Router)
- Backend (Handlers, Validações)
- Persistência (tasks.json)

---

## 6. Próximos Passos e Melhorias Futuras

Funcionalidades que seriam implementadas em uma versão de produção:

### 6.1 Testes
- Testes unitários para o backend (Go)
- Testes unitários para componentes React
- Testes de integração E2E (Playwright ou Cypress)

### 6.2 Segurança e Autenticação
- Implementação de autenticação via JWT
- Autorização baseada em roles
- Rate limiting na API

### 6.3 Persistência Avançada
- Migração para banco de dados relacional (PostgreSQL)
- Sistema de migrations
- Backup automatizado

### 6.4 Deploy e CI/CD
- Pipeline de CI/CD com GitHub Actions
- Deploy automatizado (Frontend: Vercel, Backend: Railway/Render)
- Monitoramento e logs centralizados

### 6.5 Funcionalidades Adicionais
- Sistema de busca e filtros
- Tags e categorização de tarefas
- Múltiplos boards por usuário
- Modo escuro
- Responsividade completa para mobile


---

## 7. Licença

Este projeto foi desenvolvido exclusivamente para fins de avaliação técnica e não possui licença de uso comercial.