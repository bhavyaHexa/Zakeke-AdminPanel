import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import { useMainContext } from "../../context/MainContextProvider";
import { SceneContainer } from "./SceneContainer";
import { RefreshCw, Layout, Settings, X, UploadCloud, Image as ImageIcon, Pencil } from "lucide-react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { runInAction } from "mobx";

export const GLBPreview = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;
  const envStore = design3dManager.environmentStoreManager;
  const glbFile = configuratorStore.glbFile;
  const glbFileUrl = configuratorStore.glbFileUrl;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hoveredMesh, setHoveredMesh] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [showSceneSettings, setShowSceneSettings] = useState(false);

  const fitCameraRef = useRef(null);
  const replaceInputRef = useRef(null);
  const envFileInputRef = useRef(null);

  // Manage stable blob or remote URL
  useEffect(() => {
    if (glbFile) {
      const url = URL.createObjectURL(glbFile);
      setBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (glbFileUrl) {
      setBlobUrl(glbFileUrl);
    } else {
      setBlobUrl("");
    }
  }, [glbFile, glbFileUrl]);

  const handleResetCamera = () => {
    if (fitCameraRef.current) {
      fitCameraRef.current();
    }
  };

  const parseGLB = (file) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    const url = URL.createObjectURL(file);

    loader.load(
      url,
      (gltf) => {
        const meshes = [];
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.name) {
            meshes.push(child.name);
          }
        });
        
        const uniqueMeshes = [...new Set(meshes)];
        runInAction(() => {
          configuratorStore.setAvailableMeshes(uniqueMeshes);
        });
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error("Error parsing GLB:", error);
        URL.revokeObjectURL(url);
      }
    );
  };

  const handleReplaceModel = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      configuratorStore.uploadGlbFile(file);
      parseGLB(file);
    }
  };

  const handleEnvFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      envStore.uploadEnvFile(e.target.files[0]);
    }
  };

  const handleAxisChange = (axis, value) => {
    envStore.setRotation(axis, parseFloat(value) || 0);
  };

  const handleIntensityChange = (value) => {
    envStore.setIntensity(parseFloat(value) || 0);
  };

  if (!blobUrl) return null;

  return (
    <div className="relative border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 h-full min-h-[300px]">
      {/* Header Panel */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Layout className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">3D Interactive Preview</h3>
        </div>
        <div>
          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center space-x-1 shadow-sm"
            title="Reset Camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Camera</span>
          </button>
        </div>
      </div>

      {/* Main Preview Frame */}
      <div className="relative w-full bg-gray-100 flex-1 h-full">
        <SceneContainer
          glbFile={glbFile}
          blobUrl={blobUrl}
          configuratorStore={configuratorStore}
          envStore={envStore}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setHoveredMesh={setHoveredMesh}
          onFitCameraRef={fitCameraRef}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10">
            <div className="w-9 h-9 border-3 border-gray-250 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-700 animate-pulse">Initializing 3D Model...</p>
          </div>
        )}

        {/* Error overlay */}
        {errorMsg && (
          <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
            <p className="text-xs text-red-500 mt-1">Please try uploading a different valid GLB file.</p>
          </div>
        )}

        {/* REPLACE Button (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10">
          <input
            type="file"
            accept=".glb"
            className="hidden"
            ref={replaceInputRef}
            onChange={handleReplaceModel}
          />
          <button
            onClick={() => replaceInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-200 hover:border-gray-300 font-bold rounded-lg text-xs transition shadow-md backdrop-blur-sm"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span>Replace Model</span>
          </button>
        </div>

        {/* SCENE SETTINGS Button (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end">
          {/* Floating Settings Card */}
          {showSceneSettings && (
            <div className="mb-2 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-xl p-4 w-72 space-y-4 text-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                  Scene Environment
                </h4>
                <button
                  onClick={() => setShowSceneSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload environment map */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-600">
                  HDRI Map (.hdr, .exr, .env)
                </label>
                <div
                  onClick={() => envFileInputRef.current?.click()}
                  className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition ${
                    envStore.envFile || envStore.envFileUrl
                      ? "border-green-400 bg-green-50/50 hover:bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    type="file"
                    accept=".hdr,.exr,.env"
                    className="hidden"
                    ref={envFileInputRef}
                    onChange={handleEnvFileChange}
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {envStore.envFile || envStore.envFileUrl ? (
                      <>
                        <ImageIcon className="w-4 h-4 text-green-500" />
                        <p className="text-[10px] font-semibold text-green-700 truncate max-w-[210px]">
                          {envStore.envFile ? envStore.envFile.name : (envStore.envFileUrl?.split("/").pop() || "Loaded Environment")}
                        </p>
                        {envStore.isUploading && (
                          <p className="text-[9px] text-blue-500 animate-pulse font-medium">Uploading...</p>
                        )}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-gray-400" />
                        <p className="text-[10px] text-gray-500">Upload custom HDR</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Intensity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-semibold text-gray-600">
                  <span>Intensity</span>
                  <span className="font-mono text-blue-600 text-[10px]">{envStore.intensity.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={envStore.intensity}
                    onChange={(e) => handleIntensityChange(e.target.value)}
                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="3"
                    step="0.1"
                    value={envStore.intensity}
                    onChange={(e) => handleIntensityChange(e.target.value)}
                    className="w-14 px-1.5 py-1 text-center text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-600">
                  Rotation (Euler Angles)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[9px] text-gray-500 text-center font-mono">X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={envStore.rotation?.x ?? 0}
                      onChange={(e) => handleAxisChange("x", e.target.value)}
                      className="w-full px-1.5 py-1 text-center text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 text-center font-mono">Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={envStore.rotation?.y ?? 0}
                      onChange={(e) => handleAxisChange("y", e.target.value)}
                      className="w-full px-1.5 py-1 text-center text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 text-center font-mono">Z</label>
                    <input
                      type="number"
                      step="0.1"
                      value={envStore.rotation?.z ?? 0}
                      onChange={(e) => handleAxisChange("z", e.target.value)}
                      className="w-full px-1.5 py-1 text-center text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowSceneSettings((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-2 border rounded-lg text-xs font-bold transition shadow-md backdrop-blur-sm ${
              showSceneSettings
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/90 hover:bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <Settings className={`w-3.5 h-3.5 ${showSceneSettings ? "animate-spin-slow" : "text-blue-600"}`} />
            <span>Scene Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
});
