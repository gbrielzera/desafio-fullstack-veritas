# Desafio Fullstack Veritas - Mini Kanban (React + Go)

Implementação do Desafio Fullstack "Mini Kanban" da Veritas Consultoria Empresarial, utilizando React no frontend e Go no backend.

O objetivo era uma aplicação de quadro Kanban com 3 colunas (A Fazer, Em Progresso, Concluídas) que permite o gerenciamento de tarefas (CRUD), com persistência de dados.

## ✨ Funcionalidades

O projeto implementa todo o escopo mínimo (MVP) e também todos os bônus sugeridos:

  * **CRUD Completo:** Crie, leia, edite e exclua tarefas.
  * **Colunas Fixas:** As tarefas são organizadas nas colunas "A Fazer", "Em Progresso" e "Concluídas".
  * **API RESTful em Go:** Um backend robusto que serve os dados das tarefas.
  * **Feedbacks Visuais:** Indicadores de "Loading" e "Erro" na interface.

### Bônus Implementados

  * ✅ **Drag and Drop:** As tarefas podem ser movidas entre as colunas usando "arrastar e soltar" (com `react-beautiful-dnd`).
  * ✅ **Persistência em Arquivo JSON:** O backend (Go) salva todas as alterações no arquivo `backend/tasks.json`, garantindo que os dados não sejam perdidos ao reiniciar o servidor.
  * ✅ **Docker:** A aplicação (frontend e backend) é totalmente "containerizada" e orquestrada com `docker-compose`.
  * ✅ **Testes Simples:** O backend possui testes unitários simples (`go test`) para os *handlers* da API.

-----

## 🚀 Como Rodar o Projeto

Existem duas formas principais de rodar a aplicação: **Docker** (recomendado, mais fácil) ou **Localmente** (requer setup do Go e Node).

### Pré-requisitos

  * [Go](https://go.dev/doc/install) (v1.18+ ou superior)
  * [Node.js](https://nodejs.org/) (v16+ ou superior)
  * [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o Método 1)

-----

### Método 1: Rodar com Docker (Recomendado)

Este método sobe o backend e o frontend em containers, de forma isolada e sem precisar instalar Go ou Node localmente.

1.  **Abra o Docker Desktop** e garanta que ele esteja rodando.

2.  **Na raiz do projeto** (onde está o arquivo `docker-compose.yml`), abra um terminal e execute:

    ```bash
    docker-compose up --build
    ```

3.  Aguarde o processo de *build* e inicialização dos containers.

4.  Acesse o projeto no seu navegador:

      * Frontend (React): `http://localhost:3000`

O backend estará rodando em `http://localhost:8080`, mas o frontend já está configurado para se comunicar com ele.

-----

### Método 2: Rodar Localmente (Nativo)

Este método requer dois terminais separados.

#### Terminal 1: Rodar o Backend (Go)

1.  Navegue até a pasta `backend`:
    ```bash
    cd backend
    ```
2.  Instale as dependências do Go (apenas na primeira vez):
    ```bash
    go get .
    ```
3.  Inicie o servidor Go:
    ```bash
    go run .
    # (Ou: go run main.go models.go handlers.go)
    ```
4.  O backend estará rodando em `http://localhost:8080`.

#### Terminal 2: Rodar o Frontend (React)

1.  Navegue até a pasta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instale as dependências do Node (apenas na primeira vez):
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do React:
    ```bash
    npm start
    ```
4.  O navegador abrirá automaticamente em `http://localhost:3000`.

-----

### Método 3: Rodar os Testes (Backend)

Para verificar os testes unitários simples do backend:

1.  Navegue até a pasta `backend`:
    ```bash
    cd backend
    ```
2.  Execute o comando de teste do Go (use `-v` para modo *verbose*):
    ```bash
    go test -v
    ```

-----

## 🔧 Decisões Técnicas Tomadas

Aqui estão algumas das principais decisões técnicas do projeto:

### Backend (Go)

  * **Roteamento:** Foi utilizado o `gorilla/mux` para criar as rotas da API. Ele é mais flexível e poderoso que a biblioteca `net/http` padrão, facilitando a definição de métodos (GET, POST) e variáveis de URL (como o `{id}`).
  * **CORS:** O `gorilla/handlers` foi usado para uma configuração de CORS (Cross-Origin Resource Sharing) simples e explícita, permitindo que o `localhost:3000` (React) acesse o `localhost:8080` (Go).
  * **Persistência (Bônus):** Para a persistência em JSON, foi usado um `sync.RWMutex` (Mutex de Leitura/Escrita). Isso previne *race conditions*, garantindo que, se duas requisições tentarem escrever no arquivo ao mesmo tempo, elas sejam enfileiradas e a integridade do mapa `tasks` e do `tasks.json` seja mantida.
  * **Testes (Bônus):** Os testes (`handlers_test.go`) usam `net/http/httptest` para simular requisições HTTP aos *handlers* sem precisar levantar um servidor real, tornando os testes rápidos e independentes.

### Frontend (React)

  * **API Client:** Foi usado o `axios` para as chamadas de API. Ele simplifica o tratamento de JSON e a captura de erros em comparação com o `fetch` nativo.
  * **Gerenciamento de Estado:** Foi utilizado apenas os Hooks nativos do React (`useState`, `useEffect`, `useCallback`). Para a complexidade desta aplicação, eles são suficientes e evitam a necessidade de bibliotecas externas como Redux ou Zustand.
  * **Drag and Drop (Bônus):** A biblioteca `hello-pangea/dnd` foi escolhida por sua API clara e boa integração com o React, permitindo a implementação do bônus de "arrastar e soltar". A lógica de atualização (via `onDragEnd`) faz uma "atualização otimista", mudando a UI primeiro e depois enviando a requisição para a API.

### DevOps (Docker)

  * **Multi-Stage Builds:** Os `Dockerfile`s (tanto do backend quanto do frontend) usam *multi-stage builds*. Isso otimiza drasticamente o tamanho das imagens finais:
      * O *builder* do Go compila o binário, e a imagem final (baseada em `alpine`) contém *apenas* esse binário compilado, sem todo o SDK do Go.
      * O *builder* do React (Node.js) gera os arquivos estáticos (`build`), e a imagem final (baseada em `nginx`) contém *apenas* esses arquivos, sem `node_modules`.

-----

## 💡 Limitações e Melhorias Futuras

Apesar de funcional, o projeto possui limitações naturais de um desafio técnico:

  * **Limitação (Persistência):** A persistência em `tasks.json` não é recomendada para produção pois não é um banco de dados transacional e pode ficar lenta ou falhar se o arquivo crescer muito.
      * **Melhoria:** Substituir o armazenamento em JSON por um banco de dados real, como **PostgreSQL** ou **SQLite**
  * **Limitação (Testes):** Os testes de backend são simples e cobrem apenas o "caminho feliz".
      * **Melhoria:** Adicionar testes de *edge case* (ex: tentar criar tarefa sem título, deletar uma tarefa que não existe) e implementar testes de frontend.
  * **Limitação (UI/UX):** O tratamento de erros na UI é básico (uma mensagem de erro no topo).
      * **Melhoria:** Implementar um sistema de notificações mais elegante para feedback de sucesso ou erro.