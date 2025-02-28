# Usa a imagem oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Instala o PNPM globalmente
RUN npm install -g pnpm

# Copia apenas os arquivos essenciais para instalar dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências antes de copiar o restante do código
RUN pnpm install --frozen-lockfile

# Agora copia todo o código-fonte do projeto
COPY . .

# 🔍 Verifica se os arquivos foram copiados corretamente
RUN ls -l /app

# Gera o Prisma Client
RUN pnpm prisma generate

# Expõe a porta do servidor
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["pnpm", "dev"]
