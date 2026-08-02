# Step 1: Use official Node.js lightweight Alpine base image
FROM node:20-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the backend source code
COPY . .

# Step 6: Expose backend port
EXPOSE 5000

# Step 7: Start backend server
CMD ["npm", "start"]
