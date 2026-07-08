import { makeAutoObservable } from "mobx";

class DesignManager {
  rootStore;
  sku = "";
  productName = "";

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
}

export default DesignManager;
