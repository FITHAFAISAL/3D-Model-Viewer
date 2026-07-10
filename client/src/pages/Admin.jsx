import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Admin() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [deleting, setDeleting] = useState(null);

  // Edit modal state
  const [editModal, setEditModal] = useState(null); // model object or null
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editStatus, setEditStatus] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "https://3d-model-viewer-production-b436.up.railway.app";

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/models`);
      if (!res.ok) throw new Error("Failed to fetch");
      setModels(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // --- Upload (create) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      setStatus({ type: "error", message: "Please provide both name and file." });
      return;
    }
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("model", file);

    try {
      await axios.post(`${apiUrl}/upload`, formData);
      setStatus({ type: "success", message: "Model uploaded successfully!" });
      setName("");
      setFile(null);
      const fileInput = document.getElementById("glb-file-input");
      if (fileInput) fileInput.value = "";
      fetchModels();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.error || "Upload failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Edit modal ---
  const openEditModal = (model) => {
    setEditModal(model);
    setEditName(model.name);
    setEditFile(null);
    setEditStatus(null);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditName("");
    setEditFile(null);
    setEditStatus(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName) {
      setEditStatus({ type: "error", message: "Name is required." });
      return;
    }
    setEditLoading(true);
    setEditStatus(null);

    const formData = new FormData();
    formData.append("name", editName);
    if (editFile) formData.append("model", editFile);

    try {
      await axios.put(`${apiUrl}/models/${editModal.id}`, formData);
      setEditStatus({ type: "success", message: "Updated!" });
      fetchModels();
      setTimeout(closeEditModal, 800);
    } catch (error) {
      setEditStatus({
        type: "error",
        message: error.response?.data?.error || "Update failed.",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id, modelName) => {
    if (!window.confirm(`Delete "${modelName}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`${apiUrl}/models/${id}`);
      setStatus({ type: "success", message: `"${modelName}" deleted.` });
      fetchModels();
    } catch (err) {
      setStatus({ type: "error", message: "Failed to delete model." });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container">
      <div className="admin-wrapper">
        <h1 className="page-title">Upload 3D Model</h1>

        <div className="admin-card">
          {status && (
            <div className={`toast toast-${status.type}`}>
              <span className="toast-icon">
                {status.type === "success" ? "✓" : "✕"}
              </span>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="model-name-input">
                Model Name
              </label>
              <input
                id="model-name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Duck"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="glb-file-input">
                Select GLB File
              </label>
              <input
                id="glb-file-input"
                type="file"
                className="form-input"
                accept=".glb"
                onChange={(e) => {
                  if (e.target.files[0]) setFile(e.target.files[0]);
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark btn-block"
              disabled={loading}
            >
              {loading ? "Uploading…" : "Upload Model"}
            </button>
          </form>
        </div>

        {/* Manage Existing Models */}
        {models.length > 0 && (
          <>
            <h2 className="page-title" style={{ marginTop: "2.5rem", fontSize: "1.35rem" }}>
              Manage Models
            </h2>
            <div className="admin-card">
              <div className="model-list">
                {models.map((m) => (
                  <div className="model-list__item" key={m.id}>
                    <div className="model-list__info">
                      <span className="model-list__name">{m.name}</span>
                      <span className="model-list__date">
                        {new Date(m.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="model-list__actions">
                      <button
                        className="btn btn-edit btn-sm"
                        onClick={() => openEditModal(m)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === m.id}
                        onClick={() => handleDelete(m.id, m.name)}
                      >
                        {deleting === m.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---- Edit Modal Overlay ---- */}
      {editModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Model</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>

            {editStatus && (
              <div className={`toast toast-${editStatus.type}`}>
                <span className="toast-icon">
                  {editStatus.type === "success" ? "✓" : "✕"}
                </span>
                {editStatus.message}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Model Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current GLB File</label>
                <div className="current-file">
                  <span className="current-file__icon">📦</span>
                  <span className="current-file__name">{editModal.filename}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Replace with new file (optional)</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".glb"
                  onChange={(e) => {
                    if (e.target.files[0]) setEditFile(e.target.files[0]);
                  }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-green"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel-modal"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;