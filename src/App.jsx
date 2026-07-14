import { observer } from "mobx-react-lite";
import { useState } from "react";
import { runInAction } from "mobx";
import { useMainContext } from "./context/MainContextProvider";
import { GLBSelector } from "./components/GLBSelector";
import { ColorChangeCategory } from "./components/ColorChange/ColorChangeCategory";
import { ProductList } from "./components/ProductList";
import { createProduct, updateProduct } from "./api/apiClient";
import { X, Save, ArrowLeft, Loader2, Package } from "lucide-react";
import "./App.css";

const App = observer(() => {
  const { designManager, design3dManager, productStore } = useMainContext();
  const colorStore = design3dManager.colorStoreManager;
  const envStore = design3dManager.environmentStoreManager;

  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!designManager.activeProductId;
  const isEditorOpen = isEditing || designManager.isConfiguring;

  const canExport =
    colorStore.glbFileUrl &&
    !colorStore.isUploading &&
    (!envStore.envFile || (envStore.envFileUrl && !envStore.isUploading)) &&
    designManager.sku &&
    colorStore.selectedMeshes.length > 0;

  const handleExport = async () => {
    if (!canExport) return;

    setIsSaving(true);
    try {
      const payload = {
        data: {
          productName: designManager.productName || designManager.sku,
          sku: designManager.sku,
          modelMediaId: colorStore.glbFileId || null,
          environments: {
            file: envStore.envFileId || envStore.envFileUrl || null,
            intensity: envStore.intensity ?? 1.0,
            rotation: {
              x: envStore.rotation?.x ?? 0,
              y: envStore.rotation?.y ?? 0,
              z: envStore.rotation?.z ?? 0,
            }
          },
          camera: colorStore.cameraConfig || null,
          mesh: colorStore.meshPayload || []
        }
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
      
      // Refresh list
      productStore.listProducts();
      
      // Reset stores to exit editor
      runInAction(() => {
        designManager.reset();
        colorStore.reset();
        envStore.reset();
      });
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Failed to save to Shopify: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditorOpen) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Hexacoder 3D Ingestion Tool
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:mt-4">
              Configure your 3D models, map materials, and push 3D configurations directly to Shopify.
            </p>
          </header>

          <main>
            <ProductList />
          </main>
        </div>
      </div>
    );
  }

  // Split-screen editor layout when isEditorOpen is true
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white z-50 flex flex-col overflow-hidden font-sans">
      {/* Editor Top Header Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0 h-16">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              runInAction(() => {
                designManager.reset();
                colorStore.reset();
                envStore.reset();
              });
            }}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-650 flex-shrink-0"
            title="Back to products list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="text-base font-bold text-gray-800 truncate">
              {designManager.productName || "New 3D Configuration"}
            </h2>
            {designManager.sku && (
              <p className="text-xs font-mono text-gray-500 truncate">SKU: {designManager.sku}</p>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">3D Configurator Setup</span>
          <span className="text-[10px] text-gray-400 font-medium">Design Mapping & Environment settings</span>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleExport}
            disabled={!canExport || isSaving}
            className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition shadow-sm ${
              canExport && !isSaving
                ? "bg-[#ff6a00] hover:bg-[#e05d00] text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
          <button
            onClick={() => {
              runInAction(() => {
                designManager.reset();
                colorStore.reset();
                envStore.reset();
              });
            }}
            className="w-9 h-9 rounded-full bg-black hover:bg-gray-800 text-white transition flex items-center justify-center shadow-md flex-shrink-0"
            title="Exit configuration editor"
          >
            <X className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Left Column: 3D Model Interactive Viewport */}
        <div className="w-full lg:w-7/12 p-6 bg-gray-50 flex flex-col justify-stretch border-b lg:border-b-0 lg:border-r border-gray-200 h-full overflow-hidden">
          <GLBSelector />
        </div>

        {/* Right Column: Configurations & Material Mapping */}
        <div className="w-full lg:w-5/12 p-6 flex flex-col space-y-6 overflow-y-auto h-full bg-white pb-20">
          {/* Validation Notice */}
          {!canExport && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Package className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">Configuration Requirements:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li className={colorStore.glbFileUrl ? "text-green-700" : "text-amber-850"}>
                    3D Model uploaded: {colorStore.glbFileUrl ? "✓ Done" : "Required"}
                  </li>
                  <li className={designManager.sku ? "text-green-700" : "text-amber-850"}>
                    Product SKU entered: {designManager.sku ? "✓ Done" : "Required"}
                  </li>
                  <li className={colorStore.selectedMeshes.length > 0 ? "text-green-700" : "text-amber-850"}>
                    At least one customizable mesh selected: {colorStore.selectedMeshes.length > 0 ? "✓ Done" : "Required"}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 2: Customizable Areas */}
          <div className="shadow-sm border border-gray-100 rounded-xl flex-1 flex flex-col overflow-hidden">
            <ColorChangeCategory />
          </div>
        </div>
      </div>
    </div>
  );
});

export default App;
