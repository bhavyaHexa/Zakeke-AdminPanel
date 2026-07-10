import { observer } from "mobx-react-lite";
import { useState, useRef } from "react";
import { Plus, Trash2, Image, UploadCloud, Loader2, Link2, AlertCircle } from "lucide-react";
import { useMainContext } from "../../context/MainContextProvider";
import { uploadFile } from "../../api/apiClient";

const TextureItem = observer(({ texture, meshName, store }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      setError(null);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          store.updateTextureInMesh(meshName, texture.id, "url", url);
          // Set name if empty
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          if (!texture.name || texture.name.trim() === "") {
            store.updateTextureInMesh(meshName, texture.id, "name", baseName);
          }
        } else {
          throw new Error("No URL returned from upload response.");
        }
      } catch (err) {
        setError(err.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5 bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Thumbnail Preview Area */}
        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          ) : texture.url ? (
            <img
              src={texture.url}
              alt={texture.name || "Texture preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If it fails to load, show a placeholder
                e.target.style.display = "none";
              }}
            />
          ) : (
            <Image className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Text Details & Title Input */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <input
              type="text"
              value={texture.name}
              onChange={(e) =>
                store.updateTextureInMesh(meshName, texture.id, "name", e.target.value)
              }
              className="flex-1 font-medium text-sm text-gray-800 border border-transparent hover:border-gray-200 focus:border-purple-400 focus:bg-white focus:outline-none px-1.5 py-0.5 rounded transition-all"
              placeholder="Texture name (e.g. Wood)"
            />
            <button
              onClick={() => store.removeTextureFromMesh(meshName, texture.id)}
              className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-colors rounded hover:bg-gray-50"
              title="Remove texture option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons (Upload vs URL input) */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1 text-[11px] font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 px-2 py-1 rounded transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{texture.url ? "Replace Image" : "Upload Image"}</span>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <span className="text-gray-300 text-[10px]">|</span>

            <div className="flex-1 flex items-center relative">
              <Link2 className="absolute left-1.5 w-3 h-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={texture.url}
                onChange={(e) =>
                  store.updateTextureInMesh(meshName, texture.id, "url", e.target.value)
                }
                className="w-full pl-5 pr-2 py-0.5 text-[11px] text-gray-500 border border-gray-200 rounded focus:border-purple-400 focus:outline-none placeholder-gray-400 bg-gray-50/50 hover:bg-white"
                placeholder="Or paste URL directly..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-100">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
});

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
        <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
          {textures.map((texture) => (
            <TextureItem
              key={texture.id}
              texture={texture}
              meshName={meshName}
              store={store}
            />
          ))}
        </div>
      )}
    </div>
  );
});
