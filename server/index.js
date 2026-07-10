
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
app.use("/uploads", express.static(uploadDir));

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

// Create models table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

(async () => {
  try {
    await db.query(createTableQuery);
    console.log("✅ Models table ready");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
})();

// GET /models - Get all models
app.get("/models", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, filename, uploaded_at FROM models ORDER BY uploaded_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching models:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /models/:id - Get a single model by ID
app.get("/models/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, filename, uploaded_at FROM models WHERE id = ?", [req.params.id]);
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
    const result = await db.query(
      "INSERT INTO models (name, filename) VALUES (?, ?)",
      [name, filename]
    );
    const modelId = result[0].insertId;
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
    const [rows] = await db.query("SELECT filename FROM models WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Model not found" });
    }
    const filename = rows[0].filename;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM models WHERE id = ?", [id]);
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

    const [rows] = await db.query("SELECT * FROM models WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Model not found" });
    }

    let filename = rows[0].filename;

    // If a new file was uploaded, delete the old one and use the new filename
    if (req.file) {
      const oldPath = path.join(uploadDir, filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      filename = req.file.filename;
    }

    const updatedName = name || rows[0].name;
    await db.query("UPDATE models SET name = ?, filename = ? WHERE id = ?", [updatedName, filename, id]);
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