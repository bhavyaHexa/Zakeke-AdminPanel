import { observer } from "mobx-react-lite";
import { useState } from "react";
import { runInAction } from "mobx";
import { useMainContext } from "../../context/MainContextProvider";
import { MaterialTabs } from "./MaterialTabs";
import { MeshList } from "./MeshList";
import { MaterialEditor } from "./MaterialEditor";

export const ColorChangeCategory = observer(() => {
  const { design3dManager, designManager } = useMainContext();
  const store = design3dManager.colorStoreManager;

  const [activeTab, setActiveTab] = useState("Product MetaData");
  const activeMesh = store.activeMesh;
  const setActiveMesh = (meshName) => store.setActiveMesh(meshName);

  const hasModel = store.glbFile || store.glbFileUrl;

  const handleOpenMeshDetail = (meshName) => {
    runInAction(() => {
      if (!store.selectedMeshes.includes(meshName)) {
        store.selectedMeshes.push(meshName);
      }
      if (!store.meshConfigs[meshName]) {
        store.meshConfigs[meshName] = { colors: [], textures: [] };
      }
    });
    setActiveMesh(meshName);
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Reusable Material Tabs Component */}
      <MaterialTabs
        tabs={["Product MetaData", "Model Materials", "Design Materials"]}
        activeTab={activeTab}
        onTabSelect={(tab) => {
          setActiveTab(tab);
          // Auto-clear active mesh detail if changing tabs
          setActiveMesh(null);
        }}
      />

      <div className="p-5">
        {/* TAB 1: Product MetaData */}
        {activeTab === "Product MetaData" && (
          <div className="bg-white rounded-xl space-y-5">
            <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 text-xs text-blue-855 leading-relaxed select-none">
              <p className="font-semibold text-blue-900 mb-1">Product Details</p>
              Associate this 3D configuration with a Shopify product by entering its SKU and name.
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-1 select-none">
                  Product SKU *
                </label>
                <input
                  type="text"
                  value={designManager.sku}
                  onChange={(e) => designManager.setSku(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-gray-305 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-700 bg-white"
                  placeholder="e.g., SHOE-CLASSIC-01"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider mb-1 select-none">
                  Product Name (Optional)
                </label>
                <input
                  type="text"
                  value={designManager.productName}
                  onChange={(e) => designManager.setProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-gray-305 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
                  placeholder="e.g., Classic Leather Shoe"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Design Materials */}
        {activeTab === "Design Materials" && (
          <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl select-none">
            <p className="text-sm font-semibold text-gray-600">Design Materials</p>
            <p className="text-xs text-gray-405 mt-1">Adjust overlay templates and default customer canvas textures.</p>
          </div>
        )}

        {/* TAB 2: Model Materials */}
        {activeTab === "Model Materials" && (
          <>
            {!hasModel ? (
              <p className="text-gray-555 text-xs font-semibold italic p-5 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200 select-none">
                Upload a 3D model on the left to see available meshes.
              </p>
            ) : !activeMesh ? (
              /* Reusable Mesh Catalog List Component */
              <MeshList
                store={store}
                onOpenDetail={handleOpenMeshDetail}
              />
            ) : (
              /* Reusable Mesh Detail Material Editor Component */
              <MaterialEditor
                activeMesh={activeMesh}
                store={store}
                onBack={() => setActiveMesh(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});
