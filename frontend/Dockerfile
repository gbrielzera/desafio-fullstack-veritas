# ----- Estágio de Build (Node) -----
FROM node:18-alpine AS builder

WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Roda o script de 'build' do React
RUN npm run build

# ----- Estágio de Produção (Nginx) -----
# Usamos a imagem oficial do Nginx
FROM nginx:1.25-alpine

# Copia os arquivos estáticos 'buildados' do estágio 'builder' 
# para a pasta padrão que o Nginx usa para servir HTML
COPY --from=builder /app/build /usr/share/nginx/html

# O Nginx já expõe a porta 80 por padrão,
# então não precisamos do comando 'EXPOSE'.

# O comando 'CMD' padrão do Nginx irá iniciar o servidor.