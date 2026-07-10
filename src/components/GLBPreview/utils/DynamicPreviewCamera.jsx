import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export const DynamicPreviewCamera = ({ onFitCameraRef, blobUrl, configuratorStore }) => {
  const { camera, controls, scene } = useThree();

  const fit = (enableTransition = false) => {
    if (!camera || !controls) return;

    // Calculate bounding box of the loaded model(s) inside the scene
    const box = new THREE.Box3();
    let hasMeshes = false;

    scene.traverse((child) => {
      if (child.isMesh) {
        box.expandByObject(child);
        hasMeshes = true;
      }
    });

    if (!hasMeshes) return;

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1.0;

    // Adjust camera clipping planes to prevent clipping
    camera.near = Math.max(0.01, maxDim / 1000);
    camera.far = Math.max(1000.0, maxDim * 10.0);
    camera.updateProjectionMatrix();

    // Set control distance limits
    controls.minDistance = maxDim * 0.1;
    controls.maxDistance = maxDim * 4.0;

    // Fit camera to bounding box using camera-controls' built-in fitToBox method
    controls.fitToBox(box, enableTransition, {
      paddingLeft: 0.15,
      paddingRight: 0.15,
      paddingTop: 0.15,
      paddingBottom: 0.15
    });

    const cameraConfig = {
      position: camera.position.clone().toArray(),
      target: controls.getTarget(new THREE.Vector3()).toArray(),
      fov: camera.fov,
      near: camera.near,
      far: camera.far,
      minDistance: controls.minDistance,
      maxDistance: controls.maxDistance
    };

    if (configuratorStore && configuratorStore.setCameraConfig) {
      configuratorStore.setCameraConfig(cameraConfig);
    }

    console.log("DynamicPreviewCamera: Fitted Camera Values:", {
      ...cameraConfig,
      maxDim
    });
  };

  useEffect(() => {
    if (onFitCameraRef) {
      onFitCameraRef.current = () => fit(true); // Smooth transition on manual reset
    }
  }, [camera, controls, scene, onFitCameraRef]);

  useEffect(() => {
    if (blobUrl) {
      // Fit camera after a short delay to ensure R3F has compiled and positioned the meshes
      const timer = setTimeout(() => {
        fit(false); // Instant fit on model load
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [blobUrl, scene, camera, controls]);

  return null;
};
