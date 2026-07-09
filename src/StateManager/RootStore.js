import DesignManager from './DesignManager';
import Design3dManager from './Design3dManager';
import ProductStore from './ProductStore';

class RootStore {
  constructor() {
    this.designManager = new DesignManager(this);
    this.design3dManager = new Design3dManager(this);
    this.productStore = new ProductStore(this);
  }
}

export default RootStore;
