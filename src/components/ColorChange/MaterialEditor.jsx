import React, { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { ChevronLeft, Trash2, Package } from "lucide-react";
import { MaterialAccordion } from "./MaterialAccordion";
import { uploadFile } from "../../api/apiClient";

export const MaterialEditor = observer(({ activeMesh, store, onBack }) => {
  const [meshNameInput, setMeshNameInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Accordion states
  const [isAlbedoOpen, setIsAlbedoOpen] = useState(true);
  const [isMetallicOpen, setIsMetallicOpen] = useState(false);
  const [isNormalOpen, setIsNormalOpen] = useState(false);

  const albedoFileInputRef = useRef(null);
  const metallicFileInputRef = useRef(null);
  const roughnessFileInputRef = useRef(null);
  const normalFileInputRef = useRef(null);
  const activeAlbedoUploadIdRef = useRef(null);

  useEffect(() => {
    if (activeMesh) {
      setMeshNameInput(`${activeMesh} - Sample color`);
    }
  }, [activeMesh]);

  const currentCfg = store.getMeshConfig(activeMesh);
  const colors = currentCfg?.colors || [];
  const textures = currentCfg?.textures || [];
  const metalnessValue = currentCfg?.metalnessValue ?? currentCfg?.metallic ?? 0.0;
  const roughnessValue = currentCfg?.roughnessValue ?? currentCfg?.roughness ?? 0.5;
  const metalnessTexture = currentCfg?.metalnessTexture ?? currentCfg?.metallicGlossMapUrl ?? "";
  const roughnessTexture = currentCfg?.roughnessTexture || "";
  const normalIntensity = currentCfg?.normalIntensity ?? 1.0;
  const normalMap = currentCfg?.normalMap || "";

  // Preview swatch variables
  const colorVal = colors[0]?.hex || "#0A0A0A";
  const textureVal = textures[0]?.url || "";

  // ── Albedo Swatch Actions ──────────────────────────────────────────────────
  const handleAddAlbedoColor = () => {
    store.addColorToMesh(activeMesh);
  };

  const handleAlbedoColorChange = (id, newHex) => {
    store.updateColorInMesh(activeMesh, id, "hex", newHex);
  };

  const handleAlbedoColorNameChange = (id, name) => {
    store.updateColorInMesh(activeMesh, id, "name", name);
  };

  const handleAddAlbedoTexture = () => {
    runInAction(() => {
      store.addTextureToMesh(activeMesh);
      const cfg = store.getMeshConfig(activeMesh);
      const newTex = cfg.textures[cfg.textures.length - 1];
      activeAlbedoUploadIdRef.current = newTex.id;
      albedoFileInputRef.current?.click();
    });
  };

  const handleAlbedoFileUpload = async (e) => {
    const targetId = activeAlbedoUploadIdRef.current;
    if (targetId && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
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
        console.error("Albedo upload failed:", err);
        alert(`Failed to upload file: ${err.message}`);
      } finally {
        setIsUploading(false);
        e.target.value = "";
        activeAlbedoUploadIdRef.current = null;
      }
    }
  };

  // ── Metalness / Roughness Actions ───────────────────────────────────────────
  const handleMetalnessValueChange = (val) => {
    // Clamp to 0..1
    const num = isNaN(val) ? 0 : Math.min(1, Math.max(0, val));
    store.updateMeshMetalnessValue(activeMesh, num);
  };

  const handleRoughnessValueChange = (val) => {
    // Clamp to 0..1
    const num = isNaN(val) ? 0 : Math.min(1, Math.max(0, val));
    store.updateMeshRoughnessValue(activeMesh, num);
  };

  const handleMetalnessTextureUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          store.updateMeshMetalnessTexture(activeMesh, url);
        }
      } catch (err) {
        console.error("Metalness texture upload failed:", err);
        alert(`Failed to upload file: ${err.message}`);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    }
  };

  const handleRemoveMetalnessTexture = () => {
    store.updateMeshMetalnessTexture(activeMesh, "");
  };

  const handleRoughnessTextureUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          store.updateMeshRoughnessTexture(activeMesh, url);
        }
      } catch (err) {
        console.error("Roughness texture upload failed:", err);
        alert(`Failed to upload file: ${err.message}`);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    }
  };

  const handleRemoveRoughnessTexture = () => {
    store.updateMeshRoughnessTexture(activeMesh, "");
  };

  const handleNormalIntensityChange = (val) => {
    store.updateMeshNormalIntensity(activeMesh, val);
  };

  const handleNormalMapUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const res = await uploadFile(file);
        const url = res.url || res.data?.url;
        if (url) {
          store.updateMeshNormalMap(activeMesh, url);
        }
      } catch (err) {
        console.error("Normal map upload failed:", err);
        alert(`Failed to upload file: ${err.message}`);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    }
  };

  const handleRemoveNormalMap = () => {
    store.updateMeshNormalMap(activeMesh, "");
  };

  return (
    <div className="space-y-4 font-sans select-none flex flex-col h-full overflow-hidden flex-1">
      {/* Back button and Header */}
      <div className="flex items-center space-x-3 mb-2 flex-shrink-0">
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
        <span className="text-xs font-extrabold text-gray-800 truncate">
          {meshNameInput}
        </span>
      </div>

      {/* Editor Body */}
      <div className="space-y-4 border-t border-gray-100 pt-4 flex-1 overflow-y-auto pr-1">
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

        {/* Accordions */}
        <div className="mt-4 border border-gray-255 rounded-xl divide-y divide-gray-200 overflow-hidden bg-white shadow-sm">
          
          {/* ── ALBEDO ACCORDION ──────────────────────────────────────────────── */}
          <MaterialAccordion
            title="Albedo"
            isOpen={isAlbedoOpen}
            onToggle={() => setIsAlbedoOpen((prev) => !prev)}
          >
            <div className="space-y-6">
              {/* Colors subsection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Colors ({colors.length})</span>
                  <button
                    onClick={handleAddAlbedoColor}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 focus:outline-none"
                  >
                    <span>+ Add color</span>
                  </button>
                </div>
                {colors.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No colors added.</p>
                ) : (
                  <div className="space-y-2.5">
                    {colors.map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full border border-gray-300 shadow-inner flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                          <div className="w-full h-full" style={{ backgroundColor: c.hex }} />
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => handleAlbedoColorChange(c.id, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={c.hex}
                          onChange={(e) => handleAlbedoColorChange(c.id, e.target.value)}
                          className="w-16 px-1.5 py-1 text-center text-[10px] border border-gray-250 rounded font-mono text-gray-700 focus:outline-none bg-white"
                        />
                        <input
                          type="text"
                          value={c.name}
                          placeholder={`Color Option ${idx + 1}`}
                          onChange={(e) => handleAlbedoColorNameChange(c.id, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-255 rounded focus:outline-none text-gray-700 font-semibold bg-white"
                        />
                        <button
                          onClick={() => store.removeColorFromMesh(activeMesh, c.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0 focus:outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Textures subsection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Textures ({textures.length})</span>
                  <button
                    onClick={handleAddAlbedoTexture}
                    className="text-xs font-bold text-[#ff6a00] hover:text-[#e05d00] transition flex items-center gap-1 focus:outline-none"
                    disabled={isUploading}
                  >
                    <span>{isUploading ? "Uploading..." : "+ Add texture"}</span>
                  </button>
                </div>
                {textures.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No textures added.</p>
                ) : (
                  <div className="space-y-2.5">
                    {textures.map((t, idx) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-gray-300 shadow-inner flex-shrink-0 overflow-hidden bg-gray-105 flex items-center justify-center relative group">
                          {t.url ? (
                            <img src={t.url} className="w-full h-full object-cover" alt="texture" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                          <div 
                            onClick={() => {
                              activeAlbedoUploadIdRef.current = t.id;
                              albedoFileInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold cursor-pointer transition select-none"
                          >
                            Replace
                          </div>
                        </div>
                        <input
                          type="text"
                          value={t.name}
                          placeholder={`Texture Option ${idx + 1}`}
                          onChange={(e) => store.updateTextureInMesh(activeMesh, t.id, "name", e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-gray-250 rounded focus:outline-none text-gray-700 font-semibold bg-white"
                        />
                        <button
                          onClick={() => store.removeTextureFromMesh(activeMesh, t.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition flex-shrink-0 focus:outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </MaterialAccordion>

          {/* ── METALLIC & ROUGHNESS ACCORDION ────────────────────────────────── */}
          <MaterialAccordion
            title="Metallic & Roughness"
            isOpen={isMetallicOpen}
            onToggle={() => setIsMetallicOpen((prev) => !prev)}
          >
            <div className="space-y-4 py-1 divide-y divide-gray-100">
              
              {/* Metalness Section */}
              <div className="space-y-3 pb-3">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Metalness</div>
                
                {/* Metalness Slider Row */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-gray-500 w-24">Value</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={metalnessValue}
                    onChange={(e) => handleMetalnessValueChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={metalnessValue}
                    onChange={(e) => handleMetalnessValueChange(parseFloat(e.target.value))}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xs font-semibold focus:outline-none text-gray-700 bg-white"
                  />
                </div>

                {/* Metalness Texture Row */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs font-bold text-gray-500 w-24">Texture</span>
                  <div className="flex-1 flex justify-end">
                    {metalnessTexture ? (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 pr-2">
                        <div className="w-6 h-6 rounded overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          <img src={metalnessTexture} className="w-full h-full object-cover" alt="metalness map" />
                        </div>
                        <button
                          onClick={() => metallicFileInputRef.current?.click()}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold transition focus:outline-none"
                        >
                          Change
                        </button>
                        <button
                          onClick={handleRemoveMetalnessTexture}
                          className="text-xs text-red-500 hover:text-red-700 font-bold transition focus:outline-none"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => metallicFileInputRef.current?.click()}
                        className="text-[#ff6a00] hover:text-[#e05d00] font-bold text-xs transition focus:outline-none"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Roughness Section */}
              <div className="space-y-3 pt-3">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Roughness</div>

                {/* Roughness Slider Row */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-gray-505 w-24">Value</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={roughnessValue}
                    onChange={(e) => handleRoughnessValueChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={roughnessValue}
                    onChange={(e) => handleRoughnessValueChange(parseFloat(e.target.value))}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xs font-semibold focus:outline-none text-gray-700 bg-white"
                  />
                </div>

                {/* Roughness Texture Row */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs font-bold text-gray-505 w-24">Texture</span>
                  <div className="flex-1 flex justify-end">
                    {roughnessTexture ? (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 pr-2">
                        <div className="w-6 h-6 rounded overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          <img src={roughnessTexture} className="w-full h-full object-cover" alt="roughness map" />
                        </div>
                        <button
                          onClick={() => roughnessFileInputRef.current?.click()}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold transition focus:outline-none"
                        >
                          Change
                        </button>
                        <button
                          onClick={handleRemoveRoughnessTexture}
                          className="text-xs text-red-500 hover:text-red-700 font-bold transition focus:outline-none"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => roughnessFileInputRef.current?.click()}
                        className="text-[#ff6a00] hover:text-[#e05d00] font-bold text-xs transition focus:outline-none"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </MaterialAccordion>

          {/* ── NORMAL MAP ACCORDION ────────────────────────────────────────── */}
          <MaterialAccordion
            title="Normal Map"
            isOpen={isNormalOpen}
            onToggle={() => setIsNormalOpen((prev) => !prev)}
          >
            <div className="space-y-4 py-1">
              
              {/* Normal Intensity Slider Row */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-gray-550 w-24">Intensity</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={normalIntensity}
                  onChange={(e) => handleNormalIntensityChange(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.05"
                  value={normalIntensity}
                  onChange={(e) => handleNormalIntensityChange(parseFloat(e.target.value))}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xs font-semibold focus:outline-none text-gray-700 bg-white"
                />
              </div>

              {/* Normal Map Texture Row */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-xs font-bold text-gray-550 w-24">Texture</span>
                <div className="flex-1 flex justify-end">
                  {normalMap ? (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 pr-2">
                      <div className="w-6 h-6 rounded overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        <img src={normalMap} className="w-full h-full object-cover" alt="normal map" />
                      </div>
                      <button
                        onClick={() => normalFileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold transition focus:outline-none"
                      >
                        Change
                      </button>
                      <button
                        onClick={handleRemoveNormalMap}
                        className="text-xs text-red-500 hover:text-red-700 font-bold transition focus:outline-none"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => normalFileInputRef.current?.click()}
                      className="text-[#ff6a00] hover:text-[#e05d00] font-bold text-xs transition focus:outline-none"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>

            </div>
          </MaterialAccordion>

        </div>
      </div>

      {/* Hidden File inputs */}
      <input
        type="file"
        ref={albedoFileInputRef}
        onChange={handleAlbedoFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={metallicFileInputRef}
        onChange={handleMetalnessTextureUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={roughnessFileInputRef}
        onChange={handleRoughnessTextureUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={normalFileInputRef}
        onChange={handleNormalMapUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
});
