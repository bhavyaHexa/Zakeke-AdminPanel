import { makeAutoObservable } from "mobx";

export class ConfiguratorStore {
  sku = "";
  productName = "";
  glbFile = null;
  customizableAreas = []; // { id, meshTargetName, attributeDisplayName, colorOptions: [{ id, name, hex }] }

  constructor() {
    makeAutoObservable(this);
  }

  setSku = (sku) => {
    this.sku = sku;
  };

  setProductName = (name) => {
    this.productName = name;
  };

  setGlbFile = (file) => {
    this.glbFile = file;
  };

  addArea = () => {
    this.customizableAreas.push({
      id: Date.now().toString(),
      meshTargetName: "",
      attributeDisplayName: "",
      colorOptions: [],
    });
  };

  removeArea = (areaId) => {
    this.customizableAreas = this.customizableAreas.filter((a) => a.id !== areaId);
  };

  updateArea = (areaId, field, value) => {
    const area = this.customizableAreas.find((a) => a.id === areaId);
    if (area) {
      area[field] = value;
    }
  };

  addColorSwatch = (areaId) => {
    const area = this.customizableAreas.find((a) => a.id === areaId);
    if (area) {
      area.colorOptions.push({
        id: Date.now().toString(),
        name: "",
        hex: "#ffffff",
      });
    }
  };

  removeColorSwatch = (areaId, colorId) => {
    const area = this.customizableAreas.find((a) => a.id === areaId);
    if (area) {
      area.colorOptions = area.colorOptions.filter((c) => c.id !== colorId);
    }
  };

  updateColorSwatch = (areaId, colorId, field, value) => {
    const area = this.customizableAreas.find((a) => a.id === areaId);
    if (area) {
      const color = area.colorOptions.find((c) => c.id === colorId);
      if (color) {
        color[field] = value;
      }
    }
  };
}
