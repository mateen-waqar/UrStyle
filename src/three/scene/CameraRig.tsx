"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStudioStore } from "@/stores/studioStore";

export function CameraRig() {
  const { camera } = useThree();
  const { settings } = useStudioStore();
  const targetPos = useRef(new THREE.Vector3(...settings.cameraPosition));

  useEffect(() => {
    targetPos.current.set(...settings.cameraPosition);
  }, [settings.cameraPosition]);

  useFrame((_, delta) => {
    // Smooth camera lerp transition
    camera.position.lerp(targetPos.current, Math.min(1, delta * 4));
    camera.lookAt(0, 1.15, 0);
  });

  return null;
}
