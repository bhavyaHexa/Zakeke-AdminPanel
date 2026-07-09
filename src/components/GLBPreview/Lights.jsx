import React from "react";

export const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 10, 7]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
};
