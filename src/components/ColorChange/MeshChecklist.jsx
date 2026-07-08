import { observer } from "mobx-react-lite";
import { CheckSquare, Square } from "lucide-react";
import { useMainContext } from "../../context/MainContextProvider";

export const MeshChecklist = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;

  const handleSelectAll = () => {
    configuratorStore.selectAllMeshes();
  };

  const isAllSelected = configuratorStore.selectedMeshes.length === configuratorStore.availableMeshes.length && configuratorStore.availableMeshes.length > 0;

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm h-80 overflow-y-auto">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-700">Select Meshes</h4>
        <button 
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
        >
          {isAllSelected ? (
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
  );
});
