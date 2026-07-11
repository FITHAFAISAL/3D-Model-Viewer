import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ModelThumbnail from "../components/ModelThumbnail";

function ViewerLanding() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${apiUrl}/models`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setModels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [apiUrl]);

  return (
    <div className="container page-container">
      <h1 className="page-title">Select a Model to View</h1>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
        Choose a 3D model below to open it in the interactive viewer.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div className="spinner"></div>
          <p style={{ color: "var(--text-muted)" }}>Loading models…</p>
        </div>
      ) : models.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__text">No models uploaded yet.</p>
          <Link to="/admin" className="btn btn-green">
            Upload a Model
          </Link>
        </div>
      ) : (
        <div className="models-grid">
          {models.map((model) => (
            <Link
              to={`/viewer/${model.id}`}
              key={model.id}
              className="model-card"
              style={{ textDecoration: "none" }}
            >
              <div className="model-card__preview">
                <ModelThumbnail url={`${apiUrl}/uploads/${model.filename}`} />
              </div>
              <div className="model-card__body">
                <div className="model-card__name">{model.name}</div>
                <span className="btn btn-green">Open in Viewer</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewerLanding;
