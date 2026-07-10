import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ModelThumbnail from "../components/ModelThumbnail";

function Home() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || "https://3d-model-viewer-production-b436.up.railway.app";

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${apiUrl}/models`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError("Failed to load models.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="container page-container">
        <h1 className="page-title">Available 3D Models</h1>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <div className="spinner"></div>
          <p style={{ color: "var(--text-muted)" }}>Loading models…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-container">
        <h1 className="page-title">Available 3D Models</h1>
        <div className="toast toast-error">
          <span className="toast-icon">✕</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container">
      <h1 className="page-title">Available 3D Models</h1>

      {models.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__text">No models uploaded yet.</p>
          <Link to="/admin" className="btn btn-green">
            Upload Your First Model
          </Link>
        </div>
      ) : (
        <div className="models-grid">
          {models.map((model) => (
            <div className="model-card" key={model.id}>
              <div className="model-card__preview">
                <ModelThumbnail
                  url={`${apiUrl}/uploads/${model.filename}`}
                />
              </div>
              <div className="model-card__body">
                <div className="model-card__name">{model.name}</div>
                <div className="model-card__date">
                  {new Date(model.uploaded_at).toLocaleDateString()}
                </div>
                <Link to={`/viewer/${model.id}`} className="btn btn-green">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;