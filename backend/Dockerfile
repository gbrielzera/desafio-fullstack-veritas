# ----- Estágio de Build -----
# Usamos a imagem oficial do Go para compilar a aplicação
FROM golang:1.25-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de módulo e baixa as dependências
COPY go.mod go.sum ./
RUN go mod download

# Copia todo o código-fonte do backend
COPY . .

# Compila a aplicação. 
# CGO_ENABLED=0 desabilita o CGO (para compilação estática)
# -o /bin/server cria um executável chamado 'server' na pasta /bin
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/server .

# ----- Estágio de Produção -----
# Usamos uma imagem 'alpine' mínima, que é muito leve
FROM alpine:latest

# Copia APENAS o executável compilado do estágio 'builder'
COPY --from=builder /bin/server /bin/server

# Copia o arquivo JSON de persistência (se existir) para o container
# Isso garante que suas tarefas salvas sejam carregadas
COPY tasks.json /tasks.json
# Define o WORKDIR para onde o tasks.json estará
WORKDIR /
# (Nota: o handlers.go salva 'tasks.json' no diretório atual, que agora é /)

# Expõe a porta que o Go usa (definida no main.go)
EXPOSE 8080

# Comando para executar o servidor quando o container iniciar
CMD ["/bin/server"]