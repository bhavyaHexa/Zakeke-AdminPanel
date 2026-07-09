import { observer } from "mobx-react-lite";
import { useMainContext } from "../context/MainContextProvider";
import { Download, Package } from "lucide-react";
import JSZip from "jszip";
import { useState } from "react";

export const ExportPackage = observer(() => {
  const { designManager, design3dManager } = useMainContext();
  const colorStore = design3dManager.colorStoreManager;
  const envStore = design3dManager.environmentStoreManager;
  
  const [isExporting, setIsExporting] = useState(false);

  const canExport = colorStore.glbFile && 
                    colorStore.glbFileUrl &&
                    !colorStore.isUploading &&
                    (!envStore.envFile || (envStore.envFileUrl && !envStore.isUploading)) &&
                    designManager.sku && 
                    colorStore.selectedMeshes.length > 0 &&
                    colorStore.colorOptions.length > 0;

  const handleExport = async () => {
    if (!canExport) return;
    
    setIsExporting(true);
    try {
      const selectColor = {
        targetedMeshNames: [...colorStore.selectedMeshes],
        colorOptions: colorStore.colorOptions.map(c => ({
          name: c.name,
          hex: c.hex
        }))
      };

      // Compile CSV
      let csvContent = "Targeted Meshes,Color Name,Color Hex\n";
      const meshList = selectColor.targetedMeshNames.join("; ");
      selectColor.colorOptions.forEach(c => {
        csvContent += `"${meshList}","${c.name}","${c.hex}"\n`;
      });

      // Trigger download of CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${designManager.sku || 'export'}_config.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // JSON payload for product ingestion
      const payload = {
        sku: designManager.sku,
        productName: designManager.productName || designManager.sku,
        glbUrl: colorStore.glbFileUrl,
        glbFileId: colorStore.glbFileId,
        envUrl: envStore.envFileUrl || "",
        envFileId: envStore.envFileId || "",
        selectColor: selectColor,
        environment: {
          rotation: { ...envStore.rotation },
          intensity: envStore.intensity
        }
      };

      const response = await fetch("/upload-to-shopify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server responded with an error");
      }
      
      alert("Successfully configured product on Shopify!");
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Failed to upload to Shopify: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6 mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Export Package</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1 space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
            <input 
              type="text"
              value={designManager.sku}
              onChange={(e) => designManager.setSku(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SHOE-123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Optional)</label>
            <input 
              type="text"
              value={designManager.productName}
              onChange={(e) => designManager.setProductName(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Classic Running Shoe"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white w-full md:w-64">
          <Package className="w-12 h-12 text-gray-400 mb-3" />
          <button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              canExport && !isExporting
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5" />
            <span>{isExporting ? 'Uploading...' : 'Upload to Shopify'}</span>
          </button>
          {!canExport && (
            <p className="text-xs text-red-500 mt-3 text-center">
              Requires GLB file, SKU, at least one selected mesh, and color options.
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
