"use client";

import React, { Suspense, Component, ErrorInfo, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { StudioScene } from "../scene/StudioScene";
import { useStudioStore } from "@/stores/studioStore";
import { RefreshCw, AlertTriangle, Box } from "lucide-react";

interface StudioCanvasProps {
  className?: string;
  fallback2D?: ReactNode;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("3D WebGL Canvas failed, falling back to 2D view:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function StudioCanvas({ className, fallback2D }: StudioCanvasProps) {
  const { settings } = useStudioStore();

  const defaultFallback = (
    <div className="h-full w-full bg-charcoal flex flex-col items-center justify-center text-stone-400 p-8 text-center space-y-3">
      <AlertTriangle className="h-8 w-8 text-amber-500" />
      <p className="text-sm font-medium text-cream">WebGL Context Unavailable</p>
      <p className="text-xs text-stone-400 max-w-sm">
        Displaying 2D garment composition fallback. Enable WebGL hardware acceleration in your browser to interact with the full 3D Virtual Studio.
      </p>
    </div>
  );

  return (
    <div className={className || "relative h-full w-full bg-gradient-to-b from-[#1c1a18] via-[#141211] to-[#0c0b0a]"}>
      <CanvasErrorBoundary fallback={fallback2D || defaultFallback}>
        <Canvas
          shadows
          camera={{
            position: settings.cameraPosition,
            fov: settings.cameraFov,
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
          dpr={[1, 2]}
        >
          <Suspense
            fallback={
              <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#d4c5b0" wireframe />
              </mesh>
            }
          >
            <StudioScene />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
