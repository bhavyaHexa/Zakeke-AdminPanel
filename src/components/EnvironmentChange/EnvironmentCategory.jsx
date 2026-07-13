import { observer } from "mobx-react-lite";
import { useMainContext } from "../../context/MainContextProvider";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

export const EnvironmentCategory = observer(() => {
  const { design3dManager } = useMainContext();
  const envStore = design3dManager.environmentStoreManager;
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
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

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">3. Environment Settings</h2>

      <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Category: Environment Mapping</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HDRI Environment Map (.hdr / .exr / .env)</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${envStore.envFile || envStore.envFileUrl ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-white'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                {envStore.envFile || envStore.envFileUrl ? (
                  <>
                    <ImageIcon className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-medium text-green-700">
                      {envStore.envFile ? envStore.envFile.name : (envStore.envFileUrl.split('/').pop() || "Loaded Environment Map")}
                    </p>
                    {envStore.envFile && (
                      <p className="text-xs text-green-600">{(envStore.envFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    )}
                    
                    {envStore.isUploading && (
                      <p className="text-xs text-blue-500 mt-1 animate-pulse font-medium">Uploading to Shopify Files...</p>
                    )}
                    {!envStore.isUploading && envStore.envFileUrl && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">✓ Uploaded to Shopify Files</p>
                    )}
                    {envStore.uploadError && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Upload Error: {envStore.uploadError}</p>
                    )}
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Click to upload environment map</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="range" 
                  min="0" max="5" step="0.1" 
                  value={envStore.intensity}
                  onChange={(e) => handleIntensityChange(e.target.value)}
                  className="flex-1"
                />
                <input 
                  type="number" 
                  min="0" step="0.1"
                  value={envStore.intensity}
                  onChange={(e) => handleIntensityChange(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (Euler Angles)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 text-center">X</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={envStore.rotation.x}
                    onChange={(e) => handleAxisChange('x', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 text-center">Y</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={envStore.rotation.y}
                    onChange={(e) => handleAxisChange('y', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 text-center">Z</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={envStore.rotation.z}
                    onChange={(e) => handleAxisChange('z', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
