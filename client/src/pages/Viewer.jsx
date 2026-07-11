import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} dispose={null} />
    </Center>
  );
}

/* Handles zoom in/out/reset by exposing methods via a ref */
function CameraController({ controlRef }) {
  const { camera } = useThree();
  const orbitRef = useRef();
  const defaultPos = useRef(new THREE.Vector3(0, 0, 5));

  // Expose methods to parent
  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        zoomIn: () => {
          camera.position.lerp(new THREE.Vector3(0, 0, 0), 0.15);
          camera.updateProjectionMatrix();
        },
        zoomOut: () => {
          const dir = camera.position.clone().normalize();
          camera.position.add(dir.multiplyScalar(0.5));
          camera.updateProjectionMatrix();
        },
        reset: () => {
          camera.position.copy(defaultPos.current);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.update();
          }
        },
      };
    }
  }, [camera, controlRef]);

  return (
    <OrbitControls
      ref={orbitRef}
      enableZoom
      enablePan
      enableRotate
    />
  );
}

function Viewer() {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cameraCtrl = useRef(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || "https://3d-model-viewer-production-b436.up.railway.app";

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await fetch(`${apiUrl}/models/${id}`);
        if (!response.ok) throw new Error("Model not found");
        const data = await response.json();
        setModel(data);
      } catch (err) {
        setError("Failed to load model details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [id, apiUrl]);

  const handleZoomIn = useCallback(() => cameraCtrl.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => cameraCtrl.current?.zoomOut(), []);
  const handleReset = useCallback(() => cameraCtrl.current?.reset(), []);

  const handleDownload = async () => {
    try {
      const response = await fetch(`${apiUrl}/uploads/${model.filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = model.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download model.");
    }
  };

  if (loading) {
    return (
      <div className="viewer-wrapper">
        <div className="viewer-state">
          <div>
            <div className="spinner"></div>
            <p>Loading model…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewer-wrapper">
        <div className="viewer-state error">{error}</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="viewer-wrapper">
        <div className="viewer-state">No model data.</div>
      </div>
    );
  }

  const modelUrl = `${apiUrl}/uploads/${model.filename}`;

  return (
    <div className="viewer-wrapper">
      {/* Floating back button + model name */}
      <div className="viewer-top-bar" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button className="viewer-back-btn" onClick={() => navigate("/")} title="Back to Home">← Back</button>
        <div className="viewer-model-label" style={{ flexGrow: 1 }}>{model.name}</div>
        <button 
          className="btn btn-green" 
          onClick={handleDownload} 
          style={{ padding: "0.4rem 1rem", fontSize: "0.9rem", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
        >
          Download
        </button>
      </div>

      {/* Right-side control buttons */}
      <div className="viewer-controls-panel">
        <button className="viewer-ctrl-btn" title="Zoom In" onClick={handleZoomIn}>＋</button>
        <button className="viewer-ctrl-btn" title="Zoom Out" onClick={handleZoomOut}>－</button>
        <button className="viewer-ctrl-btn" title="Reset View" onClick={handleReset}>⟳</button>
      </div>

      {/* 3D Canvas */}
      <div className="viewer-canvas-area">
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-3, -3, -2]} intensity={0.3} />
          <Suspense fallback={null}>
            <Model url={modelUrl} />
            <Environment preset="studio" />
          </Suspense>
          <CameraController controlRef={cameraCtrl} />
        </Canvas>
      </div>

      {/* Bottom info bar */}
      <div className="viewer-bottom-bar">
        <span>
          <span className="ctrl-icon">🖱</span> Rotate: Left Mouse Drag
        </span>
        <span>
          <span className="ctrl-icon">⊞</span> Zoom: Scroll
        </span>
        <span>
          <span className="ctrl-icon">🖱</span> Pan: Right Mouse Drag
        </span>
      </div>
    </div>
  );
}

export default Viewer;