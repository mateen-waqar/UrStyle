export interface ScoringWeights {
  colorCompatibility: number;
  styleConsistency: number;
  occasionSuitability: number;
  formalityCompatibility: number;
  seasonSuitability: number;
  patternCompatibility: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  colorCompatibility: 0.25,
  styleConsistency: 0.25,
  occasionSuitability: 0.20,
  formalityCompatibility: 0.15,
  seasonSuitability: 0.10,
  patternCompatibility: 0.05,
};

export const OCCASIONS_MAP = {
  UNIVERSITY: { label: "University", formality: "CASUAL", defaultStyles: ["CASUAL", "STREETWEAR", "MINIMALIST"] },
  OFFICE: { label: "Office", formality: "BUSINESS_CASUAL", defaultStyles: ["SMART_CASUAL", "CLASSIC_TAILORING", "QUIET_LUXURY"] },
  CASUAL_OUTING: { label: "Casual Outing", formality: "CASUAL", defaultStyles: ["CASUAL", "MINIMALIST", "STREETWEAR"] },
  DATE: { label: "Date", formality: "SMART_CASUAL", defaultStyles: ["SMART_CASUAL", "QUIET_LUXURY", "OLD_MONEY"] },
  PARTY: { label: "Party", formality: "SMART_CASUAL", defaultStyles: ["STREETWEAR", "AVANT_GARDE", "SMART_CASUAL"] },
  WEDDING: { label: "Wedding", formality: "BUSINESS_FORMAL", defaultStyles: ["CLASSIC_TAILORING", "OLD_MONEY", "QUIET_LUXURY"] },
  FORMAL_EVENT: { label: "Formal Event", formality: "BUSINESS_FORMAL", defaultStyles: ["CLASSIC_TAILORING", "OLD_MONEY"] },
  GYM: { label: "Gym", formality: "CASUAL", defaultStyles: ["ATHLEISURE"] },
  TRAVEL: { label: "Travel", formality: "CASUAL", defaultStyles: ["CASUAL", "MINIMALIST", "ATHLEISURE"] },
} as const;

export type OccasionInput = keyof typeof OCCASIONS_MAP;

export const STYLE_TYPES_MAP = {
  CASUAL: { label: "Casual", aesthetic: "CASUAL" },
  SMART_CASUAL: { label: "Smart Casual", aesthetic: "SMART_CASUAL" },
  FORMAL: { label: "Formal", aesthetic: "CLASSIC_TAILORING" },
  STREETWEAR: { label: "Streetwear", aesthetic: "STREETWEAR" },
  MINIMAL: { label: "Minimal", aesthetic: "MINIMALIST" },
  OLD_MONEY: { label: "Old Money", aesthetic: "OLD_MONEY" },
  SPORTY: { label: "Sporty", aesthetic: "ATHLEISURE" },
  BUSINESS_CASUAL: { label: "Business Casual", aesthetic: "SMART_CASUAL" },
} as const;

export type StyleInput = keyof typeof STYLE_TYPES_MAP;
