import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import * as THREE from "three";

export const ModelViewer = observer(({
  blobUrl,
  configuratorStore,
  setHoveredMesh,
  setIsLoading,
  setErrorMsg
}) => {
  // Load GLB using Drei's useGLTF
  // Draco loader is configured with the standard path
  const { scene } = useGLTF(blobUrl || "", "https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  // Control loading states
  useEffect(() => {
    if (scene) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [scene, setIsLoading]);

  // Clone scene to prevent mutating the shared cache
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);
    // Enable shadows for cloned objects
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Cache original materials
  const originalMaterials = useMemo(() => {
    const mats = new Map();
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.name) {
          mats.set(child.name, child.material);
        }
      });
    }
    return mats;
  }, [clonedScene]);

  // Apply visual highlights based on MobX selectedMeshes state
  useEffect(() => {
    if (!clonedScene) return;
    const selected = [...configuratorStore.selectedMeshes];

    clonedScene.traverse((child) => {
      if (child.isMesh && child.name) {
        const origMat = originalMaterials.get(child.name);
        if (selected.includes(child.name)) {
          // Highlight material
          if (!child.userData.highlightMaterial) {
            child.userData.highlightMaterial = new THREE.MeshStandardMaterial({
              color: 0x3b82f6, // Blue select tint
              roughness: 0.4,
              metalness: 0.1,
              transparent: true,
              opacity: 0.8,
              emissive: 0x1d4ed8,
              emissiveIntensity: 0.15,
              depthWrite: true,
            });
          }
          child.material = child.userData.highlightMaterial;
        } else {
          // Restore original
          child.material = origMat;
        }
      }
    });
  }, [clonedScene, configuratorStore.selectedMeshes, originalMaterials]);

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object.isMesh && e.object.name) {
          setHoveredMesh(e.object.name);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredMesh("");
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object.isMesh && e.object.name) {
          configuratorStore.toggleMeshSelection(e.object.name);
        }
      }}
    />
  );
});
