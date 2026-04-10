FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose ports
EXPOSE 5000 3000

# Start both backend and frontend
CMD ["sh", "-c", "node server.js & npm start"]
