import { makeAutoObservable, runInAction } from "mobx";

/**
 * Manages the product list and all CRUD API interactions:
 *   GET    /shopify/products          → listProducts()
 *   GET    /shopify/products/:id      → getProduct(id)
 *   DELETE /shopify/products/:id      → deleteProduct(id)
 *   PUT    /shopify/products/:id      → handled via ExportPackage (edit mode)
 */
class ProductStore {
  rootStore;

  products = [];        // [{ id, title, handle, thumbnail }]
  isLoading = false;
  loadError = null;

  deletingId = null;    // ID currently being deleted
  deleteError = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
  }

  get backendUrl() {
    return import.meta.env.VITE_BACKEND_URL || "https://5nvt4h41-3000.inc1.devtunnels.ms";
  }

  // ── List ────────────────────────────────────────────────────────────────────

  async listProducts() {
    this.isLoading = true;
    this.loadError = null;
    try {
      const res = await fetch(`${this.backendUrl}/shopify/products`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch products");
      }
      const json = await res.json();
      runInAction(() => {
        this.products = json.data?.products ?? json.products ?? (Array.isArray(json) ? json : []);
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.loadError = e.message;
        this.isLoading = false;
      });
    }
  }

  // ── Get single (for edit hydration) ────────────────────────────────────────

  async getProduct(productId) {
    const res = await fetch(`${this.backendUrl}/shopify/products/${productId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to fetch product");
    }
    return res.json(); // { id, data: { productName, sku, environments, camera, mesh, textures } }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async deleteProduct(productId) {
    this.deletingId = productId;
    this.deleteError = null;
    try {
      const res = await fetch(`${this.backendUrl}/shopify/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete product");
      }
      runInAction(() => {
        this.products = this.products.filter((p) => p.id !== productId);
        this.deletingId = null;
      });
    } catch (e) {
      runInAction(() => {
        this.deleteError = e.message;
        this.deletingId = null;
      });
      throw e;
    }
  }
}

export default ProductStore;
