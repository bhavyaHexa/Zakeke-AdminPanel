import { observer } from "mobx-react-lite";
import { Plus, Trash2, Image } from "lucide-react";
import { useMainContext } from "../../context/MainContextProvider";

export const TextureOptionsList = observer(({ meshName }) => {
  const { design3dManager } = useMainContext();
  const store = design3dManager.colorStoreManager;
  const config = store.getMeshConfig(meshName);
  const textures = config?.textures ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
          <Image className="w-3.5 h-3.5 text-purple-500" />
          <span>Textures</span>
        </h4>
        <button
          onClick={() => store.addTextureToMesh(meshName)}
          className="flex items-center space-x-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
        >
          <Plus className="w-3 h-3" />
          <span>Add Texture</span>
        </button>
      </div>

      {textures.length === 0 ? (
        <p className="text-xs text-gray-400 italic p-3 bg-white rounded-md border border-gray-200 text-center">
          No textures defined. Add texture options for this mesh.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {textures.map((texture) => (
            <div
              key={texture.id}
              className="flex flex-col gap-1.5 bg-white p-2.5 rounded-md border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={texture.name}
                  onChange={(e) =>
                    store.updateTextureInMesh(meshName, texture.id, "name", e.target.value)
                  }
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
                  placeholder="Texture name (e.g. Wood)"
                />
                <button
                  onClick={() => store.removeTextureFromMesh(meshName, texture.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={texture.url}
                onChange={(e) =>
                  store.updateTextureInMesh(meshName, texture.id, "url", e.target.value)
                }
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-purple-400 focus:outline-none text-gray-500"
                placeholder="Texture URL (https://...)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
