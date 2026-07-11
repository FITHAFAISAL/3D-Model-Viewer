
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // This is now a mysql2/promise pool
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
// Serve files from the database
app.get("/uploads/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { rows } = await db.query("SELECT file_data FROM models WHERE filename = $1", [filename]);
    
    if (rows.length === 0 || !rows[0].file_data) {
      // Fallback to local filesystem if the file_data is not in the database
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      return res.status(404).json({ error: "File not found" });
    }
    
    res.setHeader("Content-Type", "model/gltf-binary");
    res.send(rows[0].file_data);
  } catch (err) {
    console.error("Error serving file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Only allow .glb files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".glb") {
    cb(null, true);
  } else {
    cb(new Error("Only .glb files are allowed."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });



// GET /models - Get all models
app.get("/models", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT id, name, filename, uploaded_at FROM models ORDER BY uploaded_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching models:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /models/:id - Get a single model by ID
app.get("/models/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT id, name, filename, uploaded_at FROM models WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching model:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /upload - Upload a new model
app.post("/upload", upload.single("model"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Model name is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filename = req.file.filename;
    const filePath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filePath);

    const result = await db.query(
      "INSERT INTO models (name, filename, file_data) VALUES ($1, $2, $3) RETURNING id",
      [name, filename, fileBuffer]
    );

    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const modelId = result.rows[0].id;
    res.status(201).json({ id: modelId, name, filename, uploaded_at: new Date() });
  } catch (err) {
    console.error("Error uploading model:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /models/:id - Delete a model
app.delete("/models/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query("SELECT filename FROM models WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Model not found" });
    }
    const filename = rows[0].filename;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM models WHERE id = $1", [id]);
    res.json({ message: "Model deleted successfully" });
  } catch (err) {
    console.error("Error deleting model:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /models/:id - Update model name and optionally replace file
app.put("/models/:id", upload.single("model"), async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    const { rows } = await db.query("SELECT * FROM models WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Model not found" });
    }

    let filename = rows[0].filename;

    const updatedName = name || rows[0].name;
    let updateQuery = "UPDATE models SET name = $1, filename = $2 WHERE id = $3";
    let queryParams = [updatedName, filename, id];

    // If a new file was uploaded, read buffer and use the new filename
    if (req.file) {
      filename = req.file.filename;
      const filePath = req.file.path;
      const fileBuffer = await fs.promises.readFile(filePath);
      
      updateQuery = "UPDATE models SET name = $1, filename = $2, file_data = $4 WHERE id = $3";
      queryParams = [updatedName, filename, id, fileBuffer];
      
      // Clean up temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query(updateQuery, queryParams);
    res.json({ id, name: updatedName, filename });
  } catch (err) {
    console.error("Error updating model:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Multer file-filter rejection
  if (err.message === "Only .glb files are allowed.") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});