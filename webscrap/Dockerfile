# Use a imagem de node.js como base
FROM node:18

# Crie e defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos do seu projeto para o diretório de trabalho no contêiner
COPY package.json package-lock.json ./

# Instale as dependências
RUN npm install

# Instale o PM2 globalmente
RUN npm install -g pm2

# Copie o restante dos arquivos do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que a aplicação usa (se necessário)
EXPOSE 3000

# Comando para iniciar seu aplicativo usando PM2 quando o contêiner for executado
CMD ["pm2-runtime", "funcaochamada.js"]
