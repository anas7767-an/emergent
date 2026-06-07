// Category → emoji mapping for product cards.
// Backgrounds alternate between navy (#003087) and light grey (#f5f5f5) for visual rhythm.

const CATEGORY_EMOJI: Record<string, string> = {
  Snacks: "🍟",
  Biscuits: "🍪",
  Noodles: "🍜",
  Staples: "🧂",
  Salt: "🧂",
  Detergent: "🧴",
  Beverages: "🍵",
  Tea: "🍵",
  Candy: "🍬",
  Spices: "🌶️",
  Oil: "🫙",
  Rice: "🌾",
  Atta: "🌾",
  FMCG: "📦",
  "Local Products": "🏪",
  D2C: "🛍️",
};

export function getCategoryEmoji(category?: string | null): string {
  if (!category) return "📦";
  return CATEGORY_EMOJI[category] || "📦";
}

// Stable navy/grey background based on product id for visual variety.
export function getProductTileBg(productId: number): {
  bg: string;
  ring: string;
  variant: "navy" | "grey";
} {
  const isNavy = productId % 2 === 1;
  return isNavy
    ? { bg: "bg-[#003087]", ring: "ring-[#FFD700]/30", variant: "navy" }
    : { bg: "bg-slate-100", ring: "ring-slate-200", variant: "grey" };
}
