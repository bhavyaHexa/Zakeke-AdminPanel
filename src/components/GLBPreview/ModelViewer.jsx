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
        url: cfg?.textures?.[0]?.url,
        metalnessValue: cfg?.metalnessValue ?? cfg?.metallic,
        metalnessTexture: cfg?.metalnessTexture ?? cfg?.metallicGlossMapUrl,
        roughnessValue: cfg?.roughnessValue ?? cfg?.roughness,
        roughnessTexture: cfg?.roughnessTexture,
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
        
        // Albedo configurations
        const hex = cfg?.colors?.[0]?.hex;
        const textureUrl = cfg?.textures?.[0]?.url;

        // Metallic/Roughness parameters
        const metalnessValue = cfg?.metalnessValue ?? cfg?.metallic;
        const metalnessTexture = cfg?.metalnessTexture ?? cfg?.metallicGlossMapUrl;
        const roughnessValue = cfg?.roughnessValue ?? cfg?.roughness;
        const roughnessTexture = cfg?.roughnessTexture;

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

        // Apply metallic
        if (metalnessValue !== undefined) {
          targetMat.metalness = metalnessValue;
        } else {
          targetMat.metalness = origMat.metalness;
        }

        // Apply roughness
        if (roughnessValue !== undefined) {
          targetMat.roughness = roughnessValue;
        } else {
          targetMat.roughness = origMat.roughness;
        }

        // Apply metalness texture map
        if (metalnessTexture) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(metalnessTexture, (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            targetMat.metalnessMap = tex;
            targetMat.needsUpdate = true;
          });
        } else {
          targetMat.metalnessMap = origMat.metalnessMap;
        }

        // Apply roughness texture map
        if (roughnessTexture) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(roughnessTexture, (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            targetMat.roughnessMap = tex;
            targetMat.needsUpdate = true;
          });
        } else {
          targetMat.roughnessMap = origMat.roughnessMap;
        }

        // Highlight active mesh using an orange outline glow
        let outlineMesh = child.userData.outlineMesh;
        if (child.name === configuratorStore.activeMesh) {
          if (!outlineMesh) {
            const outlineMaterial = new THREE.MeshBasicMaterial({
              color: 0xff5500, // Vibrant orange outline
              side: THREE.BackSide,
              transparent: true,
              opacity: 0.85
            });
            outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial);
            outlineMesh.scale.set(1.02, 1.02, 1.02);
            child.add(outlineMesh);
            child.userData.outlineMesh = outlineMesh;
          }
          outlineMesh.visible = true;
          child.material = targetMat;
        } else {
          if (outlineMesh) {
            outlineMesh.visible = false;
          }
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
