import { observer } from "mobx-react-lite";
import { useMainContext } from "../context/MainContextProvider";
import { Download, Package } from "lucide-react";
import { useState } from "react";
import { runInAction } from "mobx";
import { createProduct, updateProduct } from "../api/apiClient";

export const ExportPackage = observer(() => {
  const { designManager, design3dManager, productStore } = useMainContext();
  const colorStore = design3dManager.colorStoreManager;
  const envStore = design3dManager.environmentStoreManager;

  const [isExporting, setIsExporting] = useState(false);

  const isEditing = !!designManager.activeProductId;

  const canExport =
    colorStore.glbFileUrl &&
    !colorStore.isUploading &&
    (!envStore.envFile || (envStore.envFileUrl && !envStore.isUploading)) &&
    designManager.sku &&
    colorStore.selectedMeshes.length > 0;

  const handleExport = async () => {
    if (!canExport) return;

    setIsExporting(true);
    try {
      const payload = {
        data: {
          productName: designManager.productName || designManager.sku,
          sku: designManager.sku,
          environments: {
            file: colorStore.glbFileId || null,
            intensity: envStore.intensity ?? 1.0,
            rotation: {
              x: envStore.rotation?.x ?? 0,
              y: envStore.rotation?.y ?? 0,
              z: envStore.rotation?.z ?? 0,
            },
          },
          camera: {
            position: [0, 90, 0],
          },
          mesh: colorStore.meshPayload,
          textures: colorStore.texturesPayload,
        },
      };

      if (isEditing) {
        await updateProduct(designManager.activeProductId, payload);
      } else {
        await createProduct(payload);
      }

      alert(
        isEditing
          ? "Successfully updated product on Shopify!"
          : "Successfully configured product on Shopify!"
      );
      
      // Refresh the product list
      productStore.listProducts();
      
      // Reset the editing form state
      runInAction(() => {
        designManager.reset();
        colorStore.reset();
        envStore.reset();
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Failed to upload to Shopify: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6 mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? "4. Update Shopify Product" : "4. Export Package"}
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1 space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product SKU *
            </label>
            <input
              type="text"
              value={designManager.sku}
              onChange={(e) => designManager.setSku(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SHOE-123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name (Optional)
            </label>
            <input
              type="text"
              value={designManager.productName}
              onChange={(e) => designManager.setProductName(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Classic Running Shoe"
            />
          </div>

          {/* Payload preview (dev helper) */}
          {colorStore.selectedMeshes.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Payload preview — mesh / textures:
              </p>
              <ul className="text-xs text-gray-500 space-y-0.5">
                {colorStore.selectedMeshes.map((m) => {
                  const cfg = colorStore.getMeshConfig(m);
                  return (
                    <li key={m} className="flex gap-2">
                      <span className="font-mono truncate max-w-[180px]" title={m}>{m}</span>
                      <span className="text-blue-500">{cfg.colors.length} color(s)</span>
                      <span className="text-purple-500">{cfg.textures.length} texture(s)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white w-full md:w-64">
          <Package className="w-12 h-12 text-gray-400 mb-3" />
          <button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              canExport && !isExporting
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Download className="w-5 h-5" />
            <span>
              {isExporting ? "Uploading..." : isEditing ? "Update Shopify" : "Upload to Shopify"}
            </span>
          </button>
          {isEditing && (
            <button
              onClick={() => {
                runInAction(() => {
                  designManager.reset();
                  colorStore.reset();
                  envStore.reset();
                });
              }}
              className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Cancel Edit &amp; Reset
            </button>
          )}
          {!canExport && (
            <p className="text-xs text-red-500 mt-3 text-center">
              Requires 3D model, SKU, and at least one selected mesh.
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
