import React, { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { ChevronLeft } from "lucide-react";
import { MaterialAccordion } from "./MaterialAccordion";
import { uploadFile } from "../../api/apiClient";

const getContrastColor = (hexColor) => {
  if (!hexColor || hexColor.charAt(0) !== '#') return '#000000';
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

export const MaterialEditor = observer(({ activeMesh, store, onBack }) => {
  const [meshNameInput, setMeshNameInput] = useState("");
  const [isUploadingTexture, setIsUploadingTexture] = useState(false);
  const [isAlbedoOpen, setIsAlbedoOpen] = useState(true);

  const textureInputRef = useRef(null);

  useEffect(() => {
    if (activeMesh) {
      setMeshNameInput(`${activeMesh} - Sample color`);
    }
  }, [activeMesh]);

  const handleColorChange = (e) => {
    const newHex = e.target.value;
    runInAction(() => {
      const cfg = store.getMeshConfig(activeMesh);
      if (cfg.colors.length === 0) {
        store.addColorToMesh(activeMesh);
      }
      store.updateColorInMesh(activeMesh, cfg.colors[0].id, "hex", newHex);
      store.updateColorInMesh(activeMesh, cfg.colors[0].id, "name", "Base Color");
    });
  };

  const handleTextureUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploadingTexture(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          runInAction(() => {
            const cfg = store.getMeshConfig(activeMesh);
            if (cfg.textures.length === 0) {
              store.addTextureToMesh(activeMesh);
            }
            store.updateTextureInMesh(activeMesh, cfg.textures[0].id, "url", url);
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            store.updateTextureInMesh(activeMesh, cfg.textures[0].id, "name", baseName);
          });
        }
      } catch (err) {
        console.error("Texture upload failed:", err);
        alert(`Failed to upload texture: ${err.message}`);
      } finally {
        setIsUploadingTexture(false);
      }
    }
  };

  const handleRemoveTexture = () => {
    runInAction(() => {
      const cfg = store.getMeshConfig(activeMesh);
      if (cfg.textures.length > 0) {
        store.removeTextureFromMesh(activeMesh, cfg.textures[0].id);
      }
    });
  };

  const currentCfg = store.getMeshConfig(activeMesh);
  const colorVal = currentCfg?.colors?.[0]?.hex || "#0A0A0A";
  const textureVal = currentCfg?.textures?.[0]?.url || "";

  return (
    <div className="space-y-4">
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
            className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-sans"
          />
        </div>

        {/* Material Parameter Accordions - Albedo Only */}
        <div className="mt-4 border border-gray-250 rounded-xl divide-y divide-gray-200 overflow-hidden bg-white shadow-sm">
          <MaterialAccordion
            title="Albedo"
            isOpen={isAlbedoOpen}
            onToggle={() => setIsAlbedoOpen((prev) => !prev)}
          >
            <div className="space-y-4">
              {/* Color parameter */}
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-bold text-gray-655">Color</span>
                <div className="w-48 relative">
                  <div
                    className="w-full h-8 rounded-full border border-gray-300 shadow-inner flex items-center justify-center cursor-pointer text-xs font-bold font-mono transition transform active:scale-95 overflow-hidden"
                    style={{
                      backgroundColor: colorVal,
                      color: getContrastColor(colorVal),
                    }}
                  >
                    <span>{colorVal}</span>
                    <input
                      type="color"
                      value={colorVal}
                      onChange={handleColorChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Texture parameter */}
              <div className="flex items-center justify-between pt-1 select-none">
                <span className="text-xs font-bold text-gray-655">Texture</span>
                <div className="flex items-center space-x-2">
                  {textureVal ? (
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-1 pr-2">
                      <img
                        src={textureVal}
                        className="w-6 h-6 rounded object-cover"
                        alt="texture"
                      />
                      <button
                        onClick={() => textureInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold transition"
                        disabled={isUploadingTexture}
                      >
                        Change
                      </button>
                      <button
                        onClick={handleRemoveTexture}
                        className="text-xs text-red-500 hover:text-red-705 font-bold transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => textureInputRef.current?.click()}
                      className="text-[#ff6a00] hover:text-[#e05d00] font-bold text-xs transition"
                      disabled={isUploadingTexture}
                    >
                      {isUploadingTexture ? "Uploading..." : "Upload"}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={textureInputRef}
                    onChange={handleTextureUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </MaterialAccordion>
        </div>
      </div>
    </div>
  );
});
