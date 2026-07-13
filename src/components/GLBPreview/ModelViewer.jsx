import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
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

  // Parse all available meshes from the loaded 3D scene
  useEffect(() => {
    if (scene) {
      const meshes = [];
      scene.traverse((child) => {
        if (child.isMesh && child.name) {
          meshes.push(child.name);
        }
      });
      const uniqueMeshes = [...new Set(meshes)];
      if (uniqueMeshes.length > 0) {
        configuratorStore.setAvailableMeshes(uniqueMeshes);
      }
    }
  }, [scene, configuratorStore]);

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

  // Serialize config values to force react hook re-trigger when configs change
  const configTrigger = JSON.stringify(
    configuratorStore.availableMeshes.map(mesh => {
      const cfg = configuratorStore.getMeshConfig(mesh);
      return {
        mesh,
        hex: cfg?.colors?.[0]?.hex,
        url: cfg?.textures?.[0]?.url
      };
    })
  );

  // Apply visual colors, textures, and active highlights based on store state
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if (child.isMesh && child.name) {
        const origMat = originalMaterials.get(child.name);
        if (!origMat) return;

        // Get config from store
        const cfg = configuratorStore.getMeshConfig(child.name);
        const hex = cfg?.colors?.[0]?.hex;
        const textureUrl = cfg?.textures?.[0]?.url;

        // Clone material to apply custom changes dynamically
        let targetMat = child.userData.customMaterial;
        if (!targetMat) {
          targetMat = origMat.clone();
          child.userData.customMaterial = targetMat;
        }

        // Apply hex color
        if (hex) {
          targetMat.color.set(hex);
        } else {
          targetMat.color.copy(origMat.color);
        }

        // Apply texture map
        if (textureUrl) {
          // Load texture map dynamically
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(textureUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            targetMat.map = tex;
            targetMat.needsUpdate = true;
          });
        } else {
          targetMat.map = origMat.map;
        }

        // Highlight active mesh using a vibrant red color
        if (child.name === configuratorStore.activeMesh) {
          let activeHighlightMat = child.userData.activeHighlightMat;
          if (!activeHighlightMat) {
            activeHighlightMat = targetMat.clone();
            activeHighlightMat.color.set(0xdc2626); // Red color
            activeHighlightMat.emissive.set(0xef4444); // Glowing red
            activeHighlightMat.emissiveIntensity = 0.8;
            child.userData.activeHighlightMat = activeHighlightMat;
          } else {
            activeHighlightMat.color.set(0xdc2626);
            activeHighlightMat.emissive.set(0xef4444);
            activeHighlightMat.emissiveIntensity = 0.8;
          }
          child.material = activeHighlightMat;
        } else {
          // Clear active emissive overlay
          targetMat.emissive.set(0x000000);
          targetMat.emissiveIntensity = 0;
          child.material = targetMat;
        }
      }
    });
  }, [clonedScene, configuratorStore.activeMesh, configTrigger, originalMaterials]);

  if (!clonedScene) return null;

  return (
    <>
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
      />
    </>
  );
});
