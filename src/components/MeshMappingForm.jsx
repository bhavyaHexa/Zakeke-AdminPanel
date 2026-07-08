import { observer } from "mobx-react-lite";
import { useStores } from "../stores/rootStore";
import { Plus, Trash2 } from "lucide-react";

export const MeshMappingForm = observer(() => {
  const { configuratorStore } = useStores();

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">2. Map Customizable Areas</h2>
        <button 
          onClick={configuratorStore.addArea}
          className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Area</span>
        </button>
      </div>

      <div className="space-y-6">
        {configuratorStore.customizableAreas.length === 0 ? (
          <p className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
            No customizable areas added yet. Click "Add Area" to start mapping.
          </p>
        ) : (
          configuratorStore.customizableAreas.map((area, index) => (
            <div key={area.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 relative">
              <button 
                onClick={() => configuratorStore.removeArea(area.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove Area"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pr-10">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Mesh Name (exact from GLB)</label>
                  <input 
                    type="text"
                    value={area.meshTargetName}
                    onChange={(e) => configuratorStore.updateArea(area.id, 'meshTargetName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g., laces, sole"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Display Label</label>
                  <input 
                    type="text"
                    value={area.attributeDisplayName}
                    onChange={(e) => configuratorStore.updateArea(area.id, 'attributeDisplayName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g., Laces Color"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-800">Color Options</h3>
                  <button 
                    onClick={() => configuratorStore.addColorSwatch(area.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Color</span>
                  </button>
                </div>

                {area.colorOptions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No color options defined.</p>
                ) : (
                  <div className="space-y-3">
                    {area.colorOptions.map((color) => (
                      <div key={color.id} className="flex items-center space-x-3 bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-inner flex-shrink-0">
                          <input 
                            type="color"
                            value={color.hex}
                            onChange={(e) => configuratorStore.updateColorSwatch(area.id, color.id, 'hex', e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 cursor-pointer"
                          />
                        </div>
                        <input 
                          type="text"
                          value={color.name}
                          onChange={(e) => configuratorStore.updateColorSwatch(area.id, color.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border-b border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="Color Name (e.g., Midnight Blue)"
                        />
                        <button 
                          onClick={() => configuratorStore.removeColorSwatch(area.id, color.id)}
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
          ))
        )}
      </div>
    </div>
  );
});
