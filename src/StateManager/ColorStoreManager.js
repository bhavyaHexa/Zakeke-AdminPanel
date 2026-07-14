import { makeAutoObservable, runInAction } from "mobx";
import { uploadFile } from "../api/apiClient";
import {
  createNewColorSwatch,
  removeColorSwatchFromList,
  updateColorSwatchInList,
  createNewTextureSwatch,
  removeTextureSwatchFromList,
  updateTextureSwatchInList,
} from "../utils/colorUtils";

/**
 * Per-mesh config shape:
 *   meshConfigs: {
 *     [meshName]: {
 *       colors: ColorSwatch[],
 *       textures: TextureSwatch[],
 *       metallic: number,
 *       roughness: number,
 *       metallicGlossMapUrl: string
 *     }
 *   }
 */
class ColorStoreManager {
  design3dManager;

  // GLB file state
  glbFile = null;
  glbFileUrl = null;
  glbFileId = null;
  isUploading = false;
  uploadError = null;

  // Mesh state
  availableMeshes = [];
  selectedMeshes = [];
  activeMesh = null;

  // Per-mesh config
  meshConfigs = {};
  cameraConfig = null;

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, { design3dManager: false });
  }

  // ── GLB upload ─────────────────────────────────────────────────────────────

  setGlbFile(file) {
    this.glbFile = file;
    this.glbFileUrl = null;
    this.glbFileId = null;
    this.isUploading = false;
    this.uploadError = null;
    this.availableMeshes = [];
    this.selectedMeshes = [];
    this.activeMesh = null;
    this.meshConfigs = {};
    this.cameraConfig = null;
    if (this.design3dManager?.environmentStoreManager) {
      this.design3dManager.environmentStoreManager.reset();
    }
  }

  setCameraConfig(config) {
    this.cameraConfig = config;
  }

  async uploadGlbFile(file) {
    this.setGlbFile(file);
    this.isUploading = true;
    this.uploadError = null;

    try {
      const response = await uploadFile(file);
      const resultData = response.data || response;
      runInAction(() => {
        this.glbFileUrl = resultData.url;
        this.glbFileId = resultData.id;
        this.isUploading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.uploadError = error.message;
        this.isUploading = false;
      });
      console.error("Failed to upload GLB file:", error);
    }
  }

  // ── Mesh selection ─────────────────────────────────────────────────────────

  setAvailableMeshes(meshes) {
    this.availableMeshes = meshes;
  }

  setActiveMesh(meshName) {
    this.activeMesh = meshName;
  }

  toggleMeshSelection(meshName) {
    if (this.selectedMeshes.includes(meshName)) {
      this.selectedMeshes = this.selectedMeshes.filter((m) => m !== meshName);
      if (this.activeMesh === meshName) {
        this.activeMesh = null;
      }
    } else {
      this.selectedMeshes.push(meshName);
      this.activeMesh = meshName;
      this._ensureMeshConfig(meshName);
    }
  }

  selectAllMeshes() {
    if (this.selectedMeshes.length === this.availableMeshes.length) {
      this.selectedMeshes = [];
    } else {
      this.selectedMeshes = [...this.availableMeshes];
      this.availableMeshes.forEach((meshName) => {
        this._ensureMeshConfig(meshName);
      });
    }
  }

  // ── Per-mesh config helpers ────────────────────────────────────────────────

  _ensureMeshConfig(meshName) {
    if (!this.meshConfigs[meshName]) {
      this.meshConfigs[meshName] = {
        colors: [],
        textures: [],
        metalnessValue: 0.0,
        metalnessTexture: "",
        roughnessValue: 0.5,
        roughnessTexture: "",
        // legacy compatibility
        metallic: 0.0,
        roughness: 0.5,
        metallicGlossMapUrl: "",
      };
    }
  }

  getMeshConfig(meshName) {
    this._ensureMeshConfig(meshName);
    return this.meshConfigs[meshName];
  }

  // ── Colors per mesh ────────────────────────────────────────────────────────

  addColorToMesh(meshName) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].colors.push(createNewColorSwatch());
  }

  removeColorFromMesh(meshName, colorId) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].colors = removeColorSwatchFromList(
      this.meshConfigs[meshName].colors,
      colorId
    );
  }

  updateColorInMesh(meshName, colorId, field, value) {
    this._ensureMeshConfig(meshName);
    updateColorSwatchInList(this.meshConfigs[meshName].colors, colorId, field, value);
  }

  // ── Textures per mesh ──────────────────────────────────────────────────────

  addTextureToMesh(meshName) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].textures.push(createNewTextureSwatch());
  }

  removeTextureFromMesh(meshName, textureId) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].textures = removeTextureSwatchFromList(
      this.meshConfigs[meshName].textures,
      textureId
    );
  }

  updateTextureInMesh(meshName, textureId, field, value) {
    this._ensureMeshConfig(meshName);
    updateTextureSwatchInList(this.meshConfigs[meshName].textures, textureId, field, value);
  }

  // ── Metallic/Roughness parameters ──────────────────────────────────────────

  updateMeshMetalnessValue(meshName, value) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].metalnessValue = value;
    this.meshConfigs[meshName].metallic = value;
  }

  updateMeshMetalnessTexture(meshName, url) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].metalnessTexture = url;
    this.meshConfigs[meshName].metallicGlossMapUrl = url;
  }

  updateMeshRoughnessValue(meshName, value) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].roughnessValue = value;
    this.meshConfigs[meshName].roughness = value;
  }

  updateMeshRoughnessTexture(meshName, url) {
    this._ensureMeshConfig(meshName);
    this.meshConfigs[meshName].roughnessTexture = url;
  }

  updateMeshMetallic(meshName, value) {
    this.updateMeshMetalnessValue(meshName, value);
  }

  updateMeshRoughness(meshName, value) {
    this.updateMeshRoughnessValue(meshName, value);
  }

  updateMeshMetallicGlossMap(meshName, url) {
    this.updateMeshMetalnessTexture(meshName, url);
  }

  // ── Serialise to payload ───────────────────────────────────────────────────

  get meshPayload() {
    return this.selectedMeshes.map((meshName) => {
      const cfg = this.meshConfigs[meshName] || {
        colors: [],
        textures: [],
        metalnessValue: 0.0,
        metalnessTexture: "",
        roughnessValue: 0.5,
        roughnessTexture: "",
        metallic: 0.0,
        roughness: 0.5,
        metallicGlossMapUrl: "",
      };
      return {
        name: meshName,
        colors: cfg.colors.map((c) => ({ name: c.name, hexCode: c.hex })),
        textures: cfg.textures.map((t) => ({ name: t.name, url: t.url })),
        metalnessValue: cfg.metalnessValue ?? cfg.metallic ?? 0.0,
        metalnessTexture: cfg.metalnessTexture ?? cfg.metallicGlossMapUrl ?? "",
        roughnessValue: cfg.roughnessValue ?? cfg.roughness ?? 0.5,
        roughnessTexture: cfg.roughnessTexture || "",
        // legacy compatibility
        metallic: cfg.metalnessValue ?? cfg.metallic ?? 0.0,
        roughness: cfg.roughnessValue ?? cfg.roughness ?? 0.5,
        metallicGlossMapUrl: cfg.metalnessTexture ?? cfg.metallicGlossMapUrl ?? "",
      };
    });
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  reset() {
    this.glbFile = null;
    this.glbFileUrl = null;
    this.glbFileId = null;
    this.isUploading = false;
    this.uploadError = null;
    this.availableMeshes = [];
    this.selectedMeshes = [];
    this.activeMesh = null;
    this.meshConfigs = {};
  }

  /**
   * Hydrate state from a saved product's `data` object (load-back for editing).
   */
  loadFromProductData(productData) {
    const meshArray = productData.mesh || [];
    const textureArray = productData.textures || [];

    const configs = {};

    meshArray.forEach((meshEntry) => {
      configs[meshEntry.name] = {
        colors: (meshEntry.colors || []).map((c) => ({
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: c.name,
          hex: c.hexCode || "#ffffff",
        })),
        textures: (meshEntry.textures || []).map((t) => ({
          id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: t.name,
          url: t.albedo?.url || t.url || "",
        })),
        metalnessValue: meshEntry.metalnessValue ?? meshEntry.metallic ?? 0.0,
        metalnessTexture: meshEntry.metalnessTexture ?? meshEntry.metallicGlossMapUrl ?? "",
        roughnessValue: meshEntry.roughnessValue ?? meshEntry.roughness ?? 0.5,
        roughnessTexture: meshEntry.roughnessTexture || "",
        // legacy compatibility
        metallic: meshEntry.metalnessValue ?? meshEntry.metallic ?? 0.0,
        roughness: meshEntry.roughnessValue ?? meshEntry.roughness ?? 0.5,
        metallicGlossMapUrl: meshEntry.metalnessTexture ?? meshEntry.metallicGlossMapUrl ?? "",
      };
    });

    // Legacy fallback for textures stored at the top level
    textureArray.forEach((texEntry) => {
      if (!configs[texEntry.name]) {
        configs[texEntry.name] = {
          colors: [],
          textures: [],
          metalnessValue: 0.0,
          metalnessTexture: "",
          roughnessValue: 0.5,
          roughnessTexture: "",
          // legacy compatibility
          metallic: 0.0,
          roughness: 0.5,
          metallicGlossMapUrl: "",
        };
      }
      if (configs[texEntry.name].textures.length === 0) {
        configs[texEntry.name].textures = (texEntry.files || []).map((f) => ({
          id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          url: f.url,
        }));
      }
    });

    runInAction(() => {
      this.meshConfigs = configs;
      this.selectedMeshes = Object.keys(configs);
    });
  }
}

export default ColorStoreManager;
