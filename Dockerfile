# Usa a imagem oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala o PNPM globalmente
RUN npm install -g pnpm

# Copia apenas os arquivos essenciais para instalação de dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências primeiro para melhor cache no Docker
RUN pnpm install --frozen-lockfile

# Agora copia todo o projeto (código-fonte)
COPY . .

# Gera o Prisma Client
RUN pnpm prisma generate

# Expõe a porta do servidor
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["pnpm", "dev"]
