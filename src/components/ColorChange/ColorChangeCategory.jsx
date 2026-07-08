import { observer } from "mobx-react-lite";
import { useMainContext } from "../../context/MainContextProvider";
import { MeshChecklist } from "./MeshChecklist";
import { ColorOptionsList } from "./ColorOptionsList";

export const ColorChangeCategory = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;

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
            <MeshChecklist />
            <ColorOptionsList />
          </div>
        </div>
      )}
    </div>
  );
});
