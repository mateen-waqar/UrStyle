export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export class ColorCompatibilityService {
  private readonly neutralHues = new Set([
    "#ffffff", "#000000", "#181716", "#292624", "#4a4642", "#808080",
    "#f5f2eb", "#d4c5b0", "#b08968", "#1e2a38", "#332219", "#e5e5e5"
  ]);

  /**
   * Convert hex color to HSL
   */
  hexToHsl(hex: string): HSL {
    let cleanHex = hex.replace("#", "").trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    if (cleanHex.length !== 6) {
      return { h: 0, s: 0, l: 50 };
    }

    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Check if color is considered a versatile neutral
   */
  isNeutral(hex: string): boolean {
    const clean = hex.toLowerCase().trim();
    if (this.neutralHues.has(clean)) return true;
    const hsl = this.hexToHsl(clean);
    // Low saturation (< 18%) or very high/low lightness is neutral
    return hsl.s < 18 || hsl.l < 12 || hsl.l > 92;
  }

  /**
   * Evaluates color compatibility among clothing items
   * Range: 0.0 to 1.0
   */
  evaluateColors(colorHexes: string[], preferredColor?: string): number {
    if (colorHexes.length <= 1) return 1.0;

    const hslList = colorHexes.map((hex) => this.hexToHsl(hex));
    const nonNeutrals = colorHexes.filter((hex) => !this.isNeutral(hex));

    let score = 0.85;

    // 1. All neutrals (Minimalist / Quiet Luxury perfection)
    if (nonNeutrals.length === 0) {
      score = 0.96;
    }
    // 2. Neutral base with exactly 1 accent color (Hero piece)
    else if (nonNeutrals.length === 1) {
      score = 0.94;
    }
    // 3. Exactly 2 non-neutral colors
    else if (nonNeutrals.length === 2) {
      const c1 = this.hexToHsl(nonNeutrals[0]);
      const c2 = this.hexToHsl(nonNeutrals[1]);
      const hueDiff = Math.abs(c1.h - c2.h);
      const angle = Math.min(hueDiff, 360 - hueDiff);

      // Monochromatic: same hue family (angle < 25)
      if (angle < 25) {
        score = 0.95;
      }
      // Analogous: neighboring colors (angle 25-50) e.g. blue & olive
      else if (angle >= 25 && angle <= 60) {
        score = 0.90;
      }
      // Complementary: opposite colors (angle 150-210) e.g. navy & terracotta
      else if (angle >= 150 && angle <= 210) {
        score = 0.88;
      } else {
        score = 0.72;
      }
    }
    // 4. More than 2 non-neutral accent colors (risks visual chaos)
    else if (nonNeutrals.length >= 3) {
      const uniqueHues = new Set(nonNeutrals.map((c) => Math.round(this.hexToHsl(c).h / 30)));
      if (uniqueHues.size >= 4) {
        score = 0.40; // Heavy penalty for clashing kaleidoscope
      } else {
        score = 0.65;
      }
    }

    // Optional user color preference bonus
    if (preferredColor && preferredColor.trim()) {
      const prefClean = preferredColor.toLowerCase().trim();
      const hasMatch = colorHexes.some((hex) => {
        const hexClean = hex.toLowerCase().trim();
        if (hexClean === prefClean) return true;
        const diff = Math.abs(this.hexToHsl(hexClean).h - this.hexToHsl(prefClean).h);
        return Math.min(diff, 360 - diff) < 25;
      });
      if (hasMatch) {
        score = Math.min(1.0, score + 0.06);
      }
    }

    return Number(score.toFixed(2));
  }
}

export const colorCompatibilityService = new ColorCompatibilityService();
