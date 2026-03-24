# Full Stack WhatsApp Clone

This is a simplified full-stack clone of WhatsApp Web, built using React (Vite) for the frontend and Node.js/Express for the backend. It features real-time messaging, user authentication, and data persistence using MongoDB.

## Features
- User Auth (Signup / Login)
- Real-time messaging between users via Socket.IO
- Persistent chat history in MongoDB
- Two-panel layout with visually distinct message formatting
- Addon: Active connection status, real-time typing indicators (skeleton)
- Addon: Distinct styling for View-Once images (UI-only for now)

## Technology Stack
- **Frontend**: React.js, React Router, Vite, Axios, Socket.io-client, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, Socket.IO, Mongoose (MongoDB), JSON Web Tokens (JWT), Bcrypt

## Local Setup Instructions

### 1. Database Setup
You will need a MongoDB instance running.
- Local: Install MongoDB locally (usually runs on `mongodb://localhost:27017`)
- Cloud: Create a free cluster on MongoDB Atlas and get the connection string.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Variables: 
   The backend reads a `.env` file in the `backend` directory. I have provided a default one. Edit it if your MongoDB URI changes:
   ```env
   MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
   PORT=5001
   JWT_SECRET=supersecretpassword123
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `group-harmony-hub-main` folder:
   ```bash
   cd group-harmony-hub-main
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be accessible at [http://localhost:8080/](http://localhost:8080/). Open it in two separate browsers to test messaging between two users!
