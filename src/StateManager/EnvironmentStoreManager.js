import { makeAutoObservable } from "mobx";

class EnvironmentStoreManager {
  design3dManager;
  
  envFile = null;
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
  }

  setRotation(axis, value) {
    this.rotation[axis] = value;
  }

  setIntensity(value) {
    this.intensity = value;
  }
}

export default EnvironmentStoreManager;
