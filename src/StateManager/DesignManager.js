import { makeAutoObservable } from "mobx";

class DesignManager {
  rootStore;
  sku = "";
  productName = "";

  activeProductId = null;
  isConfiguring = false;

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

  setIsConfiguring(val) {
    this.isConfiguring = val;
  }

  reset() {
    this.sku = "";
    this.productName = "";
    this.activeProductId = null;
    this.isConfiguring = false;
  }
}

export default DesignManager;
