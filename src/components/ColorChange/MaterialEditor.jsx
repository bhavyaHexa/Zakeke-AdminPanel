import React, { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { ChevronLeft, Trash2 } from "lucide-react";
import { MaterialAccordion } from "./MaterialAccordion";
import { uploadFile } from "../../api/apiClient";

export const MaterialEditor = observer(({ activeMesh, store, onBack }) => {
  const [meshNameInput, setMeshNameInput] = useState("");
  const [isUploadingTexture, setIsUploadingTexture] = useState(false);
  const [isAlbedoOpen, setIsAlbedoOpen] = useState(true);

  const textureInputRef = useRef(null);
  const individualTextureInputRef = useRef(null);
  const activeUploadIdRef = useRef(null);

  useEffect(() => {
    if (activeMesh) {
      setMeshNameInput(`${activeMesh} - Sample color`);
    }
  }, [activeMesh]);

  const handleAddColor = () => {
    store.addColorToMesh(activeMesh);
  };

  const handleColorChange = (id, newHex) => {
    store.updateColorInMesh(activeMesh, id, "hex", newHex);
  };

  const handleColorNameChange = (id, name) => {
    store.updateColorInMesh(activeMesh, id, "name", name);
  };

  const handleNewTextureUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploadingTexture(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          runInAction(() => {
            store.addTextureToMesh(activeMesh);
            const cfg = store.getMeshConfig(activeMesh);
            const lastTex = cfg.textures[cfg.textures.length - 1];
            store.updateTextureInMesh(activeMesh, lastTex.id, "url", url);
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            store.updateTextureInMesh(activeMesh, lastTex.id, "name", baseName);
          });
        }
      } catch (err) {
        console.error("Texture upload failed:", err);
        alert(`Failed to upload texture: ${err.message}`);
      } finally {
        setIsUploadingTexture(false);
        e.target.value = "";
      }
    }
  };

  const handleIndividualTextureUpload = async (e) => {
    const targetId = activeUploadIdRef.current;
    if (targetId && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploadingTexture(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          runInAction(() => {
            store.updateTextureInMesh(activeMesh, targetId, "url", url);
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            store.updateTextureInMesh(activeMesh, targetId, "name", baseName);
          });
        }
      } catch (err) {
        console.error("Texture upload failed:", err);
        alert(`Failed to upload texture: ${err.message}`);
      } finally {
        setIsUploadingTexture(false);
        e.target.value = "";
        activeUploadIdRef.current = null;
      }
    }
  };

  const handleTextureNameChange = (id, name) => {
    store.updateTextureInMesh(activeMesh, id, "name", name);
  };

  const currentCfg = store.getMeshConfig(activeMesh);
  const colors = currentCfg?.colors || [];
  const textures = currentCfg?.textures || [];

  // Determine top status preview swatch values (just from the first items)
  const colorVal = colors[0]?.hex || "#0A0A0A";
  const textureVal = textures[0]?.url || "";

  return (
    <div className="space-y-4 font-sans">
      {/* Back button and Header */}
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-155 rounded-lg text-gray-555 transition flex items-center justify-center flex-shrink-0 focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden bg-gray-105 shadow-inner flex items-center justify-center">
          {colorVal && colorVal !== "#0A0A0A" ? (
            <div className="w-full h-full" style={{ backgroundColor: colorVal }} />
          ) : textureVal ? (
            <img src={textureVal} className="w-full h-full object-cover" alt="texture" />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-250" />
          )}
        </div>
        <span className="text-xs font-extrabold text-gray-800 truncate select-none">
          {meshNameInput}
        </span>
      </div>

      {/* Editor Body */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        {/* Name field */}
        <div>
          <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 select-none">
            Name
          </label>
          <input
            type="text"
            value={meshNameInput}
            onChange={(e) => setMeshNameInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          />
        </div>

        {/* Material Parameter Accordions - Albedo Only */}
        <div className="mt-4 border border-gray-250 rounded-xl divide-y divide-gray-200 overflow-hidden bg-white shadow-sm">
          <MaterialAccordion
            title="Albedo"
            isOpen={isAlbedoOpen}
            onToggle={() => setIsAlbedoOpen((prev) => !prev)}
          >
            <div className="space-y-6">
              {/* COLORS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 select-none">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Colors ({colors.length})</span>
                  <button
                    onClick={handleAddColor}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 focus:outline-none"
                  >
                    <span>+ Add color</span>
                  </button>
                </div>

                {colors.length === 0 ? (
                  <p className="text-xs text-gray-400 italic select-none">No colors added. Click "+ Add color" to create one.</p>
                ) : (
                  <div className="space-y-2.5">
                    {colors.map((c, index) => (
                      <div key={c.id} className="flex items-center gap-2">
                        {/* Native Color Picker Circle */}
                        <div className="relative w-8 h-8 rounded-full border border-gray-300 shadow-inner flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                          <div className="w-full h-full" style={{ backgroundColor: c.hex }} />
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => handleColorChange(c.id, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        {/* Hex Input Display */}
                        <input
                          type="text"
                          value={c.hex}
                          onChange={(e) => handleColorChange(c.id, e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-[10px] border border-gray-250 rounded font-mono text-gray-700 focus:outline-none bg-white"
                        />
                        {/* Swatch Name input */}
                        <input
                          type="text"
                          value={c.name}
                          placeholder={`Color Option ${index + 1}`}
                          onChange={(e) => handleColorNameChange(c.id, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-250 rounded focus:outline-none text-gray-700 font-semibold bg-white"
                        />
                        {/* Delete Swatch */}
                        <button
                          onClick={() => store.removeColorFromMesh(activeMesh, c.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0 focus:outline-none"
                          title="Delete color swatch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TEXTURES SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 select-none">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Textures ({textures.length})</span>
                  <button
                    onClick={() => textureInputRef.current?.click()}
                    className="text-xs font-bold text-[#ff6a00] hover:text-[#e05d00] transition flex items-center gap-1 focus:outline-none"
                    disabled={isUploadingTexture}
                  >
                    <span>{isUploadingTexture ? "Uploading..." : "+ Add texture"}</span>
                  </button>
                  <input
                    type="file"
                    ref={textureInputRef}
                    onChange={handleNewTextureUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {textures.length === 0 ? (
                  <p className="text-xs text-gray-400 italic select-none">No textures added. Click "+ Add texture" to upload.</p>
                ) : (
                  <div className="space-y-2.5">
                    {textures.map((t, index) => (
                      <div key={t.id} className="flex items-center gap-2">
                        {/* Texture Thumbnail Image preview */}
                        <div className="w-8 h-8 rounded border border-gray-300 shadow-inner flex-shrink-0 overflow-hidden bg-gray-105 flex items-center justify-center relative group">
                          {t.url ? (
                            <img src={t.url} className="w-full h-full object-cover" alt="texture" />
                          ) : (
                            <div className="w-4 h-4 rounded bg-gray-250 animate-pulse" />
                          )}
                          {/* Inner Upload replacement click overlay */}
                          <div 
                            onClick={() => {
                              activeUploadIdRef.current = t.id;
                              individualTextureInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold cursor-pointer transition select-none"
                          >
                            Replace
                          </div>
                        </div>

                        {/* Texture Name input */}
                        <input
                          type="text"
                          value={t.name}
                          placeholder={`Texture Option ${index + 1}`}
                          onChange={(e) => handleTextureNameChange(t.id, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-255 rounded focus:outline-none text-gray-700 font-semibold bg-white"
                        />

                        {/* Delete Texture */}
                        <button
                          onClick={() => store.removeTextureFromMesh(activeMesh, t.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0 focus:outline-none"
                          title="Delete texture swatch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Individual Texture Replacement input */}
                <input
                  type="file"
                  ref={individualTextureInputRef}
                  onChange={handleIndividualTextureUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </MaterialAccordion>
        </div>
      </div>
    </div>
  );
});
