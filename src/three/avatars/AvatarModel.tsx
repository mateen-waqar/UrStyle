"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useAvatarStore } from "@/stores/avatarStore";
import { GarmentRenderer } from "../garments/GarmentRenderer";
import { GarmentSlot } from "@/types";

export function AvatarModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { currentProfile, activeGarments, showWireframe } = useAvatarStore();

  const skinColor = currentProfile?.skinColor || "#e6c3a5";
  const hairColor = currentProfile?.hairColor || "#1e1e24";
  const heightScale = currentProfile?.heightScale || 1.0;
  const shoulderWidth = currentProfile?.shoulderWidth || 1.0;
  const waistWidth = currentProfile?.waistWidth || 1.0;
  const isFemale = currentProfile?.gender === "FEMALE";

  return (
    <group
      ref={groupRef}
      scale={[shoulderWidth, heightScale, waistWidth]}
      position={[0, 0, 0]}
    >
      {/* ----------------------------------------------------------------- */}
      {/* 1. HEAD & FACIAL SCULPT */}
      {/* ----------------------------------------------------------------- */}
      <group position={[0, 1.62, 0]}>
        {/* Cranium & Head */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[isFemale ? 0.105 : 0.112, 32, 32]} />
          <meshStandardMaterial
            color={skinColor}
            roughness={0.62}
            wireframe={showWireframe}
          />
        </mesh>

        {/* Jawline & Chin */}
        <mesh position={[0, -0.05, 0.03]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[isFemale ? 0.08 : 0.095, 0.08, 0.09]} />
          <meshStandardMaterial
            color={skinColor}
            roughness={0.62}
            wireframe={showWireframe}
          />
        </mesh>

        {/* Nose Bridge */}
        <mesh position={[0, -0.02, 0.11]} rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[0.015, 0.04, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.62} />
        </mesh>

        {/* Left & Right Ears */}
        <mesh position={[-0.108, 0, -0.01]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.012, 0.045, 0.025]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        <mesh position={[0.108, 0, -0.01]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.012, 0.045, 0.025]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>

        {/* Stylized Hair Sculpt */}
        <mesh position={[0, 0.06, -0.015]} castShadow>
          <sphereGeometry args={[isFemale ? 0.115 : 0.118, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial
            color={hairColor}
            roughness={0.85}
            metalness={0.05}
            wireframe={showWireframe}
          />
        </mesh>
      </group>

      {/* ----------------------------------------------------------------- */}
      {/* 2. NECK & CLAVICLE */}
      {/* ----------------------------------------------------------------- */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[isFemale ? 0.042 : 0.048, isFemale ? 0.048 : 0.054, 0.08, 24]} />
        <meshStandardMaterial
          color={skinColor}
          roughness={0.62}
          wireframe={showWireframe}
        />
      </mesh>

      {/* ----------------------------------------------------------------- */}
      {/* 3. BASE BODY ANATOMICAL UNDERLAYER */}
      {/* (Rendered underneath equipped clothing so avatar skin shows naturally) */}
      {/* ----------------------------------------------------------------- */}
      {!activeGarments.INNER_TOP && (
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[
              isFemale ? 0.125 : 0.155,
              isFemale ? 0.115 : 0.125,
              0.4,
              24,
            ]}
          />
          <meshStandardMaterial
            color={skinColor}
            roughness={0.65}
            wireframe={showWireframe}
          />
        </mesh>
      )}

      {/* Arms & Hands */}
      {/* Left Arm */}
      <group position={[-0.205, 1.38, 0]} rotation={[0, 0, -0.1]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[isFemale ? 0.034 : 0.038, isFemale ? 0.028 : 0.032, 0.44, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        {/* Left Hand */}
        <mesh position={[0, -0.46, 0]} castShadow>
          <boxGeometry args={[0.024, 0.065, 0.045]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.205, 1.38, 0]} rotation={[0, 0, 0.1]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[isFemale ? 0.034 : 0.038, isFemale ? 0.028 : 0.032, 0.44, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        {/* Right Hand */}
        <mesh position={[0, -0.46, 0]} castShadow>
          <boxGeometry args={[0.024, 0.065, 0.045]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
      </group>

      {/* Base Legs (if no bottom garment equipped) */}
      {!activeGarments.BOTTOM && (
        <group>
          <mesh position={[-0.1, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.048, 0.76, 18]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
          <mesh position={[0.1, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.048, 0.76, 18]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
        </group>
      )}

      {/* Base Feet (if no footwear equipped) */}
      {!activeGarments.FOOTWEAR && (
        <group>
          <mesh position={[-0.1, 0.035, 0.03]} castShadow>
            <boxGeometry args={[0.075, 0.05, 0.18]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
          <mesh position={[0.1, 0.035, 0.03]} castShadow>
            <boxGeometry args={[0.075, 0.05, 0.18]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>
        </group>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. MODULAR ATTACHED GARMENTS & ACCESSORIES */}
      {/* ----------------------------------------------------------------- */}
      {(Object.keys(activeGarments) as GarmentSlot[]).map((slotKey) => {
        const garment = activeGarments[slotKey];
        if (!garment) return null;

        return (
          <GarmentRenderer
            key={slotKey}
            slot={slotKey}
            garment={garment}
            isFemale={isFemale}
            wireframe={showWireframe}
          />
        );
      })}
    </group>
  );
}
