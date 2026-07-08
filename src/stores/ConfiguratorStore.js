import { makeAutoObservable } from "mobx";

export class ConfiguratorStore {
  sku = "";
  productName = "";
  glbFile = null;
  availableMeshes = []; // Extracted from GLB
  selectedMeshes = []; // Names of selected meshes
  colorOptions = []; // { id, name, hex }

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
    // Reset meshes and options when new file uploaded
    this.availableMeshes = [];
    this.selectedMeshes = [];
    this.colorOptions = [];
  };

  setAvailableMeshes = (meshes) => {
    this.availableMeshes = meshes;
  };

  toggleMeshSelection = (meshName) => {
    if (this.selectedMeshes.includes(meshName)) {
      this.selectedMeshes = this.selectedMeshes.filter(m => m !== meshName);
    } else {
      this.selectedMeshes.push(meshName);
    }
  };

  selectAllMeshes = () => {
    if (this.selectedMeshes.length === this.availableMeshes.length) {
      this.selectedMeshes = []; // deselect all
    } else {
      this.selectedMeshes = [...this.availableMeshes]; // select all
    }
  };

  addColorSwatch = () => {
    this.colorOptions.push({
      id: Date.now().toString(),
      name: "",
      hex: "#ffffff",
    });
  };

  removeColorSwatch = (colorId) => {
    this.colorOptions = this.colorOptions.filter((c) => c.id !== colorId);
  };

  updateColorSwatch = (colorId, field, value) => {
    const color = this.colorOptions.find((c) => c.id === colorId);
    if (color) {
      color[field] = value;
    }
  };
}
