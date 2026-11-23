"use client";

import React from "react";

interface StudioLightingProps {
  intensity?: number;
}

export function StudioLighting({ intensity = 1.2 }: StudioLightingProps) {
  return (
    <>
      {/* Editorial Key Light: warm frontal accent */}
      <directionalLight
        position={[3, 4, 3]}
        intensity={1.2 * intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
        color="#fffaf0"
      />

      {/* Fill Light: soft cool counter balance */}
      <directionalLight
        position={[-3, 2, 2]}
        intensity={0.6 * intensity}
        color="#e6f0fa"
      />

      {/* Rim / Silhouette Light: hair & garment edge separation */}
      <spotLight
        position={[0, 4, -3]}
        intensity={1.5 * intensity}
        angle={0.6}
        penumbra={0.8}
        color="#fff4e0"
      />

      {/* Soft Ambient Bounce */}
      <ambientLight intensity={0.4 * intensity} color="#ffffff" />
    </>
  );
}
