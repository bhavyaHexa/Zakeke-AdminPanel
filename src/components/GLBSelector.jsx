import { observer } from "mobx-react-lite";
import { useStores } from "../stores/rootStore";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export const GLBSelector = observer(() => {
  const { configuratorStore } = useStores();
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
      configuratorStore.setGlbFile(file);
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
      configuratorStore.setGlbFile(file);
      parseGLB(file);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Select 3D Model</h2>
      <div 
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${configuratorStore.glbFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
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
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className={`w-10 h-10 ${configuratorStore.glbFile ? 'text-green-500' : 'text-gray-400'}`} />
          {configuratorStore.glbFile ? (
            <div>
              <p className="text-sm font-medium text-green-700">File Selected: {configuratorStore.glbFile.name}</p>
              <p className="text-xs text-green-600 mt-1">{(configuratorStore.glbFile.size / 1024 / 1024).toFixed(2)} MB</p>
              {isParsing && <p className="text-xs text-blue-500 mt-2">Parsing meshes...</p>}
              {!isParsing && !parseError && <p className="text-xs text-green-600 mt-2">Parsed {configuratorStore.availableMeshes.length} meshes</p>}
              {parseError && <p className="text-xs text-red-500 mt-2">{parseError}</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">Click or drag .glb file here</p>
              <p className="text-xs text-gray-500 mt-1">Only .glb files are supported</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
