import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Lights } from "./Lights";
import { ModelViewer } from "./ModelViewer";
import { DynamicPreviewCamera } from "./utils/DynamicPreviewCamera";
import { SceneEnvironment } from "./SceneEnvironment";

export const SceneContainer = ({
  glbFile,
  blobUrl,
  configuratorStore,
  envStore,
  setIsLoading,
  setErrorMsg,
  setHoveredMesh,
  onFitCameraRef
}) => {
  // Set initial loading state when file changes
  useEffect(() => {
    if (blobUrl) {
      setIsLoading(true);
      setErrorMsg(null);
      setHoveredMesh("");
    }
  }, [blobUrl, setIsLoading, setErrorMsg, setHoveredMesh]);

  return (
    <div className="w-full h-full flex-1 min-h-[300px]">
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Camera Controls */}
        <CameraControls makeDefault />

        {/* Lights (Ambient & Directional) */}
        <Lights />

        {/* Dynamic environment map */}
        <Suspense fallback={null}>
          <SceneEnvironment envStore={envStore} />
        </Suspense>

        {/* Dynamic Model Viewer with Suspense & Custom Fitting */}
        <Suspense fallback={null}>
          {blobUrl ? (
            <ModelViewer
              blobUrl={blobUrl}
              configuratorStore={configuratorStore}
              setHoveredMesh={setHoveredMesh}
              setIsLoading={setIsLoading}
              setErrorMsg={setErrorMsg}
            />
          ) : null}
          <DynamicPreviewCamera onFitCameraRef={onFitCameraRef} blobUrl={blobUrl} configuratorStore={configuratorStore} />
        </Suspense>
      </Canvas>
    </div>
  );
};
