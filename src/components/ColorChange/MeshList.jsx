import React from "react";
import { observer } from "mobx-react-lite";

export const MeshList = observer(({ store, onOpenDetail }) => {
  return (
    <div className="space-y-4">
      {/* Description info */}
      <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed select-none">
        <p className="font-semibold text-blue-900 mb-1">Optional</p>
        Customize the materials for your 3D model to adjust colors and textures to match the real appearance of your product.{" "}
        <a href="#" className="underline text-blue-600 font-bold">
          Read here.
        </a>
      </div>

      {/* Listing meshes */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {store.availableMeshes.map((meshName) => {
          const cfg = store.getMeshConfig(meshName);
          const color = cfg?.colors?.[0]?.hex;
          const texture = cfg?.textures?.[0]?.url;

          return (
            <div
              key={meshName}
              onClick={() => onOpenDetail(meshName)}
              className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {/* Color block / texture thumbnail */}
                <div className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden bg-gray-105 shadow-inner">
                  {color ? (
                    <div className="w-full h-full" style={{ backgroundColor: color }} />
                  ) : texture ? (
                    <img src={texture} className="w-full h-full object-cover" alt="texture" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-250" />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-700 truncate">
                  {meshName} - Sample color
                </span>
              </div>
              <span className="text-gray-400 text-sm font-semibold pr-1">&gt;</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
