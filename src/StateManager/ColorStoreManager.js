import { makeAutoObservable } from "mobx";
import { createNewColorSwatch, removeColorSwatchFromList, updateColorSwatchInList } from "../utils/colorUtils";

class ColorStoreManager {
  design3dManager;
  
  glbFile = null;
  availableMeshes = [];
  selectedMeshes = [];
  colorOptions = [];

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setGlbFile(file) {
    this.glbFile = file;
    this.availableMeshes = [];
    this.selectedMeshes = [];
    this.colorOptions = [];
  }

  setAvailableMeshes(meshes) {
    this.availableMeshes = meshes;
  }

  toggleMeshSelection(meshName) {
    if (this.selectedMeshes.includes(meshName)) {
      this.selectedMeshes = this.selectedMeshes.filter(m => m !== meshName);
    } else {
      this.selectedMeshes.push(meshName);
    }
  }

  selectAllMeshes() {
    if (this.selectedMeshes.length === this.availableMeshes.length) {
      this.selectedMeshes = []; // deselect all
    } else {
      this.selectedMeshes = [...this.availableMeshes]; // select all
    }
  }

  addColorSwatch() {
    this.colorOptions.push(createNewColorSwatch());
  }

  removeColorSwatch(colorId) {
    this.colorOptions = removeColorSwatchFromList(this.colorOptions, colorId);
  }

  updateColorSwatch(colorId, field, value) {
    updateColorSwatchInList(this.colorOptions, colorId, field, value);
  }
}

export default ColorStoreManager;
