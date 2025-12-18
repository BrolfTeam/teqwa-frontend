# Step 1: Build the React app
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: In production, we just need the 'dist' folder
# We use a dummy command because Nginx will actually serve the files
FROM alpine
COPY --from=build /app/dist /app/dist
CMD ["echo", "Frontend build complete"]