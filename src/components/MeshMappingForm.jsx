import { observer } from "mobx-react-lite";
import { useStores } from "../stores/rootStore";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";

export const MeshMappingForm = observer(() => {
  const { configuratorStore } = useStores();

  const handleSelectAll = () => {
    configuratorStore.selectAllMeshes();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">2. Map Customizable Areas</h2>

      {!configuratorStore.glbFile ? (
        <p className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
          Upload a 3D model first to see available meshes.
        </p>
      ) : (
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Category: Color Change</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meshes Checklist */}
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm h-80 overflow-y-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700">Select Meshes</h4>
                <button 
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  {configuratorStore.selectedMeshes.length === configuratorStore.availableMeshes.length && configuratorStore.availableMeshes.length > 0 ? (
                    <><CheckSquare className="w-3 h-3" /> <span>Deselect All</span></>
                  ) : (
                    <><Square className="w-3 h-3" /> <span>Select All</span></>
                  )}
                </button>
              </div>

              {configuratorStore.availableMeshes.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center mt-10">No meshes found in the GLB.</p>
              ) : (
                <div className="space-y-2">
                  {configuratorStore.availableMeshes.map(meshName => (
                    <label key={meshName} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input 
                        type="checkbox"
                        checked={configuratorStore.selectedMeshes.includes(meshName)}
                        onChange={() => configuratorStore.toggleMeshSelection(meshName)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 truncate" title={meshName}>{meshName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Colors Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Add Color Options</h4>
                <button 
                  onClick={() => configuratorStore.addColorSwatch()}
                  className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Color</span>
                </button>
              </div>

              {configuratorStore.colorOptions.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-3 bg-white rounded-md border border-gray-200">
                  No color options defined. Add colors that will be applied to the selected meshes.
                </p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {configuratorStore.colorOptions.map((color) => (
                    <div key={color.id} className="flex items-center space-x-3 bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-inner flex-shrink-0">
                        <input 
                          type="color"
                          value={color.hex}
                          onChange={(e) => configuratorStore.updateColorSwatch(color.id, 'hex', e.target.value)}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 cursor-pointer"
                        />
                      </div>
                      <input 
                        type="text"
                        value={color.name}
                        onChange={(e) => configuratorStore.updateColorSwatch(color.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border-b border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                        placeholder="Color Name (e.g., Midnight Blue)"
                      />
                      <button 
                        onClick={() => configuratorStore.removeColorSwatch(color.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
