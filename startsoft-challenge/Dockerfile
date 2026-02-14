# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do projeto
COPY . .

# Next dev
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
