import { observer } from "mobx-react-lite";
import { Plus, Trash2 } from "lucide-react";
import { useMainContext } from "../../context/MainContextProvider";

export const ColorOptionsList = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;

  return (
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
  );
});
