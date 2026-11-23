"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAvatarStore } from "@/stores/avatarStore";
import { useStudioStore } from "@/stores/studioStore";
import { wardrobeMappingService } from "@/modules/3d-virtual-studio/services/wardrobeMappingService";
import { WardrobeItemDto, GarmentSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shirt,
  Layers,
  Box,
  Eye,
  RotateCw,
  RefreshCw,
  SlidersHorizontal,
  Save,
  Check,
  Trash2,
  Plus,
  Compass,
  AlertCircle,
  Camera,
  Sun,
  Grid as GridIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Three.js Studio Canvas without SSR
const StudioCanvas = dynamic(
  () => import("@/three/canvas/StudioCanvas").then((mod) => mod.StudioCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#121110] flex flex-col items-center justify-center text-stone-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-beige-400" />
        <span className="text-xs font-mono tracking-widest uppercase text-stone-400">
          Initializing 3D Virtual Studio...
        </span>
      </div>
    ),
  }
);

const SKIN_TONES = [
  { label: "Porcelain", hex: "#f8dfd4" },
  { label: "Warm Sand", hex: "#e6c3a5" },
  { label: "Golden Olive", hex: "#c69c6d" },
  { label: "Deep Bronze", hex: "#8d5b36" },
  { label: "Rich Espresso", hex: "#482b1d" },
];

const HAIR_COLORS = [
  { label: "Noir", hex: "#161514" },
  { label: "Chestnut", hex: "#3b2219" },
  { label: "Golden Honey", hex: "#b38b4d" },
  { label: "Silver Grey", hex: "#a09f9c" },
];

export default function VirtualStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[#121110] flex items-center justify-center text-stone-400">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading Studio...</span>
        </div>
      }
    >
      <VirtualStudioContent />
    </Suspense>
  );
}

function VirtualStudioContent() {
  const searchParams = useSearchParams();

  // Stores
  const {
    currentProfile,
    setCurrentProfile,
    updateAvatarDimensions,
    activeGarments,
    setGarmentForSlot,
    clearGarments,
    showWireframe,
    toggleWireframe,
  } = useAvatarStore();

  const { settings, updateSettings, resetCamera } = useStudioStore();

  // Local UI State
  const [activeSideTab, setActiveSideTab] = useState<"layers" | "wardrobe" | "avatar" | "lighting">("layers");
  const [wardrobeCategory, setWardrobeCategory] = useState<string>("ALL");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItemDto[]>([]);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState<boolean>(false);
  const [is2DMode, setIs2DMode] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [outfitTitle, setOutfitTitle] = useState("Virtual Studio Ensemble");

  const isFemale = currentProfile?.gender === "FEMALE";

  // 1. Fetch Wardrobe Inventory
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingWardrobe(true);
      try {
        const res = await fetch("/api/wardrobe?status=AVAILABLE&limit=100");
        if (res.ok) {
          const data = await res.json();
          setWardrobeItems(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load wardrobe in studio:", err);
      } finally {
        setIsLoadingWardrobe(false);
      }
    };
    fetchItems();
  }, []);

  // 2. Consume Outfits from URL Query Parameters (?items=id1,id2,...)
  useEffect(() => {
    const itemsParam = searchParams.get("items");
    if (!itemsParam || wardrobeItems.length === 0) return;

    const targetIds = itemsParam.split(",").map((s) => s.trim());
    targetIds.forEach((id) => {
      const found = wardrobeItems.find((w) => w.id === id);
      if (found) {
        const renderItem = wardrobeMappingService.mapWardrobeItemTo3D(
          found,
          isFemale ? "FEMALE" : "MALE"
        );
        setGarmentForSlot(renderItem.slot, renderItem);
      }
    });
  }, [searchParams, wardrobeItems, isFemale, setGarmentForSlot]);

  // Equip garment handler
  const handleEquipGarment = (item: WardrobeItemDto) => {
    const renderItem = wardrobeMappingService.mapWardrobeItemTo3D(
      item,
      isFemale ? "FEMALE" : "MALE"
    );
    setGarmentForSlot(renderItem.slot, renderItem);
  };

  // Remove garment handler
  const handleRemoveGarment = (slot: GarmentSlot) => {
    setGarmentForSlot(slot, null);
  };

  // Camera viewpoint switcher
  const handleSetCameraView = (view: "front" | "side" | "back" | "reset") => {
    switch (view) {
      case "front":
        updateSettings({ cameraPosition: [0, 1.25, 3.2] });
        break;
      case "side":
        updateSettings({ cameraPosition: [3.2, 1.25, 0] });
        break;
      case "back":
        updateSettings({ cameraPosition: [0, 1.25, -3.2] });
        break;
      case "reset":
        resetCamera();
        break;
    }
  };

  // Save Equipped 3D Outfit to Database
  const handleSaveEquippedOutfit = async () => {
    const equipped = Object.values(activeGarments).filter(Boolean);
    if (equipped.length === 0) return;

    setSaveStatus("saving");
    setSaveError(null);
    try {
      const itemsPayload = equipped.map((g: any) => ({
        wardrobeItemId: g.wardrobeItemId || g.id,
        slot: g.slot,
        layerIndex: g.slot === "OUTER_TOP" ? 1 : 0,
      }));

      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outfitTitle,
          occasion: "CASUAL_OUTING",
          formality: "SMART_CASUAL",
          season: "ALL_SEASON",
          compatibilityScore: 0.95,
          items: itemsPayload,
        }),
      });

      if (res.ok) {
        setSaveStatus("saved");
        setSaveError(null);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveStatus("error");
        setSaveError(errorData.error || "Failed to save outfit ensemble.");
        setTimeout(() => {
          setSaveStatus("idle");
          setSaveError(null);
        }, 4000);
      }
    } catch (err: any) {
      console.error("Save outfit error:", err);
      setSaveStatus("error");
      setSaveError(err.message || "Failed to save outfit ensemble.");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveError(null);
      }, 4000);
    }
  };

  // Filter wardrobe pieces by tab
  const filteredWardrobe = wardrobeItems.filter((i) => {
    if (wardrobeCategory === "ALL") return true;
    if (wardrobeCategory === "TOPS") return i.category === "TOP";
    if (wardrobeCategory === "BOTTOMS") return i.category === "BOTTOM";
    if (wardrobeCategory === "OUTERWEAR") return i.category === "OUTERWEAR";
    if (wardrobeCategory === "FOOTWEAR") return i.category === "FOOTWEAR";
    if (wardrobeCategory === "ACCESSORIES") return ["ACCESSORY", "TIMEPIECE", "EYEWEAR"].includes(i.category);
    return true;
  });

  // Count equipped pieces
  const equippedCount = Object.values(activeGarments).filter(Boolean).length;

  return (
    <div className="relative h-[calc(100vh-4.5rem)] w-full overflow-hidden bg-[#121110] flex flex-col select-none">
      {/* Top Action & Viewpoint Bar */}
      <div className="h-14 px-6 border-b border-[#2a2624] bg-[#1a1716]/95 backdrop-blur-md flex items-center justify-between z-20">
        {/* Title & Dev Architecture Label */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-charcoal text-cream border border-[#3d3734] flex items-center justify-center">
            <Box className="h-4 w-4 text-beige-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-sm font-semibold text-cream tracking-tight">
                3D Virtual Studio
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PBR Garment Architecture
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-sans">
              Stylized 3D avatars & modular PBR material pipelines
            </p>
          </div>
        </div>

        {/* Center Viewport Controls (Front, Side, Back, Reset, Spin) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#24201e] border border-[#38322e]">
          <button
            onClick={() => handleSetCameraView("front")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-300 hover:text-white hover:bg-[#332e2a] transition-colors"
          >
            Front
          </button>
          <button
            onClick={() => handleSetCameraView("side")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-300 hover:text-white hover:bg-[#332e2a] transition-colors"
          >
            Profile
          </button>
          <button
            onClick={() => handleSetCameraView("back")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-300 hover:text-white hover:bg-[#332e2a] transition-colors"
          >
            Back
          </button>
          <span className="text-[#38322e]">•</span>
          <button
            onClick={() => handleSetCameraView("reset")}
            className="px-2 py-1 rounded-lg text-[11px] text-stone-400 hover:text-white hover:bg-[#332e2a] transition-colors"
            title="Reset camera distance"
          >
            Reset
          </button>
          <button
            onClick={() => updateSettings({ autoRotate: !settings.autoRotate })}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors",
              settings.autoRotate ? "bg-beige-400 text-charcoal font-bold" : "text-stone-400 hover:text-white"
            )}
            title="Toggle 360° auto-rotation"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        </div>

        {/* Right Actions: 2D/3D Mode, Save Outfit */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIs2DMode((p) => !p)}
            className="h-8 text-xs border-[#38322e] bg-[#24201e] text-stone-300 hover:text-white hover:bg-[#332e2a]"
          >
            {is2DMode ? "Switch to 3D" : "2D Fallback"}
          </Button>

          <Button
            size="sm"
            onClick={handleSaveEquippedOutfit}
            disabled={equippedCount === 0 || saveStatus === "saving"}
            className={cn(
              "h-8 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors",
              saveStatus === "error"
                ? "bg-rose-900/60 border border-rose-500/50 text-rose-200 hover:bg-rose-900/80"
                : "bg-beige-300 text-charcoal hover:bg-beige-200"
            )}
          >
            {saveStatus === "saving" ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : saveStatus === "saved" ? (
              <Check className="h-3.5 w-3.5 text-emerald-800" />
            ) : saveStatus === "error" ? (
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>
              {saveStatus === "saved"
                ? "Outfit Saved"
                : saveStatus === "error"
                ? "Save Failed"
                : "Save 3D Look"}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central 3D Canvas Viewport */}
        <div className="flex-1 h-full relative">
          {is2DMode ? (
            /* 2D Fallback Fashion Stage */
            <div className="h-full w-full bg-[#161413] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-xs">
                2D Fallback Composition
              </Badge>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
                {(Object.entries(activeGarments) as [GarmentSlot, any][])
                  .filter(([_, g]) => Boolean(g))
                  .map(([slotKey, garment]) => (
                    <div
                      key={slotKey}
                      className="p-3 rounded-xl border border-[#38322e] bg-[#221e1c] flex flex-col items-center space-y-2"
                    >
                      <div
                        className="h-16 w-16 rounded-xl flex items-center justify-center shadow-md border border-[#443c36]"
                        style={{ backgroundColor: garment.color }}
                      >
                        <Shirt className="h-7 w-7 text-white/90" />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-stone-400">
                        {slotKey}
                      </span>
                      <p className="text-xs font-medium text-cream truncate max-w-[100px]">
                        {garment.name || "Equipped Piece"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <StudioCanvas className="h-full w-full" />
          )}

          {/* Viewport Floating Info Pill */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181615]/80 backdrop-blur-md border border-[#38322e] text-[11px] text-stone-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WebGL 3D Studio Active</span>
            <span className="text-stone-600">•</span>
            <span>{isFemale ? "Female Mannequin" : "Male Mannequin"}</span>
            <span className="text-stone-600">•</span>
            <span>{equippedCount} pieces equipped</span>
          </div>
        </div>

        {/* Right Sidebar Control Panels (Layers, Wardrobe, Avatar, Environment) */}
        <div className="w-80 sm:w-96 h-full border-l border-[#2a2624] bg-[#181615]/95 backdrop-blur-xl flex flex-col z-20">
          {/* Panel Tab Navigation */}
          <div className="grid grid-cols-4 border-b border-[#2a2624] p-1 bg-[#121110]">
            <button
              onClick={() => setActiveSideTab("layers")}
              className={cn(
                "py-2 text-[11px] font-medium rounded-lg transition-colors flex flex-col items-center gap-1",
                activeSideTab === "layers"
                  ? "bg-[#282320] text-cream shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Layers ({equippedCount})</span>
            </button>

            <button
              onClick={() => setActiveSideTab("wardrobe")}
              className={cn(
                "py-2 text-[11px] font-medium rounded-lg transition-colors flex flex-col items-center gap-1",
                activeSideTab === "wardrobe"
                  ? "bg-[#282320] text-cream shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              <Shirt className="h-3.5 w-3.5" />
              <span>Wardrobe</span>
            </button>

            <button
              onClick={() => setActiveSideTab("avatar")}
              className={cn(
                "py-2 text-[11px] font-medium rounded-lg transition-colors flex flex-col items-center gap-1",
                activeSideTab === "avatar"
                  ? "bg-[#282320] text-cream shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Avatar</span>
            </button>

            <button
              onClick={() => setActiveSideTab("lighting")}
              className={cn(
                "py-2 text-[11px] font-medium rounded-lg transition-colors flex flex-col items-center gap-1",
                activeSideTab === "lighting"
                  ? "bg-[#282320] text-cream shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Studio</span>
            </button>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: OUTFIT LAYERS & EQUIPPED GARMENTS                      */}
            {/* ------------------------------------------------------------- */}
            {activeSideTab === "layers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                    Equipped Garment Skeletons
                  </span>
                  {equippedCount > 0 && (
                    <button
                      onClick={clearGarments}
                      className="text-[11px] text-stone-400 hover:text-red-400 transition-colors"
                    >
                      Undress All
                    </button>
                  )}
                </div>

                {saveError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{saveError}</span>
                  </div>
                )}

                {equippedCount > 0 ? (
                  <div className="space-y-2.5">
                    {(Object.entries(activeGarments) as [GarmentSlot, any][])
                      .filter(([_, g]) => Boolean(g))
                      .map(([slotKey, garment]) => (
                        <div
                          key={slotKey}
                          className="p-3 rounded-xl border border-[#38322e] bg-[#221e1c] flex items-center justify-between gap-3 shadow-subtle group hover:border-[#524942] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Color Swatch / Preview */}
                            <div
                              className="h-10 w-10 rounded-lg border border-[#443c36] flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: garment.color }}
                            >
                              <Shirt className="h-4 w-4 text-white/90" />
                            </div>

                            <div className="min-w-0">
                              <span className="text-[9px] font-mono uppercase text-beige-300 block">
                                {slotKey.replace("INNER_", "").replace("OUTER_", "")}
                              </span>
                              <p className="text-xs font-medium text-cream truncate">
                                {garment.name || `${slotKey.toLowerCase()} piece`}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                                <span>Rough: {garment.roughness}</span>
                                <span>•</span>
                                <span>Metal: {garment.metalness}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveGarment(slotKey)}
                            className="h-7 w-7 rounded-lg border border-[#38322e] flex items-center justify-center text-stone-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                            title="Remove garment"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <Shirt className="h-8 w-8 text-stone-600" />
                    <p className="text-xs font-medium text-stone-300">
                      Avatar is currently undressed
                    </p>
                    <p className="text-[11px] text-stone-500 max-w-xs">
                      Switch to the Wardrobe tab to dress your 3D avatar with pieces from your closet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: WARDROBE BROWSER & CLOTHING SELECTION                   */}
            {/* ------------------------------------------------------------- */}
            {activeSideTab === "wardrobe" && (
              <div className="space-y-4">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {["ALL", "TOPS", "BOTTOMS", "OUTERWEAR", "FOOTWEAR", "ACCESSORIES"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setWardrobeCategory(cat)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase transition-colors whitespace-nowrap",
                        wardrobeCategory === cat
                          ? "bg-beige-300 text-charcoal font-bold"
                          : "bg-[#221e1c] text-stone-400 hover:text-white border border-[#38322e]"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Wardrobe Items List */}
                {isLoadingWardrobe ? (
                  <div className="flex items-center justify-center py-12 text-stone-500">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-xs font-mono">Loading closet...</span>
                  </div>
                ) : filteredWardrobe.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredWardrobe.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleEquipGarment(item)}
                        className="p-2.5 rounded-xl border border-[#38322e] bg-[#221e1c] hover:border-beige-300/60 cursor-pointer transition-all flex flex-col justify-between group shadow-subtle select-none"
                      >
                        <div className="relative aspect-square w-full rounded-lg bg-[#141211] border border-[#2a2624] overflow-hidden flex items-center justify-center mb-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: item.colorPrimary }}
                            >
                              <Shirt className="h-4 w-4 text-white/90" />
                            </div>
                          )}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-beige-300 text-charcoal rounded p-0.5 shadow-sm">
                            <Plus className="h-3 w-3" />
                          </div>
                        </div>

                        <div>
                          {item.brand && (
                            <p className="text-[9px] font-mono uppercase text-stone-500 truncate">
                              {item.brand}
                            </p>
                          )}
                          <p className="text-xs font-medium text-cream truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                            <span className="capitalize">{item.subCategory}</span>
                            <div
                              className="h-2 w-2 rounded-full border border-stone-600"
                              style={{ backgroundColor: item.colorPrimary }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-stone-500">
                    No items in this category.
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: AVATAR CUSTOMIZATION & RIG CONTROLS                     */}
            {/* ------------------------------------------------------------- */}
            {activeSideTab === "avatar" && (
              <div className="space-y-5">
                {/* Avatar Rig (Male vs Female) */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                    Avatar Rig Skeleton
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        updateAvatarDimensions({ shoulderWidth: 1.0, waistWidth: 1.0 });
                        setCurrentProfile(
                          currentProfile ? { ...currentProfile, gender: "MALE" } : null
                        );
                      }}
                      className={cn(
                        "py-2.5 rounded-lg text-xs font-semibold border transition-all",
                        !isFemale
                          ? "bg-beige-300 text-charcoal border-beige-200 shadow-subtle"
                          : "border-[#38322e] bg-[#221e1c] text-stone-400 hover:text-white"
                      )}
                    >
                      Male Rig
                    </button>
                    <button
                      onClick={() => {
                        updateAvatarDimensions({ shoulderWidth: 0.88, waistWidth: 0.85 });
                        setCurrentProfile(
                          currentProfile ? { ...currentProfile, gender: "FEMALE" } : null
                        );
                      }}
                      className={cn(
                        "py-2.5 rounded-lg text-xs font-semibold border transition-all",
                        isFemale
                          ? "bg-beige-300 text-charcoal border-beige-200 shadow-subtle"
                          : "border-[#38322e] bg-[#221e1c] text-stone-400 hover:text-white"
                      )}
                    >
                      Female Rig
                    </button>
                  </div>
                </div>

                {/* Skin Tone Palette */}
                <div className="space-y-2 pt-2 border-t border-[#2a2624]">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                    Melanin & Skin Tone Presets
                  </span>
                  <div className="flex items-center gap-2">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.hex}
                        onClick={() => updateAvatarDimensions({ skinColor: tone.hex })}
                        title={tone.label}
                        className={cn(
                          "h-8 w-8 rounded-full border border-stone-600 shadow-subtle flex items-center justify-center transition-transform hover:scale-110",
                          currentProfile?.skinColor === tone.hex ? "ring-2 ring-white ring-offset-2 ring-offset-[#181615]" : ""
                        )}
                        style={{ backgroundColor: tone.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Color Palette */}
                <div className="space-y-2 pt-2 border-t border-[#2a2624]">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                    Hair Color Presets
                  </span>
                  <div className="flex items-center gap-2">
                    {HAIR_COLORS.map((hair) => (
                      <button
                        key={hair.hex}
                        onClick={() =>
                          setCurrentProfile(
                            currentProfile ? { ...currentProfile, hairColor: hair.hex } : null
                          )
                        }
                        title={hair.label}
                        className={cn(
                          "h-8 w-8 rounded-full border border-stone-600 shadow-subtle flex items-center justify-center transition-transform hover:scale-110",
                          currentProfile?.hairColor === hair.hex ? "ring-2 ring-white ring-offset-2 ring-offset-[#181615]" : ""
                        )}
                        style={{ backgroundColor: hair.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Proportion Adjustments */}
                <div className="space-y-3 pt-2 border-t border-[#2a2624]">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                    Anatomical Proportions
                  </span>

                  <div>
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Height Scale</span>
                      <span className="font-mono">{currentProfile?.heightScale || 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.9"
                      max="1.1"
                      step="0.02"
                      value={currentProfile?.heightScale || 1.0}
                      onChange={(e) =>
                        updateAvatarDimensions({ heightScale: parseFloat(e.target.value) })
                      }
                      className="w-full accent-beige-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Shoulder Width</span>
                      <span className="font-mono">{currentProfile?.shoulderWidth || 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.2"
                      step="0.02"
                      value={currentProfile?.shoulderWidth || 1.0}
                      onChange={(e) =>
                        updateAvatarDimensions({ shoulderWidth: parseFloat(e.target.value) })
                      }
                      className="w-full accent-beige-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Wireframe Toggle */}
                <div className="pt-2 border-t border-[#2a2624]">
                  <button
                    onClick={toggleWireframe}
                    className="text-xs text-stone-400 hover:text-white flex items-center gap-2"
                  >
                    <Box className="h-3.5 w-3.5" />
                    <span>{showWireframe ? "Disable 3D Wireframe" : "Enable 3D Wireframe"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: STUDIO LIGHTING & STAGE ENVIRONMENT                    */}
            {/* ------------------------------------------------------------- */}
            {activeSideTab === "lighting" && (
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                  Editorial Three-Point Lighting
                </span>

                <div>
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>Key & Rim Light Intensity</span>
                    <span className="font-mono">{settings.lightingIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={settings.lightingIntensity}
                    onChange={(e) =>
                      updateSettings({ lightingIntensity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-beige-300 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-[#2a2624]">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showGrid}
                      onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                      className="rounded border-[#38322e] accent-beige-300"
                    />
                    <span>Show Studio Stage Grid</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
