# Auth Service Dockerfile
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the service code to the container
COPY . .

RUN npm install

# Start the application
CMD ["node", "index.js"]
