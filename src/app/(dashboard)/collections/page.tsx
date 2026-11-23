"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, Palette, Lock, Globe, ArrowRight, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionDto {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  coverImageUrl?: string | null;
  savedOutfits: Array<{
    id: string;
    outfit: {
      id: string;
      title: string;
      items: Array<{
        wardrobeItem: {
          colorPrimary: string;
        };
      }>;
    };
  }>;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch collections from DB
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (err) {
      console.error("Fetch collections error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Handle Create Collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          isPrivate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create collection");
      }

      setName("");
      setDescription("");
      setIsPrivate(true);
      setIsModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Collection
  const handleDeleteCollection = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete collection error:", err);
      fetchCollections();
    }
  };

  return (
    <div className="space-y-8">
      <Header
        eyebrow="Thematic Lookbooks • Capsules & Editorial Boards"
        title="Collections"
        description="Thematic lookbooks, seasonal capsules, and aesthetic boards for travels, galas, and appointments."
        actions={
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMessage(null);
            }}
            className="gap-2 text-xs bg-charcoal text-cream hover:bg-charcoal/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Collection</span>
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-charcoal/60" />
          <p className="text-xs font-mono text-muted-foreground">Loading collections...</p>
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collections.map((coll) => {
            // Extract distinct colors from outfits in this collection
            const colors: string[] = [];
            coll.savedOutfits.forEach((so) => {
              so.outfit.items.forEach((it) => {
                const c = it.wardrobeItem.colorPrimary;
                if (c && !colors.includes(c) && colors.length < 5) {
                  colors.push(c);
                }
              });
            });

            return (
              <div
                key={coll.id}
                className="group rounded-xl border border-border/80 bg-card overflow-hidden shadow-subtle hover:border-charcoal/40 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Cover Stage */}
                <div className="aspect-[16/10] bg-atelier-100/70 p-5 flex flex-col justify-between border-b border-border/60 relative">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-[9px] shadow-subtle font-mono">
                      {coll.savedOutfits.length} {coll.savedOutfits.length === 1 ? "Ensemble" : "Ensembles"}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-card/90 backdrop-blur-sm border border-border/80 text-muted-foreground shadow-subtle">
                        {coll.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      </div>
                      <button
                        onClick={(e) => handleDeleteCollection(e, coll.id)}
                        className="p-1 rounded-md bg-card/90 backdrop-blur-sm border border-border/80 text-muted-foreground hover:text-red-600 transition-colors shadow-subtle"
                        title="Delete collection"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Color Swatch Dots */}
                  <div className="flex items-center gap-1.5 self-start p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 shadow-subtle">
                    {colors.length > 0 ? (
                      colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="h-3 w-3 rounded-full border border-border/80 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                      ))
                    ) : (
                      <span className="text-[9px] font-mono text-muted-foreground px-1">
                        Atelier Board
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-medium text-foreground tracking-tight group-hover:text-charcoal transition-colors">
                      {coll.name}
                    </h4>
                    {coll.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {coll.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Curated Board</span>
                    <Link
                      href="/saved-outfits"
                      className="inline-flex items-center gap-1 text-charcoal font-medium group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No collections created yet"
          description="Group your saved outfits into seasonal capsules, travel lookbooks, or thematic aesthetics."
          icon={Palette}
          actionLabel="Create Your First Collection"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-charcoal" />
                <h3 className="font-serif text-base font-semibold text-foreground">
                  New Thematic Collection
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateCollection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Collection Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paris Fashion Week, Autumn Capsule, Black Tie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Description
                </label>
                <textarea
                  placeholder="Understated neutral palettes, heavy wools, and structured coats."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Privacy
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                      isPrivate
                        ? "border-charcoal bg-charcoal text-cream font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Private Atelier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                      !isPrivate
                        ? "border-charcoal bg-charcoal text-cream font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                    )}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Public Board</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !name.trim()}
                  className="bg-charcoal text-cream hover:bg-charcoal/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Collection</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
