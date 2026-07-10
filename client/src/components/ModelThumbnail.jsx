import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";
import ErrorBoundary from "./ErrorBoundary";

function GLBModel({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene.clone()} dispose={null} />
    </Center>
  );
}

function ThumbnailCanvas({ url }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 3.5], fov: 40 }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 4, 4]} intensity={0.8} />
      <directionalLight position={[-2, -2, -1]} intensity={0.3} />
      <Suspense fallback={null}>
        <GLBModel url={url} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={3}
      />
    </Canvas>
  );
}

function ModelThumbnail({ url }) {
  return (
    <ErrorBoundary>
      <ThumbnailCanvas url={url} />
    </ErrorBoundary>
  );
}

export default ModelThumbnail;
