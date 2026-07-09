import { makeAutoObservable, runInAction } from "mobx";
import { uploadFile } from "../api/apiClient";

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
    console.log("EnvironmentStoreManager: Starting upload via api client...");

    runInAction(() => {
      this.envFile = file;
      this.envFileUrl = null;
      this.envFileId = null;
      this.isUploading = true;
      this.uploadError = null;
    });
    
    try {
      const response = await uploadFile(file);
      const resultData = response.data || response;
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
