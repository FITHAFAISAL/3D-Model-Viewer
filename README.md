# 3D Model Viewer

A modern, responsive web application for uploading, managing, and viewing interactive 3D models in GLB format. Built with React (Vite), Three.js, Express, and MySQL.

## Features

- **Interactive 3D Viewer:** Full-screen viewer for GLB models with orbit controls (rotate, zoom, pan) and custom control buttons.
- **Admin Dashboard:** Secure interface to upload new GLB models and manage existing ones.
- **Model Management:** Edit model names, replace files, and delete models with a seamless UI.
- **Live Previews:** The home page features a grid of uploaded models, each displaying a live, auto-rotating 3D thumbnail.
- **Responsive Design:** Polished UI that works perfectly on desktop, tablet, and mobile devices.
- **Robust Error Handling:** File validation (only `.glb` files allowed) and graceful fallbacks for missing or corrupt files.

## Tech Stack

### Frontend (Client)
- **Framework:** React + Vite
- **Routing:** React Router v6
- **3D Rendering:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **HTTP Client:** Axios
- **Styling:** Custom Vanilla CSS (Responsive, Dark Mode accents)

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (using `mysql2/promise`)
- **File Uploads:** Multer

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## Installation & Setup

### 1. Database Setup
1. Open your MySQL client and create a new database:
   ```sql
   CREATE DATABASE 3d_models_db;
   ```
2. You can create a `.env` file in the `server` directory (or modify `server/db.js` directly) to configure your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=3d_models_db
   ```
   *(Note: The server will automatically create the `models` table on startup if it doesn't exist).*

### 2. Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node index.js
   ```
   The server will start on `http://localhost:5000`.

### 3. Client Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5174` (or another port specified by Vite).

## Usage

1. **Home Page (`/`)**: View a grid of all available models with live 3D previews. Click "View" to open the interactive viewer.
2. **Viewer Page (`/viewer/:id`)**: Interact with the model using your mouse (drag to rotate, right-click to pan, scroll to zoom) or use the on-screen buttons.
3. **Admin Page (`/admin`)**: 
   - Upload new `.glb` files.
   - Click "Edit" on an existing model to change its name or replace the file via a popup modal.
   - Click "Delete" to remove a model completely.

## Folder Structure

```
3d-model-viewer/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Navbar, ModelThumbnail, ErrorBoundary
│   │   ├── pages/          # Home, Admin, Viewer
│   │   ├── App.jsx         # Routes
│   │   ├── main.jsx        # Entry point
│   │   └── styles.css      # Custom UI styles
│   ├── index.html
│   └── package.json
│
├── server/                 # Express Backend
│   ├── uploads/            # Directory where GLB files are stored
│   ├── db.js               # Database connection
│   ├── index.js            # Main server logic & API routes
│   └── package.json
│
└── README.md
```

## License
MIT License
