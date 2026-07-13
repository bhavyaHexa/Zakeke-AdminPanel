import { observer } from "mobx-react-lite";
import { useMainContext } from "../context/MainContextProvider";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLBPreview } from "./GLBPreview/GLBPreview";

export const GLBSelector = observer(() => {
  const { design3dManager } = useMainContext();
  const configuratorStore = design3dManager.colorStoreManager;

  const fileInputRef = useRef(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  const parseGLB = (file) => {
    setIsParsing(true);
    setParseError(null);

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
        
        // Remove duplicates if any
        const uniqueMeshes = [...new Set(meshes)];
        configuratorStore.setAvailableMeshes(uniqueMeshes);
        
        URL.revokeObjectURL(url);
        setIsParsing(false);
      },
      undefined,
      (error) => {
        console.error("Error parsing GLB:", error);
        setParseError("Failed to parse GLB file. Make sure it's valid.");
        URL.revokeObjectURL(url);
        setIsParsing(false);
      }
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      configuratorStore.uploadGlbFile(file);
      parseGLB(file);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      configuratorStore.uploadGlbFile(file);
      parseGLB(file);
    }
  };

  const hasModel = configuratorStore.glbFile || configuratorStore.glbFileUrl;

  if (hasModel) {
    return <GLBPreview />;
  }

  return (
    <div 
      className="relative border-2 border-dashed border-gray-300 hover:border-blue-450 rounded-xl bg-white hover:bg-blue-50/10 p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 flex-1 h-full min-h-[300px]"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept=".glb" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-800">Upload 3D Model</p>
          <p className="text-sm text-gray-500 mt-1">Drag and drop your model (.glb) file here or click to browse</p>
        </div>
        
        {configuratorStore.isUploading && (
          <p className="text-xs text-blue-550 mt-2 animate-pulse font-medium">Uploading to Shopify Files...</p>
        )}
        {configuratorStore.uploadError && (
          <p className="text-xs text-red-500 mt-2 font-medium">Upload Error: {configuratorStore.uploadError}</p>
        )}
        
        {isParsing && <p className="text-xs text-blue-500 mt-2">Parsing meshes...</p>}
        {parseError && <p className="text-xs text-red-500 mt-2">{parseError}</p>}
      </div>
    </div>
  );
});
