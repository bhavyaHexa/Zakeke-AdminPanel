import { makeAutoObservable, runInAction } from "mobx";
import { fetchProducts, fetchProductById, deleteProduct as apiDeleteProduct } from "../api/apiClient";

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

  // ── List ────────────────────────────────────────────────────────────────────

  async listProducts() {
    this.isLoading = true;
    this.loadError = null;
    try {
      const json = await fetchProducts();
      const productsList = json.data?.products ?? json.products ?? (Array.isArray(json) ? json : []);
      
      runInAction(() => {
        this.products = productsList.map((p) => ({ ...p, sku: p.sku || "" }));
        this.isLoading = false;
      });

      // Fetch details in background to resolve SKU on the frontend
      productsList.forEach(async (product) => {
        try {
          const detail = await this.getProduct(product.id);
          const d = detail.data?.data || detail.data || detail;
          if (d && d.sku) {
            runInAction(() => {
              const target = this.products.find((p) => p.id === product.id);
              if (target) {
                target.sku = d.sku;
              }
            });
          }
        } catch (err) {
          console.error(`Failed to resolve SKU for product ${product.id}:`, err);
        }
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
    return await fetchProductById(productId); // { id, data: { productName, sku, environments, camera, mesh, textures } }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async deleteProduct(productId) {
    this.deletingId = productId;
    this.deleteError = null;
    try {
      await apiDeleteProduct(productId);
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
