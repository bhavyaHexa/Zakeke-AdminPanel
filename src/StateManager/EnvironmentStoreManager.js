import { makeAutoObservable, runInAction } from "mobx";

class EnvironmentStoreManager {
  design3dManager;
  
  envFile = null;
  envFileUrl = null;
  envFileId = null;
  isUploading = false;
  uploadError = null;
  rotation = { x: 0, y: 0, z: 0 };
  intensity = 1.0;

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setEnvFile(file) {
    this.envFile = file;
    this.envFileUrl = null;
    this.envFileId = null;
    this.isUploading = false;
    this.uploadError = null;
  }

  async uploadEnvFile(file) {
    this.setEnvFile(file);
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
        throw new Error(err.error || err.message || "Failed to upload environment file");
      }
      
      const data = await response.json();
      const resultData = data.data || data;
      runInAction(() => {
        this.envFileUrl = resultData.url;
        this.envFileId = resultData.id;
        this.isUploading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.uploadError = error.message;
        this.isUploading = false;
      });
      console.error("Failed to upload environment file:", error);
    }
  }

  setRotation(axis, value) {
    this.rotation[axis] = value;
  }

  setIntensity(value) {
    this.intensity = value;
  }
}

export default EnvironmentStoreManager;
