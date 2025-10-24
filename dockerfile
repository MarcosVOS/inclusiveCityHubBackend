# Etapa de build / runtime
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json antes para instalar dependências
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia todo o código da aplicação
COPY . .

# Expõe a porta que sua aplicação roda
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
