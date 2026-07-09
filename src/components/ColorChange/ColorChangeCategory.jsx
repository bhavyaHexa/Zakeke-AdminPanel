import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMainContext } from "../../context/MainContextProvider";
import { MeshChecklist } from "./MeshChecklist";
import { ColorOptionsList } from "./ColorOptionsList";
import { TextureOptionsList } from "./TextureOptionsList";

/**
 * Accordion card for one selected mesh — shows its colors + textures inline.
 */
const MeshConfigPanel = observer(({ meshName }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700 truncate" title={meshName}>
          {meshName}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white">
          <ColorOptionsList meshName={meshName} />
          <TextureOptionsList meshName={meshName} />
        </div>
      )}
    </div>
  );
});

export const ColorChangeCategory = observer(() => {
  const { design3dManager } = useMainContext();
  const store = design3dManager.colorStoreManager;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        2. Map Customizable Areas
      </h2>

      {!store.glbFile ? (
        <p className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
          Upload a 3D model first to see available meshes.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Mesh selector */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Meshes</h3>
            <MeshChecklist />
          </div>

          {/* Per-mesh config panels */}
          {store.selectedMeshes.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">
              Select at least one mesh above to configure its colors and textures.
            </p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Configure per mesh
              </h3>
              {store.selectedMeshes.map((meshName) => (
                <MeshConfigPanel key={meshName} meshName={meshName} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
