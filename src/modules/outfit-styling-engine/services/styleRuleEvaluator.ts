import type { WardrobeItemDto } from "@/types";

export interface StylingRecommendation {
  id: string;
  category: "TUCK" | "SLEEVE" | "FIT_BALANCE" | "FOOTWEAR" | "BELT" | "JACKET" | "ACCESSORY" | "LAYERING";
  title: string;
  action: string;
  explanation: string;
  stylingReason: string;
  confidence: number;
}

export interface StylingAnalysisResult {
  recommendations: StylingRecommendation[];
  overallSummary: string;
  silhouetteBalance: "BALANCED" | "TOP_HEAVY" | "BOTTOM_HEAVY" | "SLIM_MINIMAL" | "RELAXED_OVERSIZED";
  keyTakeaways: string[];
}

export class StyleRuleEvaluator {
  /**
   * Reusable rule-based styling evaluator
   * Evaluates garments strictly by category, fit, formality, style, pattern, and occasion.
   */
  evaluateOutfit(
    items: WardrobeItemDto[],
    occasion: string = "CASUAL_OUTING",
    formality: string = "SMART_CASUAL"
  ): StylingAnalysisResult {
    const recommendations: StylingRecommendation[] = [];

    const top = items.find((i) => i.category === "TOP");
    const bottom = items.find((i) => i.category === "BOTTOM");
    const footwear = items.find((i) => i.category === "FOOTWEAR");
    const outerwear = items.find((i) => i.category === "OUTERWEAR");
    const accessories = items.filter((i) =>
      ["ACCESSORY", "TIMEPIECE", "EYEWEAR", "BAG", "JEWELRY"].includes(i.category)
    );

    const occUpper = occasion.toUpperCase();
    const formUpper = formality.toUpperCase();

    // -------------------------------------------------------------------------
    // RULE 1: SHIRT TUCK HEURISTIC
    // -------------------------------------------------------------------------
    if (top && bottom) {
      const topSub = top.subCategory.toLowerCase();
      const bottomSub = bottom.subCategory.toLowerCase();
      const topFit = (top.fit || "REGULAR").toUpperCase();
      const isTailoredBottom = bottomSub.includes("trousers") || bottomSub.includes("chinos");
      const isLoungeBottom = bottomSub.includes("joggers") || bottomSub.includes("sweatpants");

      if (topSub.includes("shirt") || topSub.includes("polo")) {
        if (formUpper === "BUSINESS_FORMAL" || formUpper === "BLACK_TIE" || (formUpper === "BUSINESS_CASUAL" && isTailoredBottom)) {
          recommendations.push({
            id: "tuck-formal-full",
            category: "TUCK",
            title: "Full Sartorial Tuck",
            action: "Tuck in the shirt completely around the waistband.",
            explanation: "A clean, full tuck aligns the shirt placket with the trouser fly.",
            stylingReason: "Creates an unbroken vertical leg line and honors classical tailoring proportions for professional and formal environments.",
            confidence: 0.98,
          });
        } else if (isTailoredBottom || formUpper === "SMART_CASUAL" || occUpper === "DATE") {
          recommendations.push({
            id: "tuck-smart-french",
            category: "TUCK",
            title: "The French Front Tuck",
            action: "Execute a relaxed French tuck by tucking only the front hem just behind the belt buckle.",
            explanation: "Tucking only the front while leaving the sides and back draping freely creates effortless structure.",
            stylingReason: "Highlights the trouser waist and lengthens legs without making the ensemble feel stiff or overly corporate.",
            confidence: 0.92,
          });
        } else {
          recommendations.push({
            id: "tuck-casual-untuck",
            category: "TUCK",
            title: "Casual Untucked Drape",
            action: "Leave the shirt untucked with the hem resting comfortably at mid-fly.",
            explanation: "Casual shirts with curved or straight modern hems are designed to drape naturally.",
            stylingReason: "Maintains a breezy, approachable silhouette for relaxed weekend and social settings.",
            confidence: 0.88,
          });
        }
      } else if (topSub.includes("t-shirt")) {
        if (isTailoredBottom) {
          recommendations.push({
            id: "tuck-tee-trousers",
            category: "TUCK",
            title: "Structured High-Low Tuck",
            action: "Tuck the t-shirt cleanly into the trousers.",
            explanation: "Tucking a solid t-shirt into tailored trousers bridges casual knitwear with sartorial tailoring.",
            stylingReason: "Defines the waist and delivers the sought-after modern minimalist / quiet luxury editorial aesthetic.",
            confidence: 0.90,
          });
        } else if (topFit === "OVERSIZED") {
          recommendations.push({
            id: "tuck-oversized-half",
            category: "TUCK",
            title: "Volume Anchoring Half-Tuck",
            action: "Gently tuck the front left corner of the oversized t-shirt into the waistband.",
            explanation: "Oversized t-shirts can drown the torso if left completely boxy.",
            stylingReason: "Introduces an asymmetric diagonal fold that breaks up blocky fabric volume and anchors the waist.",
            confidence: 0.85,
          });
        } else {
          recommendations.push({
            id: "tuck-tee-natural",
            category: "TUCK",
            title: "Natural Torso Drape",
            action: "Wear the t-shirt untucked.",
            explanation: "Standard fit tees over denim or casual bottoms look best with clean hem alignment.",
            stylingReason: "Preserves natural garment proportions and ease of movement.",
            confidence: 0.82,
          });
        }
      } else if (topSub.includes("hoodie") || topSub.includes("sweater")) {
        recommendations.push({
          id: "tuck-knit-drape",
          category: "TUCK",
          title: "Hem Band Placement",
          action: "Do not tuck; fold the ribbed hem band inward against the waistline.",
          explanation: "Heavy knitwear or fleece fabrics create unsightly bulk and bulge if forced into a waistband.",
          stylingReason: "Inward folding creates a clean cropped effect without compromising the knit's natural weave.",
          confidence: 0.95,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 2: SLEEVE STYLING HEURISTIC
    // -------------------------------------------------------------------------
    if (top) {
      const topSub = top.subCategory.toLowerCase();
      if (topSub.includes("shirt")) {
        if (formUpper === "BUSINESS_FORMAL" || formUpper === "BLACK_TIE" || outerwear) {
          recommendations.push({
            id: "sleeve-formal-down",
            category: "SLEEVE",
            title: "Tailored Cuff Stance",
            action: "Keep shirt sleeves buttoned at the wrist with 1 to 1.5 cm extending past the jacket cuff.",
            explanation: "The white or colored cuff should frame the hand and jacket sleeve edge cleanly.",
            stylingReason: "Standard classical menswear rule establishing crisp contrast between sleeve fabric and wrist.",
            confidence: 0.96,
          });
        } else {
          recommendations.push({
            id: "sleeve-roll-smart",
            category: "SLEEVE",
            title: "The Master Sleeve Roll",
            action: "Unbutton cuffs and roll the sleeves up two neat folds to rest just below the elbow.",
            explanation: "Rolling sleeves exposes the forearm and wrist.",
            stylingReason: "Signals active confidence, highlights wrist accessories, and prevents the shirt from appearing rigid in casual or creative settings.",
            confidence: 0.91,
          });
        }
      } else if (topSub.includes("sweater") || topSub.includes("hoodie")) {
        recommendations.push({
          id: "sleeve-knit-push",
          category: "SLEEVE",
          title: "Forearm Bunching",
          action: "Push the knit sleeves gently up to mid-forearm.",
          explanation: "Allowing the ribbed cuffs to grip the forearm creates soft fabric stacking.",
          stylingReason: "Adds textural dimension to the arms while spotlighting wristwear.",
          confidence: 0.86,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 3: OVERSIZED CLOTHING & FIT PROPORTIONS
    // -------------------------------------------------------------------------
    let silhouetteBalance: StylingAnalysisResult["silhouetteBalance"] = "BALANCED";
    if (top && bottom) {
      const topFit = (top.fit || "REGULAR").toUpperCase();
      const bottomFit = (bottom.fit || "REGULAR").toUpperCase();

      if (topFit === "OVERSIZED" && (bottomFit === "OVERSIZED" || bottomFit === "RELAXED")) {
        silhouetteBalance = "RELAXED_OVERSIZED";
        recommendations.push({
          id: "fit-double-oversized",
          category: "FIT_BALANCE",
          title: "Volume Balancing Rule",
          action: "Anchor the oversized top with footwear structure, or consider swapping to straight-leg bottoms.",
          explanation: "Wearing oversized garments simultaneously on top and bottom risks losing body proportions entirely.",
          stylingReason: "Balancing loose silhouettes with defined grounding points (such as chunky soles or a visible wrist/neckline) restores intentional editorial structure.",
          confidence: 0.94,
        });
      } else if (topFit === "OVERSIZED" && (bottomFit === "SLIM" || bottomFit === "REGULAR")) {
        silhouetteBalance = "TOP_HEAVY";
        recommendations.push({
          id: "fit-top-oversized",
          category: "FIT_BALANCE",
          title: "Inverted Triangle Silhouette",
          action: "Keep the lower half streamlined with minimalist low-profile footwear.",
          explanation: "An oversized top paired with slim or regular bottoms creates a classic architectural streetwear contrast.",
          stylingReason: "Draws focal attention to the relaxed upper drape while keeping legs sleek and proportionate.",
          confidence: 0.89,
        });
      } else if (topFit === "SLIM" && (bottomFit === "OVERSIZED" || bottomFit === "RELAXED")) {
        silhouetteBalance = "BOTTOM_HEAVY";
        recommendations.push({
          id: "fit-bottom-relaxed",
          category: "FIT_BALANCE",
          title: "Wide-Leg Flow Proportions",
          action: "Keep the top tucked flush into the waistband to accentuate high-waisted wide trousers.",
          explanation: "A fitted top paired with relaxed trousers creates runway-inspired vertical drape.",
          stylingReason: "Maximizes leg length and prevents the smaller top from appearing accidental against wide pants.",
          confidence: 0.90,
        });
      } else if (topFit === "SLIM" && bottomFit === "SLIM") {
        silhouetteBalance = "SLIM_MINIMAL";
        recommendations.push({
          id: "fit-double-slim",
          category: "FIT_BALANCE",
          title: "Third-Piece Dimensionality",
          action: "Layer an unbuttoned boxy jacket or overshirt over the slim base.",
          explanation: "A head-to-toe slim fit can appear dated or flat without textural relief.",
          stylingReason: "Introduces kinetic depth and visual weight around the shoulders.",
          confidence: 0.87,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 4: FOOTWEAR PAIRING HEURISTIC
    // -------------------------------------------------------------------------
    if (footwear && bottom) {
      const shoeSub = footwear.subCategory.toLowerCase();
      const bottomSub = bottom.subCategory.toLowerCase();

      if (shoeSub.includes("loafer")) {
        recommendations.push({
          id: "footwear-loafers",
          category: "FOOTWEAR",
          title: "Loafer Ankle Break",
          action: "Wear invisible no-show socks and ensure trousers break cleanly with little to no hem stacking.",
          explanation: "Loafers call for a clean silhouette where the ankle bone or crisp sock line is visible.",
          stylingReason: "Highlights the shoe's sleek vamp and avoids messy trouser pooling over low-profile footwear.",
          confidence: 0.95,
        });
      } else if (shoeSub.includes("sneaker")) {
        if (bottomSub.includes("trousers") || bottomSub.includes("chinos")) {
          recommendations.push({
            id: "footwear-sneakers-tailoring",
            category: "FOOTWEAR",
            title: "Minimalist Sneaker Tension",
            action: "Ensure sneakers are pristine with clean white or monochromatic leather finish.",
            explanation: "Pairing sneakers with tailored trousers is an intentional high-low juxtaposition.",
            stylingReason: "Scuffed or athletic-mesh gym sneakers undermine tailored trousers; clean leather sneakers elevate them effortlessly.",
            confidence: 0.93,
          });
        } else if (bottomSub.includes("jeans")) {
          recommendations.push({
            id: "footwear-sneakers-denim",
            category: "FOOTWEAR",
            title: "Denim Hem Stacking",
            action: "Give raw denim a single 1.5-inch cuff fold to hover just above the sneaker collar.",
            explanation: "Cuffing raw selvedge denim displays the inner chainstitch and selvedge ID tape.",
            stylingReason: "Creates clean separation between heavy indigo denim and the sneaker silhouette.",
            confidence: 0.89,
          });
        }
      } else if (shoeSub.includes("boot")) {
        recommendations.push({
          id: "footwear-boots",
          category: "FOOTWEAR",
          title: "Boot Shaft Integration",
          action: "Allow trouser legs to drape cleanly over the boot shaft without tucking pants into the boots.",
          explanation: "Trousers should flow naturally over the leather or suede ankle shaft.",
          stylingReason: "Elongates the vertical line from thigh to ground.",
          confidence: 0.92,
        });
      } else if (shoeSub.includes("formal") || shoeSub.includes("oxford")) {
        recommendations.push({
          id: "footwear-dress-socks",
          category: "FOOTWEAR",
          title: "Dress Sock Tonal Sync",
          action: "Wear calf-height dark dress socks that match or slightly deepen the trouser hem color.",
          explanation: "Bare ankles with formal lace-up Oxford shoes clash with traditional dress codes.",
          stylingReason: "Maintains an uninterrupted leg line when seated and preserves formal etiquette.",
          confidence: 0.97,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 5: BELT NECESSITY HEURISTIC
    // -------------------------------------------------------------------------
    if (bottom) {
      const bottomSub = bottom.subCategory.toLowerCase();
      const hasBelt = accessories.some((a) => a.subCategory.toLowerCase().includes("belt"));
      const isLoungeOrAthletic = bottomSub.includes("joggers") || bottomSub.includes("shorts");

      if (isLoungeOrAthletic) {
        recommendations.push({
          id: "belt-no-lounge",
          category: "BELT",
          title: "Beltless Elastic Ease",
          action: "Do not wear a belt; tie drawstrings neatly or tuck them inside the waistband.",
          explanation: "Casual elastic-waist bottoms do not support belts.",
          stylingReason: "Avoids hardware clashing and awkward waistline distortion.",
          confidence: 0.99,
        });
      } else if (formUpper === "BUSINESS_FORMAL" || formUpper === "BUSINESS_CASUAL") {
        if (!hasBelt) {
          recommendations.push({
            id: "belt-formal-match",
            category: "BELT",
            title: "Leather Tone Harmonization",
            action: "Add a slim leather belt matching the exact color and finish of your shoes.",
            explanation: "In business formal settings, footwear and belt leathers must coordinate.",
            stylingReason: "Creates polished sartorial coherence and bridges upper and lower tailoring.",
            confidence: 0.94,
          });
        } else {
          recommendations.push({
            id: "belt-leather-sync",
            category: "BELT",
            title: "Hardware & Leather Check",
            action: "Ensure your belt buckle metal (silver/brass) matches your watch case and jewelry.",
            explanation: "Hardware synchronization is a hallmark of sophisticated personal styling.",
            stylingReason: "Elevates visual harmony by eliminating competing metal tones.",
            confidence: 0.91,
          });
        }
      } else {
        recommendations.push({
          id: "belt-clean-waist",
          category: "BELT",
          title: "Clean Minimalist Waist",
          action: "If trousers fit comfortably, skip the belt for a clean, uninterrupted silhouette.",
          explanation: "Modern European tailoring frequently foregoes belts in favor of side adjusters or flush fit.",
          stylingReason: "Reduces waist clutter and maintains a continuous vertical line.",
          confidence: 0.85,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 6: JACKET & THIRD-PIECE LAYERING HEURISTIC
    // -------------------------------------------------------------------------
    if (!outerwear) {
      if (formUpper === "SMART_CASUAL" || occUpper === "OFFICE" || occUpper === "DATE") {
        recommendations.push({
          id: "jacket-add-third-piece",
          category: "JACKET",
          title: "Add a Tailored Third Piece",
          action: "Consider layering an unlined wool blazer, chore jacket, or unstructured overshirt.",
          explanation: "Outfits composed only of a shirt and pants can feel unfinished in evening or workplace settings.",
          stylingReason: "The 'Rule of Thirds' introduces architectural shoulders, framing the torso and elevating formality.",
          confidence: 0.92,
        });
      }
    } else {
      const outSub = outerwear.subCategory.toLowerCase();
      if (outSub.includes("blazer")) {
        recommendations.push({
          id: "jacket-blazer-etiquette",
          category: "JACKET",
          title: "The Single Button Drape",
          action: "Leave the blazer unbuttoned for relaxed movement, or fasten only the top button when standing.",
          explanation: "Never button the bottom button of a two-button blazer or suit jacket.",
          stylingReason: "Modern blazers are tailored with flare below the waist; fastening the bottom button pulls the fabric and breaks the drape line.",
          confidence: 0.98,
        });
      } else if (outSub.includes("coat")) {
        recommendations.push({
          id: "jacket-coat-stride",
          category: "JACKET",
          title: "Kinetic Coat Flow",
          action: "Leave the overcoat unbuttoned while walking.",
          explanation: "An open overcoat catches the air and creates dynamic fabric motion.",
          stylingReason: "Displays the coordinated inner layering while communicating effortless presence.",
          confidence: 0.88,
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 7: ACCESSORY & TIMEPIECE ACCENTS
    // -------------------------------------------------------------------------
    const hasWatch = accessories.some((a) => a.category === "TIMEPIECE" || a.subCategory.toLowerCase().includes("watch"));
    const hasEyewear = accessories.some((a) => a.category === "EYEWEAR" || a.subCategory.toLowerCase().includes("glasses"));

    if (hasWatch) {
      recommendations.push({
        id: "acc-timepiece-expose",
        category: "ACCESSORY",
        title: "Timepiece Presence",
        action: "Ensure your watch case peeks past the sleeve by 1 centimeter.",
        explanation: "A timepiece should be visible without pulling the entire sleeve up.",
        stylingReason: "Subtly accents wrist anatomy and anchors personal luxury.",
        confidence: 0.93,
      });
    } else {
      recommendations.push({
        id: "acc-add-watch",
        category: "ACCESSORY",
        title: "Wrist Grounding",
        action: "Accessorize with a slim minimalist watch or subtle silver cuff bracelet.",
        explanation: "Bare wrists can leave smart casual looks feeling slightly ungrounded.",
        stylingReason: "Adds functional polish and completes the silhouette's extremity detailing.",
        confidence: 0.87,
      });
    }

    if (hasEyewear) {
      recommendations.push({
        id: "acc-eyewear-carry",
        category: "ACCESSORY",
        title: "Eyewear Staging",
        action: "When indoors, hook sunglasses neatly into the shirt placket or store in an interior pocket.",
        explanation: "Resting sunglasses on top of the head can stretch frames and disrupt groomed hair.",
        stylingReason: "Preserves clean head proportions while keeping the glasses accessible.",
        confidence: 0.89,
      });
    }

    // -------------------------------------------------------------------------
    // RULE 8: LAYERING & TEXTURE DEPTH
    // -------------------------------------------------------------------------
    if (outerwear && top) {
      recommendations.push({
        id: "layering-texture-contrast",
        category: "LAYERING",
        title: "Tactile Texture Contrast",
        action: "Ensure the inner top and outer jacket contrast in fabric texture.",
        explanation: "Pairing smooth cotton or poplin with textured wool, corduroy, or suede creates visual richness.",
        stylingReason: "Monotonous flat fabrics look two-dimensional; tactile contrast creates depth and high-end editorial interest.",
        confidence: 0.91,
      });
    }

    const keyTakeaways = recommendations.slice(0, 3).map((r) => r.action);
    const overallSummary = `Tailored for ${occasion.toLowerCase().replace("_", " ")}: ${keyTakeaways.join(" ")}`;

    return {
      recommendations,
      overallSummary,
      silhouetteBalance,
      keyTakeaways,
    };
  }
}

export const styleRuleEvaluator = new StyleRuleEvaluator();
