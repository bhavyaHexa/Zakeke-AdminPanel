import ColorStoreManager from './ColorStoreManager';
import EnvironmentStoreManager from './EnvironmentStoreManager';

class Design3dManager {
  rootStore;
  colorStoreManager;
  environmentStoreManager;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.colorStoreManager = new ColorStoreManager(this);
    this.environmentStoreManager = new EnvironmentStoreManager(this);
  }
}

export default Design3dManager;
