import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { observer } from "mobx-react-lite";

export const SceneEnvironment = observer(({ envStore }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene) return;
    
    // Set environment and background intensity
    const intensity = envStore.intensity ?? 1.0;
    scene.environmentIntensity = intensity;
    scene.backgroundIntensity = intensity;
  }, [scene, envStore.intensity]);

  useEffect(() => {
    if (!scene) return;

    // Set environment and background rotation in radians
    const rx = envStore.rotation?.x ?? 0;
    const ry = envStore.rotation?.y ?? 0;
    const rz = envStore.rotation?.z ?? 0;

    if (scene.backgroundRotation && typeof scene.backgroundRotation.set === "function") {
      scene.backgroundRotation.set(rx, ry, rz);
    }
    if (scene.environmentRotation && typeof scene.environmentRotation.set === "function") {
      scene.environmentRotation.set(rx, ry, rz);
    }
  }, [scene, envStore.rotation.x, envStore.rotation.y, envStore.rotation.z]);

  const envUrl = envStore.envFileUrl;

  return (
    <Environment
      key={envUrl || "city"} // Force re-mount when URL changes to correctly reload the map
      files={envUrl || undefined}
      preset={envUrl ? undefined : "city"}
    />
  );
});
