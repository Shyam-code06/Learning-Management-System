# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Expose port 5173 (default Vite port)
EXPOSE 5173

# Run Vite dev server bound to 0.0.0.0 so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
