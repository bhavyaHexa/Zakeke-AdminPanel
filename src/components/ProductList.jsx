import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { runInAction } from "mobx";
import { RefreshCw, Pencil, Trash2, Package, AlertCircle, Loader2 } from "lucide-react";
import { useMainContext } from "../context/MainContextProvider";

export const ProductList = observer(() => {
  const { productStore, designManager, design3dManager } = useMainContext();
  const colorStore = design3dManager.colorStoreManager;
  const envStore = design3dManager.environmentStoreManager;

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [editError, setEditError] = useState(null);

  // Auto-load on mount
  useEffect(() => {
    productStore.listProducts();
  }, []);

  // ── Edit: load product data into form ────────────────────────────────────────
  const handleEdit = async (productId) => {
    setEditLoadingId(productId);
    setEditError(null);
    try {
      const response = await productStore.getProduct(productId);
      const d = response.data?.data || response.data || response;

      runInAction(() => {
        // Basic fields
        designManager.setActiveProductId(productId);
        designManager.setSku(d.sku || "");
        designManager.setProductName(d.productName || "");

        // Environment
        if (d.environments) {
          envStore.setIntensity(d.environments.intensity ?? 1.0);
          const rot = d.environments.rotation || { x: 0, y: 0, z: 0 };
          envStore.setRotation("x", rot.x ?? 0);
          envStore.setRotation("y", rot.y ?? 0);
          envStore.setRotation("z", rot.z ?? 0);
          // Note: envFileUrl/glbFileUrl are the saved Shopify URLs — not re-uploadable from edit
          envStore.envFileUrl = d.environments.file || null;
          colorStore.glbFileUrl = d.environments.file || null;
          colorStore.glbFileId = d.environments.file || null;
        }

        // Mesh + textures (per-mesh hydration)
        colorStore.loadFromProductData(d);

        // Mark available meshes from saved data
        const meshNames = (d.mesh || []).map((m) => m.name);
        colorStore.availableMeshes = meshNames;
      });

      // Scroll up to the form
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditLoadingId(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      await productStore.deleteProduct(confirmDeleteId);
    } catch {
      // error already in store
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Shopify Products</h2>
        <button
          onClick={() => productStore.listProducts()}
          disabled={productStore.isLoading}
          className="flex items-center space-x-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${productStore.isLoading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Load error */}
      {productStore.loadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {productStore.loadError}
        </div>
      )}

      {/* Delete error */}
      {productStore.deleteError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Delete failed: {productStore.deleteError}
        </div>
      )}

      {/* Edit load error */}
      {editError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load product: {editError}
        </div>
      )}

      {/* Loading skeleton */}
      {productStore.isLoading && productStore.products.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!productStore.isLoading && productStore.products.length === 0 && !productStore.loadError && (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No products found in the collection.</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload a product above or click Refresh to reload.
          </p>
        </div>
      )}

      {/* Product list */}
      {productStore.products.length > 0 && (
        <div className="space-y-2">
          {productStore.products.map((product) => {
            const isDeleting = productStore.deletingId === product.id;
            const isEditLoading = editLoadingId === product.id;
            const isActive = designManager.activeProductId === product.id;

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  isActive
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200"
                }`}
              >
                {/* Thumbnail */}
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {product.title}
                    {isActive && (
                      <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                        Editing
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {product.id}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(product.id)}
                    disabled={isEditLoading || isDeleting}
                    title="Edit product"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isEditLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Pencil className="w-3.5 h-3.5" />
                    )}
                    <span>{isEditLoading ? "Loading…" : "Edit"}</span>
                  </button>

                  {/* Delete */}
                  {confirmDeleteId === product.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      disabled={isDeleting || isEditLoading}
                      title="Delete product"
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
