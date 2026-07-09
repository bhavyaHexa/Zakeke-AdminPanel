import { makeAutoObservable } from "mobx";

class DesignManager {
  rootStore;
  sku = "";
  productName = "";

  activeProductId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  setSku(sku) {
    this.sku = sku;
  }

  setProductName(name) {
    this.productName = name;
  }

  setActiveProductId(id) {
    this.activeProductId = id;
  }

  reset() {
    this.sku = "";
    this.productName = "";
    this.activeProductId = null;
  }
}

export default DesignManager;
