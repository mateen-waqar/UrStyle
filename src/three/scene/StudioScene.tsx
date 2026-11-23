"use client";

import React from "react";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { StudioLighting } from "./StudioLighting";
import { AvatarModel } from "../avatars/AvatarModel";
import { CameraRig } from "./CameraRig";
import { useStudioStore } from "@/stores/studioStore";

export function StudioScene() {
  const { settings } = useStudioStore();

  return (
    <>
      {/* Dynamic Camera Interpolation Rig */}
      <CameraRig />

      {/* Editorial Three-Point Studio Lighting */}
      <StudioLighting intensity={settings.lightingIntensity} />

      {/* Interactive Orbit Controls with Bounded Angles */}
      <OrbitControls
        makeDefault
        target={[0, 1.15, 0]}
        minDistance={1.2}
        maxDistance={5.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.02}
        autoRotate={settings.autoRotate}
        autoRotateSpeed={1.2}
        enablePan={false}
      />

      {/* Stylized Realistic 3D Avatar & Modular Equipped Garments */}
      <AvatarModel />

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.65}
        scale={3.6}
        blur={1.8}
        far={2}
        resolution={1024}
        color="#080809"
      />

      {/* Editorial Neutral Studio Stage Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <circleGeometry args={[2.5, 64]} />
        <meshStandardMaterial color="#211e1c" roughness={0.82} metalness={0.05} />
      </mesh>

      {/* Optional Editorial Studio Grid */}
      {settings.showGrid && (
        <Grid
          renderOrder={-1}
          position={[0, 0, 0]}
          infiniteGrid
          cellSize={0.4}
          cellThickness={0.5}
          cellColor="#383430"
          sectionSize={1.6}
          sectionThickness={1.0}
          sectionColor="#4d443c"
          fadeDistance={8}
        />
      )}
    </>
  );
}
