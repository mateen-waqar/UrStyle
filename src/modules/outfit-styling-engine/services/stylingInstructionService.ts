import type { WardrobeItemDto } from "@/types";

export interface CompleteStylingAdvice {
  shirtTuck: string;
  sleeveStyling: string;
  footwearPairing: string;
  beltRecommendation: string;
  accessoryRecommendations: string[];
  layeringSuggestions?: string;
  summary: string;
}

export class StylingInstructionService {
  /**
   * Deterministically generates comprehensive editorial styling advice
   * for an outfit combination.
   */
  generateDetailedStyling(
    items: WardrobeItemDto[],
    formality: string = "SMART_CASUAL",
    occasion: string = "CASUAL_OUTING"
  ): CompleteStylingAdvice {
    const top = items.find((i) => i.category === "TOP");
    const bottom = items.find((i) => i.category === "BOTTOM");
    const footwear = items.find((i) => i.category === "FOOTWEAR");
    const outerwear = items.find((i) => i.category === "OUTERWEAR");
    const accessories = items.filter((i) =>
      ["ACCESSORY", "TIMEPIECE", "EYEWEAR", "BAG", "JEWELRY"].includes(i.category)
    );

    // 1. Shirt Tuck Advice
    let shirtTuck = "Leave untucked for a relaxed, natural drape.";
    if (top && bottom) {
      const topSub = top.subCategory.toLowerCase();
      const bottomSub = bottom.subCategory.toLowerCase();
      const isFormalOrTailored =
        formality === "BUSINESS_FORMAL" ||
        formality === "BUSINESS_CASUAL" ||
        bottomSub.includes("trousers") ||
        bottomSub.includes("chinos");

      if (topSub.includes("shirts") || topSub.includes("polo")) {
        if (isFormalOrTailored) {
          shirtTuck = "Full clean tuck into waistband to emphasize tailored trouser silhouette.";
        } else {
          shirtTuck = "Opt for an effortless French tuck (front tuck only) to define the waistline while keeping casual drape.";
        }
      } else if (topSub.includes("hoodie") || topSub.includes("sweater")) {
        shirtTuck = "Leave untucked; allow hem to naturally sit right at mid-hip.";
      } else if (topSub.includes("t-shirt") && (bottomSub.includes("trousers") || bottomSub.includes("chinos"))) {
        shirtTuck = "Subtle half-tuck into trouser waist to elevate the relaxed tee.";
      }
    }

    // 2. Sleeve Styling Advice
    let sleeveStyling = "Keep cuffs neatly fastened at the wrist.";
    if (top) {
      const topSub = top.subCategory.toLowerCase();
      if (topSub.includes("shirt") && formality !== "BLACK_TIE" && formality !== "BUSINESS_FORMAL") {
        sleeveStyling = "Roll sleeves up two folds just below the elbow for a relaxed, confident stance.";
      } else if (topSub.includes("sweater") || topSub.includes("hoodie")) {
        sleeveStyling = "Push sleeves slightly up the forearms to expose wrist and create relaxed fabric bunching.";
      }
    }

    // 3. Footwear Pairing Advice
    let footwearPairing = "Pair with clean, neutral socks matching trouser tone.";
    if (footwear) {
      const shoeSub = footwear.subCategory.toLowerCase();
      if (shoeSub.includes("loafer") || shoeSub.includes("boat")) {
        footwearPairing = "Wear invisible no-show socks to reveal a tasteful ankle break above the loafers.";
      } else if (shoeSub.includes("sneaker")) {
        footwearPairing = "Opt for clean white low-profile socks or minimalist no-show socks.";
      } else if (shoeSub.includes("boot")) {
        footwearPairing = "Wear medium-weight ribbed wool or cotton crew socks extending above the boot collar.";
      } else if (shoeSub.includes("formal") || shoeSub.includes("oxford") || shoeSub.includes("derby")) {
        footwearPairing = "Wear dark dress socks matching trouser hem tone to elongate the leg silhouette.";
      }
    }

    // 4. Belt Recommendation
    let beltRecommendation = "No belt required if trousers fit flush at the natural waistline.";
    const hasBeltAccessory = accessories.some((a) => a.subCategory.toLowerCase().includes("belt"));
    if (hasBeltAccessory) {
      beltRecommendation = "Wear selected belt; match leather grain and finish to footwear.";
    } else if (footwear && footwear.colorPrimary) {
      beltRecommendation = "If wearing a belt, match the leather tone and finish precisely to your shoes.";
    }

    // 5. Accessory Recommendations
    const accessoryRecommendations: string[] = [];
    const hasWatch = accessories.some((a) => a.category === "TIMEPIECE" || a.subCategory.toLowerCase().includes("watch"));
    const hasEyewear = accessories.some((a) => a.category === "EYEWEAR" || a.subCategory.toLowerCase().includes("sunglasses") || a.subCategory.toLowerCase().includes("glasses"));
    const hasBag = accessories.some((a) => a.category === "BAG" || a.subCategory.toLowerCase().includes("bag"));

    if (hasWatch) {
      accessoryRecommendations.push("Expose timepiece past sleeve cuff by 1cm.");
    } else {
      accessoryRecommendations.push("Complement with a slim minimalist watch or subtle silver cuff bracelet.");
    }

    if (hasEyewear) {
      accessoryRecommendations.push("Wear sunglasses outdoors or hook neatly onto shirt placket when indoors.");
    } else if (occasion === "CASUAL_OUTING" || occasion === "TRAVEL" || occasion === "DATE") {
      accessoryRecommendations.push("Add classic tortoiseshell or black acetate sunglasses for effortless flair.");
    }

    if (!hasBag && (occasion === "WORK" || occasion === "TRAVEL" || occasion === "UNIVERSITY")) {
      accessoryRecommendations.push("Pair with a structured leather briefcase or minimal canvas tote.");
    }

    // 6. Layering Suggestions
    let layeringSuggestions: string | undefined;
    if (outerwear) {
      const outSub = outerwear.subCategory.toLowerCase();
      if (outSub.includes("blazer")) {
        layeringSuggestions = "Keep blazer unbuttoned for movement, or fasten only the top button when standing.";
      } else if (outSub.includes("coat") || outSub.includes("jacket")) {
        layeringSuggestions = "Leave jacket open to display the harmonic contrast between top and trousers.";
      }
    } else if (formality === "CASUAL" || formality === "SMART_CASUAL") {
      layeringSuggestions = "On cooler evenings, drape a lightweight merino knit over the shoulders for an old-money editorial touch.";
    }

    const summary = `${shirtTuck} ${sleeveStyling} ${footwearPairing}`;

    return {
      shirtTuck,
      sleeveStyling,
      footwearPairing,
      beltRecommendation,
      accessoryRecommendations,
      layeringSuggestions,
      summary,
    };
  }
}

export const stylingInstructionService = new StylingInstructionService();
