export interface CategoryConfig {
  id: "TOP" | "BOTTOM" | "OUTERWEAR" | "FOOTWEAR" | "ACCESSORY";
  label: string;
  subcategories: string[];
}

export const WARDROBE_CATEGORIES: CategoryConfig[] = [
  {
    id: "TOP",
    label: "Tops",
    subcategories: ["T-shirts", "Shirts", "Polos", "Hoodies", "Sweaters"],
  },
  {
    id: "BOTTOM",
    label: "Bottoms",
    subcategories: ["Jeans", "Trousers", "Chinos", "Shorts", "Joggers"],
  },
  {
    id: "OUTERWEAR",
    label: "Outerwear",
    subcategories: ["Jackets", "Coats", "Blazers"],
  },
  {
    id: "FOOTWEAR",
    label: "Footwear",
    subcategories: ["Sneakers", "Formal shoes", "Loafers", "Boots", "Sandals"],
  },
  {
    id: "ACCESSORY",
    label: "Accessories",
    subcategories: [
      "Watches",
      "Belts",
      "Caps",
      "Hats",
      "Ties",
      "Bags",
      "Sunglasses",
      "Other accessories",
    ],
  },
];

export const ITEM_STATUS_CONFIG = {
  AVAILABLE: { label: "Available", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  LAUNDRY: { label: "Laundry", color: "bg-amber-50 text-amber-800 border-amber-200" },
  UNAVAILABLE: { label: "Unavailable", color: "bg-stone-100 text-stone-700 border-stone-200" },
  ARCHIVED: { label: "Archived", color: "bg-stone-200 text-stone-500 border-stone-300" },
} as const;

export const COLOR_PALETTE_PRESETS = [
  { label: "Noir", hex: "#181716" },
  { label: "Charcoal", hex: "#292624" },
  { label: "Flannel Grey", hex: "#4A4642" },
  { label: "Warm Ivory", hex: "#F5F2EB" },
  { label: "Camel", hex: "#B08968" },
  { label: "Oatmeal Sand", hex: "#D4C5B0" },
  { label: "Midnight Navy", hex: "#1E2A38" },
  { label: "Forest Olive", hex: "#3B4A3F" },
  { label: "Deep Burgundy", hex: "#4A2027" },
  { label: "Terracotta", hex: "#8C4F3B" },
  { label: "Warm Espresso", hex: "#332219" },
  { label: "Pure White", hex: "#FFFFFF" },
];

export const PATTERN_OPTIONS = [
  { value: "SOLID", label: "Solid" },
  { value: "STRIPED", label: "Striped" },
  { value: "CHECKERED", label: "Checkered / Plaid" },
  { value: "FLORAL", label: "Floral" },
  { value: "GRAPHIC", label: "Graphic" },
  { value: "TEXTURED", label: "Textured" },
  { value: "HERRINGBONE", label: "Herringbone" },
  { value: "HOUNDSTOOTH", label: "Houndstooth" },
  { value: "PAISLEY", label: "Paisley" },
];

export const FIT_OPTIONS = [
  { value: "SLIM", label: "Slim Fit" },
  { value: "REGULAR", label: "Regular Fit" },
  { value: "RELAXED", label: "Relaxed Fit" },
  { value: "OVERSIZED", label: "Oversized Fit" },
];

export const STYLE_OPTIONS = [
  { value: "MINIMALIST", label: "Minimalist" },
  { value: "QUIET_LUXURY", label: "Quiet Luxury" },
  { value: "STREETWEAR", label: "Streetwear" },
  { value: "CLASSIC_TAILORING", label: "Classic Tailoring" },
  { value: "SMART_CASUAL", label: "Smart Casual" },
  { value: "OLD_MONEY", label: "Old Money" },
  { value: "ATHLEISURE", label: "Sporty / Athleisure" },
  { value: "AVANT_GARDE", label: "Avant-Garde" },
];

export const FORMALITY_OPTIONS = [
  { value: "CASUAL", label: "Casual" },
  { value: "SMART_CASUAL", label: "Smart Casual" },
  { value: "BUSINESS_CASUAL", label: "Business Casual" },
  { value: "BUSINESS_FORMAL", label: "Business Formal" },
  { value: "BLACK_TIE", label: "Black Tie" },
];

export const SEASON_OPTIONS = [
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
  { value: "WINTER", label: "Winter" },
  { value: "ALL_SEASON", label: "All Season" },
];

export const OCCASION_OPTIONS = [
  { value: "WORK", label: "Work / Office" },
  { value: "DATE_NIGHT", label: "Date Night" },
  { value: "CASUAL_OUTING", label: "Casual Outing" },
  { value: "FORMAL_EVENT", label: "Formal Event" },
  { value: "TRAVEL", label: "Travel & Commute" },
  { value: "LOUNGE", label: "Lounge" },
  { value: "ATHLETIC", label: "Athletic" },
  { value: "GALA", label: "Gala & Black Tie" },
  { value: "PARTY", label: "Party" },
];
