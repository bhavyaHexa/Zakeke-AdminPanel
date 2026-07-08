import { observer } from "mobx-react-lite";
import { useStores } from "../stores/rootStore";
import { Download, Package } from "lucide-react";
import JSZip from "jszip";
import { useState } from "react";

export const ExportPackage = observer(() => {
  const { configuratorStore } = useStores();
  const [isExporting, setIsExporting] = useState(false);

  const canExport = configuratorStore.glbFile && 
                    configuratorStore.sku && 
                    configuratorStore.selectedMeshes.length > 0 &&
                    configuratorStore.colorOptions.length > 0;

  const handleExport = async () => {
    if (!canExport) return;
    
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      const selectColor = {
        targetedMeshNames: [...configuratorStore.selectedMeshes],
        colorOptions: configuratorStore.colorOptions.map(c => ({
          name: c.name,
          hex: c.hex
        }))
      };

      const manifest = {
        sku: configuratorStore.sku,
        productName: configuratorStore.productName || configuratorStore.sku,
        modelFilename: configuratorStore.glbFile.name,
        selectColor: selectColor
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
      link.setAttribute("download", `${manifest.sku || 'export'}_config.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add files to zip
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("config.csv", csvContent);
      zip.file(configuratorStore.glbFile.name, configuratorStore.glbFile);

      // Generate zip blob
      const content = await zip.generateAsync({ type: "blob" });
      
      // Upload to local Flask server instead of downloading
      const formData = new FormData();
      formData.append("file", content, `${configuratorStore.sku || 'export'}_package.zip`);
      
      const response = await fetch("/upload-to-shopify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server responded with an error");
      }
      
      alert("Successfully uploaded 3D model to Shopify!");
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Failed to upload to Shopify: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6 mb-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Export Package</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1 space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
            <input 
              type="text"
              value={configuratorStore.sku}
              onChange={(e) => configuratorStore.setSku(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SHOE-123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Optional)</label>
            <input 
              type="text"
              value={configuratorStore.productName}
              onChange={(e) => configuratorStore.setProductName(e.target.value)}
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
