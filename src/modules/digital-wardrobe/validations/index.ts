import { z } from "zod";

export const CreateWardrobeItemSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters").max(100),
  category: z.enum([
    "TOP",
    "BOTTOM",
    "FOOTWEAR",
    "OUTERWEAR",
    "ACCESSORY",
    "HEADWEAR",
    "EYEWEAR",
    "TIMEPIECE",
    "BAG",
    "JEWELRY",
  ]),
  subCategory: z.string().min(1, "Subcategory is required").max(60),
  brand: z.string().max(60).nullable().optional(),
  size: z.string().max(30).nullable().optional(),
  colorPrimary: z.string().min(1, "Primary color is required"),
  colorSecondary: z.string().nullable().optional(),
  pattern: z
    .enum([
      "SOLID",
      "STRIPED",
      "CHECKERED",
      "FLORAL",
      "GRAPHIC",
      "TEXTURED",
      "HERRINGBONE",
      "HOUNDSTOOTH",
      "PAISLEY",
    ])
    .default("SOLID"),
  material: z
    .enum([
      "COTTON",
      "LINEN",
      "WOOL",
      "CASHMERE",
      "SILK",
      "DENIM",
      "LEATHER",
      "SUEDE",
      "SYNTHETIC",
      "FLEECE",
      "BLEND",
    ])
    .default("COTTON"),
  fit: z.enum(["SLIM", "REGULAR", "RELAXED", "OVERSIZED"]).default("REGULAR"),
  style: z
    .enum([
      "MINIMALIST",
      "QUIET_LUXURY",
      "STREETWEAR",
      "CLASSIC_TAILORING",
      "SMART_CASUAL",
      "AVANT_GARDE",
      "ATHLEISURE",
      "OLD_MONEY",
      "MONOCHROME",
      "BOHEMIAN",
    ])
    .default("SMART_CASUAL"),
  formality: z
    .enum([
      "CASUAL",
      "SMART_CASUAL",
      "BUSINESS_CASUAL",
      "BUSINESS_FORMAL",
      "BLACK_TIE",
    ])
    .default("CASUAL"),
  seasonality: z
    .array(z.enum(["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"]))
    .min(1, "At least one season must be selected"),
  occasions: z
    .array(
      z.enum([
        "WORK",
        "DATE_NIGHT",
        "CASUAL_OUTING",
        "FORMAL_EVENT",
        "TRAVEL",
        "LOUNGE",
        "ATHLETIC",
        "GALA",
        "PARTY",
      ])
    )
    .default(["CASUAL_OUTING"]),
  status: z
    .enum(["AVAILABLE", "LAUNDRY", "UNAVAILABLE", "ARCHIVED"])
    .default("AVAILABLE"),
  imageUrl: z.string().nullable().optional(),
  storagePath: z.string().nullable().optional(),
  purchasePrice: z.number().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  isFavorite: z.boolean().default(false),
});

export const UpdateWardrobeItemSchema = CreateWardrobeItemSchema.partial();

export const WardrobeQueryFilterSchema = z.object({
  category: z.string().optional(),
  subCategory: z.string().optional(),
  status: z.string().optional(),
  formality: z.string().optional(),
  season: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["recently_added", "most_worn", "name", "brand"]).default("recently_added"),
  isFavorite: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type CreateWardrobeItemInput = z.infer<typeof CreateWardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof UpdateWardrobeItemSchema>;
export type WardrobeQueryFilter = z.infer<typeof WardrobeQueryFilterSchema>;
