import { makeAutoObservable, runInAction } from "mobx";
import { createNewColorSwatch, removeColorSwatchFromList, updateColorSwatchInList } from "../utils/colorUtils";

class ColorStoreManager {
  design3dManager;
  
  glbFile = null;
  glbFileUrl = null;
  glbFileId = null;
  isUploading = false;
  uploadError = null;
  availableMeshes = [];
  selectedMeshes = [];
  colorOptions = [];

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setGlbFile(file) {
    this.glbFile = file;
    this.glbFileUrl = null;
    this.glbFileId = null;
    this.isUploading = false;
    this.uploadError = null;
    this.availableMeshes = [];
    this.selectedMeshes = [];
    this.colorOptions = [];
  }

  async uploadGlbFile(file) {
    this.setGlbFile(file);
    this.isUploading = true;
    this.uploadError = null;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://5nvt4h41-3000.inc1.devtunnels.ms';
      const response = await fetch(`${backendUrl}/shopify/upload`, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || "Failed to upload GLB file");
      }
      
      const data = await response.json();
      const resultData = data.data || data;
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

  setAvailableMeshes(meshes) {
    this.availableMeshes = meshes;
  }

  toggleMeshSelection(meshName) {
    if (this.selectedMeshes.includes(meshName)) {
      this.selectedMeshes = this.selectedMeshes.filter(m => m !== meshName);
    } else {
      this.selectedMeshes.push(meshName);
    }
  }

  selectAllMeshes() {
    if (this.selectedMeshes.length === this.availableMeshes.length) {
      this.selectedMeshes = []; // deselect all
    } else {
      this.selectedMeshes = [...this.availableMeshes]; // select all
    }
  }

  addColorSwatch() {
    this.colorOptions.push(createNewColorSwatch());
  }

  removeColorSwatch(colorId) {
    this.colorOptions = removeColorSwatchFromList(this.colorOptions, colorId);
  }

  updateColorSwatch(colorId, field, value) {
    updateColorSwatchInList(this.colorOptions, colorId, field, value);
  }
}

export default ColorStoreManager;
