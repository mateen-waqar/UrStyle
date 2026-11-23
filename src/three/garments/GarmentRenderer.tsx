"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { AvatarGarmentRenderItem, GarmentSlot } from "@/types";

interface GarmentRendererProps {
  slot: GarmentSlot;
  garment: AvatarGarmentRenderItem;
  isFemale?: boolean;
  wireframe?: boolean;
}

export function GarmentRenderer({
  slot,
  garment,
  isFemale = false,
  wireframe = false,
}: GarmentRendererProps) {
  const color = garment.color || "#181716";
  const roughness = garment.roughness ?? 0.7;
  const metalness = garment.metalness ?? 0.05;

  // Cleanup materials and geometries when unmounted
  useEffect(() => {
    return () => {
      // Automatic Three.js disposal
    };
  }, []);

  const materialProps = useMemo(
    () => ({
      color: new THREE.Color(color),
      roughness,
      metalness,
      wireframe,
    }),
    [color, roughness, metalness, wireframe]
  );

  // Render modular stylized 3D garments by slot
  switch (slot) {
    // -------------------------------------------------------------------------
    // 1. INNER_TOP (T-shirt, Shirt, Polo, Sweater, Hoodie)
    // -------------------------------------------------------------------------
    case "INNER_TOP":
      return (
        <group name="garment-inner-top">
          {/* Main Torso Wrap */}
          <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[
                isFemale ? 0.135 : 0.165,
                isFemale ? 0.125 : 0.135,
                0.41,
                24,
              ]}
            />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Collar Band */}
          <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.065, 0.012, 12, 24]} />
            <meshStandardMaterial
              color={color}
              roughness={Math.min(1.0, roughness + 0.1)}
              metalness={metalness}
              wireframe={wireframe}
            />
          </mesh>

          {/* Left Sleeve */}
          <group position={[-0.205, 1.38, 0]} rotation={[0, 0, -0.15]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.045, 0.22, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>

          {/* Right Sleeve */}
          <group position={[0.205, 1.38, 0]} rotation={[0, 0, 0.15]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.045, 0.22, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>

          {/* Bottom Hem Trim */}
          <mesh position={[0, 1.045, 0]}>
            <cylinderGeometry
              args={[
                isFemale ? 0.128 : 0.138,
                isFemale ? 0.128 : 0.138,
                0.02,
                24,
              ]}
            />
            <meshStandardMaterial
              color={color}
              roughness={roughness}
              metalness={metalness}
              wireframe={wireframe}
            />
          </mesh>
        </group>
      );

    // -------------------------------------------------------------------------
    // 2. OUTER_TOP (Blazer, Jacket, Coat - Layer 1 Offset)
    // -------------------------------------------------------------------------
    case "OUTER_TOP":
      return (
        <group name="garment-outer-top" scale={[1.06, 1.02, 1.07]}>
          {/* Main Structured Jacket Body */}
          <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[
                isFemale ? 0.145 : 0.18,
                isFemale ? 0.138 : 0.155,
                0.46,
                24,
                1,
                true, // open front
                Math.PI * 0.15,
                Math.PI * 1.7,
              ]}
            />
            <meshStandardMaterial {...materialProps} side={THREE.DoubleSide} />
          </mesh>

          {/* Notched Lapels / Collar */}
          <mesh position={[0, 1.34, 0.13]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.18, 0.24, 0.015]} />
            <meshStandardMaterial
              color={color}
              roughness={Math.max(0.2, roughness - 0.1)}
              metalness={metalness}
              wireframe={wireframe}
            />
          </mesh>

          {/* Left Jacket Sleeve */}
          <group position={[-0.22, 1.39, 0]} rotation={[0, 0, -0.15]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.048, 0.44, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>

          {/* Right Jacket Sleeve */}
          <group position={[0.22, 1.39, 0]} rotation={[0, 0, 0.15]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.048, 0.44, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        </group>
      );

    // -------------------------------------------------------------------------
    // 3. BOTTOM (Trousers, Jeans, Chinos, Shorts, Joggers)
    // -------------------------------------------------------------------------
    case "BOTTOM":
      return (
        <group name="garment-bottom">
          {/* Waistband & Pelvis */}
          <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[
                isFemale ? 0.14 : 0.15,
                isFemale ? 0.15 : 0.155,
                0.18,
                24,
              ]}
            />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Left Leg Pant */}
          <mesh position={[-0.1, 0.52, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.058, 0.78, 18]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Right Leg Pant */}
          <mesh position={[0.1, 0.52, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.058, 0.78, 18]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Ankle Cuffs */}
          <mesh position={[-0.1, 0.13, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 18]} />
            <meshStandardMaterial
              color={color}
              roughness={roughness}
              metalness={metalness}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0.1, 0.13, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 18]} />
            <meshStandardMaterial
              color={color}
              roughness={roughness}
              metalness={metalness}
              wireframe={wireframe}
            />
          </mesh>
        </group>
      );

    // -------------------------------------------------------------------------
    // 4. FOOTWEAR (Sneakers, Loafers, Oxfords, Boots)
    // -------------------------------------------------------------------------
    case "FOOTWEAR":
      return (
        <group name="garment-footwear">
          {/* Left Shoe */}
          <group position={[-0.1, 0.05, 0.03]} castShadow receiveShadow>
            {/* Shoe Upper */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.088, 0.07, 0.22]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Rubber / Leather Sole */}
            <mesh position={[0, -0.035, 0]}>
              <boxGeometry args={[0.092, 0.035, 0.23]} />
              <meshStandardMaterial
                color="#f8f8f6"
                roughness={0.9}
                metalness={0.02}
                wireframe={wireframe}
              />
            </mesh>
          </group>

          {/* Right Shoe */}
          <group position={[0.1, 0.05, 0.03]} castShadow receiveShadow>
            {/* Shoe Upper */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.088, 0.07, 0.22]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Rubber / Leather Sole */}
            <mesh position={[0, -0.035, 0]}>
              <boxGeometry args={[0.092, 0.035, 0.23]} />
              <meshStandardMaterial
                color="#f8f8f6"
                roughness={0.9}
                metalness={0.02}
                wireframe={wireframe}
              />
            </mesh>
          </group>
        </group>
      );

    // -------------------------------------------------------------------------
    // 5. WRIST (Timepiece, Watch)
    // -------------------------------------------------------------------------
    case "WRIST":
      return (
        <group position={[-0.26, 1.05, 0]} rotation={[0, 0, -0.15]}>
          {/* Watch Strap */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.036, 0.008, 12, 24]} />
            <meshStandardMaterial
              color="#2a2421" // leather strap
              roughness={0.7}
              metalness={0.1}
              wireframe={wireframe}
            />
          </mesh>
          {/* Watch Bezel & Dial */}
          <mesh position={[-0.035, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.006, 24]} />
            <meshStandardMaterial
              color="#d4af37" // brushed gold / steel bezel
              roughness={0.25}
              metalness={0.9}
              wireframe={wireframe}
            />
          </mesh>
        </group>
      );

    // -------------------------------------------------------------------------
    // 6. FACE (Eyewear, Sunglasses)
    // -------------------------------------------------------------------------
    case "FACE":
      return (
        <group position={[0, 1.63, 0.11]}>
          {/* Sunglasses Frame */}
          <mesh position={[-0.035, 0, 0]}>
            <boxGeometry args={[0.036, 0.024, 0.005]} />
            <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0.035, 0, 0]}>
            <boxGeometry args={[0.036, 0.024, 0.005]} />
            <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[0.016, 0.004, 0.004]} />
            <meshStandardMaterial color="#c5a059" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      );

    // -------------------------------------------------------------------------
    // 7. HEAD (Caps, Hats)
    // -------------------------------------------------------------------------
    case "HEAD":
      return (
        <group position={[0, 1.72, 0]}>
          {/* Cap Crown */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.122, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Cap Visor / Brim */}
          <mesh position={[0, -0.01, 0.1]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.14, 0.008, 0.09]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}
