export interface GarmentMaterialSlot {
  slotName: "main_fabric" | "secondary_trim" | "hardware" | "sole" | "lining";
  defaultRoughness: number;
  defaultMetalness: number;
}

export interface GarmentAssetDefinition {
  id: string;
  name: string;
  category: "TOP" | "BOTTOM" | "FOOTWEAR" | "OUTERWEAR" | "ACCESSORY" | "TIMEPIECE" | "EYEWEAR" | "HEADWEAR";
  subCategory: string;
  slot: "INNER_TOP" | "OUTER_TOP" | "BOTTOM" | "FOOTWEAR" | "WRIST" | "FACE" | "HEAD" | "ACCESSORY_PRIMARY";
  layerIndex: number; // 0: base layer, 1: outer jacket/coat
  supportedGenders: Array<"MALE" | "FEMALE" | "ANDROGYNOUS">;
  supportedFits: Array<"SLIM" | "REGULAR" | "RELAXED" | "OVERSIZED">;
  modelFileUrl: string; // Path to GLB asset in Supabase storage or static assets
  thumbnailUrl?: string;
  version: string;
  materialSlots: GarmentMaterialSlot[];
  attachmentBone: "Spine2" | "Hips" | "LeftFoot" | "RightFoot" | "LeftForeArm" | "Head";
  scaleOffset: [number, number, number];
  positionOffset: [number, number, number];
}

export const GARMENT_ASSET_CATALOG: GarmentAssetDefinition[] = [
  // 1. T-Shirts
  {
    id: "garment-tshirt-regular",
    name: "Classic Crewneck T-Shirt",
    category: "TOP",
    subCategory: "T-shirts",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM"],
    modelFileUrl: "/models/garments/tops/tshirt_crewneck.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.8, defaultMetalness: 0.05 },
      { slotName: "secondary_trim", defaultRoughness: 0.85, defaultMetalness: 0.02 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-tshirt-oversized",
    name: "Oversized Heavyweight T-Shirt",
    category: "TOP",
    subCategory: "T-shirts",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["OVERSIZED", "RELAXED"],
    modelFileUrl: "/models/garments/tops/tshirt_oversized.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.85, defaultMetalness: 0.02 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.08, 1.03, 1.08],
    positionOffset: [0, -0.02, 0],
  },

  // 2. Button-Down Shirts
  {
    id: "garment-shirt-oxford",
    name: "Tailored Oxford Shirt",
    category: "TOP",
    subCategory: "Shirts",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM", "RELAXED"],
    modelFileUrl: "/models/garments/tops/shirt_oxford.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.7, defaultMetalness: 0.05 },
      { slotName: "hardware", defaultRoughness: 0.3, defaultMetalness: 0.8 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.02, 1.01, 1.02],
    positionOffset: [0, 0, 0],
  },

  // 3. Polos
  {
    id: "garment-polo-piqué",
    name: "Knit Piqué Polo",
    category: "TOP",
    subCategory: "Polos",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM"],
    modelFileUrl: "/models/garments/tops/polo_knit.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.8, defaultMetalness: 0.05 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.01, 1.0, 1.01],
    positionOffset: [0, 0, 0],
  },

  // 4. Hoodies
  {
    id: "garment-hoodie-heavyweight",
    name: "Fleece Pullover Hoodie",
    category: "TOP",
    subCategory: "Hoodies",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["OVERSIZED", "RELAXED", "REGULAR"],
    modelFileUrl: "/models/garments/tops/hoodie_fleece.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.9, defaultMetalness: 0.01 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.1, 1.04, 1.1],
    positionOffset: [0, 0, 0],
  },

  // 5. Sweaters
  {
    id: "garment-sweater-crew",
    name: "Cashmere Crewneck Sweater",
    category: "TOP",
    subCategory: "Sweaters",
    slot: "INNER_TOP",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM", "RELAXED"],
    modelFileUrl: "/models/garments/tops/sweater_cashmere.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.88, defaultMetalness: 0.02 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.04, 1.02, 1.04],
    positionOffset: [0, 0, 0],
  },

  // 6. Jackets & Blazers (Outerwear: Layer Index 1)
  {
    id: "garment-jacket-blazer",
    name: "Single-Breasted Tailored Blazer",
    category: "OUTERWEAR",
    subCategory: "Blazers",
    slot: "OUTER_TOP",
    layerIndex: 1,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM"],
    modelFileUrl: "/models/garments/outerwear/blazer_tailored.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.65, defaultMetalness: 0.05 },
      { slotName: "lining", defaultRoughness: 0.35, defaultMetalness: 0.1 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.07, 1.03, 1.07], // Expanded outer shell to wrap over top
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-jacket-overcoat",
    name: "Double-Breasted Wool Overcoat",
    category: "OUTERWEAR",
    subCategory: "Coats",
    slot: "OUTER_TOP",
    layerIndex: 1,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["OVERSIZED", "REGULAR"],
    modelFileUrl: "/models/garments/outerwear/coat_wool.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.85, defaultMetalness: 0.02 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.12, 1.08, 1.12],
    positionOffset: [0, -0.05, 0],
  },
  {
    id: "garment-jacket-casual",
    name: "Minimalist Zip Jacket",
    category: "OUTERWEAR",
    subCategory: "Jackets",
    slot: "OUTER_TOP",
    layerIndex: 1,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "RELAXED"],
    modelFileUrl: "/models/garments/outerwear/jacket_zip.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.6, defaultMetalness: 0.1 },
      { slotName: "hardware", defaultRoughness: 0.2, defaultMetalness: 0.9 },
    ],
    attachmentBone: "Spine2",
    scaleOffset: [1.08, 1.03, 1.08],
    positionOffset: [0, 0, 0],
  },

  // 7. Bottoms: Trousers, Jeans, Chinos, Joggers, Shorts
  {
    id: "garment-trousers-pleated",
    name: "Single-Pleat Tailored Trousers",
    category: "BOTTOM",
    subCategory: "Trousers",
    slot: "BOTTOM",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "RELAXED", "SLIM"],
    modelFileUrl: "/models/garments/bottoms/trousers_pleated.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.7, defaultMetalness: 0.05 },
    ],
    attachmentBone: "Hips",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-jeans-straight",
    name: "Straight-Leg Selvedge Denim",
    category: "BOTTOM",
    subCategory: "Jeans",
    slot: "BOTTOM",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM", "RELAXED"],
    modelFileUrl: "/models/garments/bottoms/jeans_straight.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.8, defaultMetalness: 0.05 },
      { slotName: "hardware", defaultRoughness: 0.3, defaultMetalness: 0.8 },
    ],
    attachmentBone: "Hips",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-chinos-slim",
    name: "Tailored Chino Trousers",
    category: "BOTTOM",
    subCategory: "Chinos",
    slot: "BOTTOM",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "SLIM"],
    modelFileUrl: "/models/garments/bottoms/chinos_tailored.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.75, defaultMetalness: 0.05 },
    ],
    attachmentBone: "Hips",
    scaleOffset: [0.98, 1.0, 0.98],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-shorts-tailored",
    name: "Pleated Summer Shorts",
    category: "BOTTOM",
    subCategory: "Shorts",
    slot: "BOTTOM",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR", "RELAXED"],
    modelFileUrl: "/models/garments/bottoms/shorts_tailored.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.75, defaultMetalness: 0.05 },
    ],
    attachmentBone: "Hips",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-joggers-fleece",
    name: "Tapered Fleece Joggers",
    category: "BOTTOM",
    subCategory: "Joggers",
    slot: "BOTTOM",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["RELAXED", "REGULAR"],
    modelFileUrl: "/models/garments/bottoms/joggers_fleece.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.9, defaultMetalness: 0.02 },
    ],
    attachmentBone: "Hips",
    scaleOffset: [1.02, 1.0, 1.02],
    positionOffset: [0, 0, 0],
  },

  // 8. Footwear: Sneakers, Formal shoes, Loafers, Boots, Sandals
  {
    id: "garment-sneakers-minimal",
    name: "Minimalist Leather Low-Tops",
    category: "FOOTWEAR",
    subCategory: "Sneakers",
    slot: "FOOTWEAR",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/footwear/sneakers_lowtop.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.55, defaultMetalness: 0.05 },
      { slotName: "sole", defaultRoughness: 0.9, defaultMetalness: 0.01 },
    ],
    attachmentBone: "LeftFoot",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-loafers-penny",
    name: "Suede Penny Loafers",
    category: "FOOTWEAR",
    subCategory: "Loafers",
    slot: "FOOTWEAR",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/footwear/loafers_suede.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.8, defaultMetalness: 0.02 },
      { slotName: "sole", defaultRoughness: 0.6, defaultMetalness: 0.1 },
    ],
    attachmentBone: "LeftFoot",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-shoes-oxford",
    name: "Polished Oxford Shoes",
    category: "FOOTWEAR",
    subCategory: "Formal shoes",
    slot: "FOOTWEAR",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/footwear/oxfords_leather.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.35, defaultMetalness: 0.15 },
      { slotName: "sole", defaultRoughness: 0.5, defaultMetalness: 0.2 },
    ],
    attachmentBone: "LeftFoot",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-boots-chelsea",
    name: "Suede Chelsea Boots",
    category: "FOOTWEAR",
    subCategory: "Boots",
    slot: "FOOTWEAR",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/footwear/boots_chelsea.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.75, defaultMetalness: 0.05 },
    ],
    attachmentBone: "LeftFoot",
    scaleOffset: [1.02, 1.02, 1.02],
    positionOffset: [0, 0, 0],
  },

  // 9. Accessories: Timepieces, Eyewear, Hats
  {
    id: "garment-watch-chronograph",
    name: "Classic Chronograph 41mm",
    category: "ACCESSORY",
    subCategory: "Watches",
    slot: "WRIST",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/accessories/watch_chrono.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "hardware", defaultRoughness: 0.2, defaultMetalness: 0.95 },
      { slotName: "main_fabric", defaultRoughness: 0.45, defaultMetalness: 0.1 },
    ],
    attachmentBone: "LeftForeArm",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-eyewear-sunglasses",
    name: "Acetate Square Sunglasses",
    category: "ACCESSORY",
    subCategory: "Sunglasses",
    slot: "FACE",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/accessories/sunglasses_acetate.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.25, defaultMetalness: 0.1 },
    ],
    attachmentBone: "Head",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "garment-hat-cap",
    name: "Minimalist Wool Baseball Cap",
    category: "ACCESSORY",
    subCategory: "Caps",
    slot: "HEAD",
    layerIndex: 0,
    supportedGenders: ["MALE", "FEMALE", "ANDROGYNOUS"],
    supportedFits: ["REGULAR"],
    modelFileUrl: "/models/garments/accessories/cap_baseball.glb",
    version: "1.0.0",
    materialSlots: [
      { slotName: "main_fabric", defaultRoughness: 0.8, defaultMetalness: 0.05 },
    ],
    attachmentBone: "Head",
    scaleOffset: [1.0, 1.0, 1.0],
    positionOffset: [0, 0, 0],
  },
];
