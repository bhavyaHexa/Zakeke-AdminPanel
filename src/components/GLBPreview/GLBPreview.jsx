import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import { useMainContext } from "../../context/MainContextProvider";
import { SceneContainer } from "./SceneContainer";
import { RefreshCw, HelpCircle, Layout } from "lucide-react";

export const GLBPreview = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;
  const glbFile = configuratorStore.glbFile;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hoveredMesh, setHoveredMesh] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const fitCameraRef = useRef(null);

  // Manage stable blob URL
  useEffect(() => {
    if (!glbFile) {
      setBlobUrl("");
      return;
    }
    
    const url = URL.createObjectURL(glbFile);
    setBlobUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [glbFile]);

  const handleResetCamera = () => {
    if (fitCameraRef.current) {
      fitCameraRef.current();
    }
  };

  if (!glbFile || !blobUrl) return null;

  return (
    <div className="mt-6 border border-gray-100 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header Panel */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layout className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800 text-sm">3D Model Interactive Preview</h3>
        </div>
        <div>
          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center space-x-1 shadow-sm"
            title="Reset Camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Camera</span>
          </button>
        </div>
      </div>

      {/* Main Preview Frame */}
      <div className="relative w-full bg-gray-100 h-[350px] md:h-[400px]">
        {/* Modularized Scene Container */}
        <SceneContainer
          glbFile={glbFile}
          blobUrl={blobUrl}
          configuratorStore={configuratorStore}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setHoveredMesh={setHoveredMesh}
          onFitCameraRef={fitCameraRef}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10">
            <div className="w-9 h-9 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-gray-700 animate-pulse">Initializing 3D Viewer...</p>
          </div>
        )}

        {/* Error overlay */}
        {errorMsg && (
          <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
            <p className="text-xs text-red-500 mt-1">Please try uploading a different valid GLB file.</p>
          </div>
        )}

        {/* Hovered Mesh Overlay */}
        {hoveredMesh && (
          <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm pointer-events-none shadow-md border border-white/10">
            Hovered Mesh: <span className="text-blue-300 font-bold">{hoveredMesh}</span>
          </div>
        )}
      </div>
    </div>
  );
});
